// Relance de panier abandonné : un client est allé jusqu'au paiement (il a
// saisi son e-mail) mais n'a pas payé. Le cron quotidien lui envoie UN e-mail
// neutre avec un lien qui remet son panier tel quel.
//
// - Seulement les tentatives non payées de 1 h à 48 h (le cron est
//   quotidien : plan Vercel Hobby) ;
// - jamais si le client a payé une commande depuis ;
// - une seule relance par e-mail sur 7 jours ;
// - aucun prix barré ni remise dans l'e-mail.
import { emailLayout, escapeHtml, euro, FROM_CHECKOUT, INBOX_CONTACT, sendEmail } from './email.js'

export const CART_REMINDER_COLUMN = 'cart_reminder_sent_at'
const HOUR_MS = 60 * 60 * 1000
const MIN_AGE_HOURS = 1
const MAX_AGE_HOURS = 48
const DEDUPE_DAYS = 7
const BATCH_LIMIT = 25
const SITE = 'https://www.theklope.com'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

// Panier compact dans l'URL : [[id, qty, variant?], …] en base64url. Il ne
// contient que des identifiants publics de produits, jamais de donnée client.
export function encodeCartForUrl(items = []) {
  const compact = items
    .filter((item) => item?.product_id && Number(item.qty) > 0)
    .slice(0, 30)
    .map((item) => {
      const variant = item.variant && Object.keys(item.variant).length ? item.variant : undefined
      return variant ? [item.product_id, Number(item.qty), variant] : [item.product_id, Number(item.qty)]
    })
  return Buffer.from(JSON.stringify(compact), 'utf8').toString('base64url')
}

export const cartRestoreUrl = (items) => `${SITE}/panier?reprise=${encodeCartForUrl(items)}`

export function cartReminderEmailHtml(order) {
  const name = String(order?.customer?.name || '').trim().split(/\s+/)[0]
  const items = order?.order_items || []
  const rows = items.map((item) => `
      <tr><td style="padding:6px 0;color:#e5e5e5">${escapeHtml(item.name)} × ${Number(item.qty)}</td>
      <td style="padding:6px 0;text-align:right;color:#e5e5e5">${euro(item.line_total)}</td></tr>`).join('')
  const bodyHtml = `
    <p style="font-size:15px;line-height:1.6;color:#e5e5e5;margin:0 0 14px">Bonjour${name ? ` ${escapeHtml(name)}` : ''},</p>
    <p style="font-size:14px;line-height:1.7;color:#ccc;margin:0 0 16px">
      Votre commande n’a pas été finalisée. Votre panier est toujours disponible :
    </p>
    <table style="width:100%;font-size:14px;border-top:1px solid #262626;border-bottom:1px solid #262626;margin:0 0 20px">${rows}</table>
    <div style="text-align:center;margin:0 0 20px">
      <a href="${escapeHtml(cartRestoreUrl(items))}" style="display:inline-block;background:#35FF8A;color:#050505;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
        Retrouver mon panier
      </a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#aaa;margin:0 0 8px">
      Un problème au moment du paiement ou une question sur un produit ? Répondez simplement à cet e-mail.
    </p>
    <p style="font-size:11px;line-height:1.6;color:#777;margin:16px 0 0">
      Vous recevez ce message unique parce que vous avez commencé une commande sur theklope.com.
    </p>`
  return emailLayout({ title: 'Votre panier vous attend', bodyHtml })
}

export async function sendCartReminders(client, { now = new Date(), send = sendEmail } = {}) {
  if (!client) return { count: 0, sent: 0 }
  const newest = new Date(now.getTime() - MIN_AGE_HOURS * HOUR_MS).toISOString()
  const oldest = new Date(now.getTime() - MAX_AGE_HOURS * HOUR_MS).toISOString()

  const { data: orders, error } = await client
    .from('orders')
    .select(`id, created_at, customer, customer_email, status, payment_status, ${CART_REMINDER_COLUMN}, order_items(product_id, name, qty, variant, line_total)`)
    .in('payment_status', ['unpaid', 'failed'])
    .in('status', ['pending_payment', 'cancelled'])
    .is(CART_REMINDER_COLUMN, null)
    .is('checkout_review_required_at', null)
    .gte('created_at', oldest)
    .lte('created_at', newest)
    .order('created_at', { ascending: false })
    .limit(BATCH_LIMIT)
  if (error) return { count: 0, sent: 0, error: error.message }
  if (!orders?.length) return { count: 0, sent: 0 }

  const emails = [...new Set(orders.map((o) => normalizeEmail(o.customer_email || o.customer?.email)).filter(Boolean))]
  const skip = new Set()
  if (emails.length) {
    // A payé depuis (même sur une autre tentative) ou déjà relancé récemment.
    const since = new Date(now.getTime() - DEDUPE_DAYS * 24 * HOUR_MS).toISOString()
    const { data: related, error: relatedError } = await client
      .from('orders')
      .select(`customer_email, payment_status, created_at, ${CART_REMINDER_COLUMN}`)
      .in('customer_email', emails)
      .gte('created_at', since)
    if (relatedError) return { count: orders.length, sent: 0, error: relatedError.message }
    for (const row of related || []) {
      if (row.payment_status === 'paid' || row[CART_REMINDER_COLUMN]) skip.add(normalizeEmail(row.customer_email))
    }
  }

  let sent = 0
  let skipped = 0
  for (const order of orders) {
    const email = normalizeEmail(order.customer_email || order.customer?.email)
    const stamp = new Date().toISOString()
    if (!email || skip.has(email) || !(order.order_items || []).length) {
      await client.from('orders').update({ [CART_REMINDER_COLUMN]: stamp }).eq('id', order.id).is(CART_REMINDER_COLUMN, null)
      skipped++
      continue
    }
    const { data: claimed, error: claimError } = await client
      .from('orders')
      .update({ [CART_REMINDER_COLUMN]: stamp })
      .eq('id', order.id)
      .is(CART_REMINDER_COLUMN, null)
      .select('id')
    if (claimError || !claimed?.length) continue
    skip.add(email)
    try {
      await send({
        from: FROM_CHECKOUT,
        to: email,
        replyTo: INBOX_CONTACT,
        subject: 'Votre panier THEKLOPE vous attend',
        html: cartReminderEmailHtml(order),
        idempotencyKey: `cart-reminder-${order.id}`,
      })
      sent++
    } catch (err) {
      skip.delete(email)
      await client.from('orders').update({ [CART_REMINDER_COLUMN]: null }).eq('id', order.id)
      console.error(`cart reminder ${order.id} failed:`, err?.message || err)
    }
  }
  return { count: orders.length, sent, skipped }
}
