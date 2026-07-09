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

async function sendStockIssueEmail(orderId, items = []) {
  const details = items
    .map((item) => {
      const name = escapeHtml(item.name || item.productId || 'Produit')
      return `<li>${name} — demandé : ${Number(item.requested || 0)}, disponible : ${Number(item.available || 0)}</li>`
    })
    .join('')

  await sendEmail({
    from: FROM_CHECKOUT,
    to: INBOX_CHECKOUT,
    subject: `Incident stock sur commande payée ${orderId}`,
    html: emailLayout({
      title: `Incident stock ${escapeHtml(orderId)}`,
      bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">La commande <strong style="color:#35FF8A">${escapeHtml(orderId)}</strong> est payée, mais le stock disponible ne permet pas une préparation automatique.</p><ul style="font-size:14px;color:#e5e5e5;line-height:1.7">${details}</ul><p style="font-size:13px;color:#9aa0a6">Action requise : contacter le client, expédier une alternative ou rembourser.</p>`,
    }),
  })
}

async function finalizePaidOrder(orderId) {
  const { data, error } = await supabaseAdmin.rpc('finalize_paid_order', { p_order_id: orderId })
  if (error) throw error
  return data || { ok: false, status: 'unknown' }
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
    .select('id, payment_status, payment_id')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return { status: 'unknown' }

  if (order.payment_id !== paymentId) {
    const { error: linkErr } = await supabaseAdmin
      .from('orders')
      .update({ payment_id: paymentId })
      .eq('id', orderId)
    if (linkErr) console.error('payment_id link error:', linkErr)
  }

  const isPaid = typeof payment.isPaid === 'function' ? payment.isPaid() : payment.status === 'paid'

  if (isPaid) {
    if (order.payment_status !== 'paid') {
      const finalization = await finalizePaidOrder(orderId)

      if (finalization.status === 'stock_issue') {
        try {
          await sendStockIssueEmail(orderId, finalization.items || [])
        } catch (err) {
          console.error('stock issue email error:', err)
        }
        return { status: 'paid', orderId, orderStatus: 'stock_issue' }
      }

      // E-mails de confirmation (client + interne). Non bloquant. On les envoie
      // seulement quand la commande peut réellement passer en préparation.
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
