// Finalisation des commandes à partir du statut Mollie — logique partagée entre
// le webhook et l'endpoint de statut. Idempotent : peut être appelé plusieurs fois.
import { mollie } from './mollie.js'
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'

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
