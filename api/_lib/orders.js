// Finalisation des commandes à partir du statut Mollie — logique partagée entre
// le webhook et l'endpoint de statut. Idempotent : peut être appelé plusieurs fois.
import { mollie } from './mollie.js'
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'
import { sendEmail, emailLayout, escapeHtml, euro, FROM_CHECKOUT, INBOX_CHECKOUT } from './email.js'

// Envoie la confirmation client + la notification interne (checkout@).
// Tolérant aux erreurs : ne doit jamais faire échouer la finalisation de commande.
async function sendOrderConfirmationEmails(orderId) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, customer, address, subtotal, discount, shipping_cost, total, order_items(name, qty, price, line_total)')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return

  const customer = order.customer || {}
  const address = order.address || {}
  const items = order.order_items || []
  const rows = items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;color:#e5e5e5">${escapeHtml(it.name)} × ${Number(it.qty)}</td><td style="padding:6px 0;text-align:right;color:#e5e5e5">${euro(it.line_total)}</td></tr>`,
    )
    .join('')
  const totalsHtml = `
    <table style="width:100%;border-top:1px solid #262626;margin-top:12px;padding-top:12px;font-size:14px">
      <tr><td style="padding:3px 0;color:#9aa0a6">Sous-total</td><td style="padding:3px 0;text-align:right">${euro(order.subtotal)}</td></tr>
      ${Number(order.discount) > 0 ? `<tr><td style="padding:3px 0;color:#9aa0a6">Remise</td><td style="padding:3px 0;text-align:right;color:#35FF8A">- ${euro(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:3px 0;color:#9aa0a6">Livraison</td><td style="padding:3px 0;text-align:right">${Number(order.shipping_cost) > 0 ? euro(order.shipping_cost) : 'Offerte'}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;color:#fff">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;color:#fff">${euro(order.total)}</td></tr>
    </table>`
  const itemsTable = `<table style="width:100%;font-size:14px">${rows}</table>${totalsHtml}`
  const addressHtml = `${escapeHtml(customer.name || '')}<br>${escapeHtml(address.street || '')} ${escapeHtml(address.extra || '')}<br>${escapeHtml(address.zip || '')} ${escapeHtml(address.city || '')} — ${escapeHtml(address.country || '')}`

  // 1. Confirmation client
  if (customer.email) {
    await sendEmail({
      from: FROM_CHECKOUT,
      to: customer.email,
      subject: `Confirmation de votre commande ${order.id} — THEKLOPE`,
      html: emailLayout({
        title: 'Merci pour votre commande !',
        bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">Bonjour ${escapeHtml(customer.name || '')},<br>Votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong> a bien été payée et confirmée. Nous la préparons.</p>${itemsTable}<p style="font-size:13px;color:#9aa0a6;margin-top:20px">Livraison à :<br>${addressHtml}</p>`,
      }),
    })
  }

  // 2. Notification interne
  await sendEmail({
    from: FROM_CHECKOUT,
    to: INBOX_CHECKOUT,
    replyTo: customer.email || undefined,
    subject: `Nouvelle commande payée ${order.id} — ${euro(order.total)}`,
    html: emailLayout({
      title: `Commande payée ${escapeHtml(order.id)}`,
      bodyHtml: `<p style="font-size:14px;color:#cfcfcf">Client : ${escapeHtml(customer.name || '')} — ${escapeHtml(customer.email || '')} — ${escapeHtml(customer.phone || '')}</p>${itemsTable}<p style="font-size:13px;color:#9aa0a6;margin-top:20px">Adresse :<br>${addressHtml}</p>`,
    }),
  })
}

async function decrementStock(orderId) {
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('product_id, qty')
    .eq('order_id', orderId)

  for (const item of orderItems || []) {
    if (!item.product_id) continue
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .maybeSingle()
    if (product) {
      const nextStock = Math.max(0, (Number(product.stock) || 0) - (Number(item.qty) || 0))
      await supabaseAdmin.from('products').update({ stock: nextStock }).eq('id', item.product_id)
    }
  }
}

// Récupère le paiement Mollie, met à jour la commande correspondante et renvoie
// son statut normalisé : 'paid' | 'pending' | 'failed'.
export async function syncOrderFromMolliePayment(paymentId) {
  if (!hasSupabaseAdmin || !mollie) return { status: 'unknown' }

  const payment = await mollie.payments.get(paymentId)
  const orderId = payment.metadata?.orderId
  if (!orderId) return { status: 'unknown' }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return { status: 'unknown' }

  const isPaid = typeof payment.isPaid === 'function' ? payment.isPaid() : payment.status === 'paid'

  if (isPaid) {
    if (order.payment_status !== 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', orderId)
      await decrementStock(orderId)
      // E-mails de confirmation (client + interne). Non bloquant.
      try {
        await sendOrderConfirmationEmails(orderId)
      } catch (err) {
        console.error('order email error:', err)
      }
    }
    return { status: 'paid', orderId }
  }

  if (['failed', 'canceled', 'expired'].includes(payment.status)) {
    if (order.payment_status !== 'failed') {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', orderId)
    }
    return { status: 'failed', orderId }
  }

  return { status: 'pending', orderId }
}
