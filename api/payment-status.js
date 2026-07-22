// =============================================================================
// GET /api/payment-status?order=TK-123456
// -----------------------------------------------------------------------------
// Utilisé par la page de retour après redirection Mollie. Relit le statut réel
// du paiement auprès de Mollie (et finalise la commande si payée), afin que la
// confirmation fonctionne même si le webhook n'est pas encore arrivé.
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { syncOrderFromMolliePayment } from './_lib/orders.js'
import { hasMollie } from './_lib/mollie.js'
import { setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'
import { CHECKOUT_ORDER_ID_RE } from './_lib/checkout.js'

const ORDER_STATUS_FIELDS = 'id, payment_id, payment_status, status, total, shipping, refund_status, checkout_review_required_at, checkout_review_reason'

export function publicPaymentStatus(order) {
  return {
    status: ['paid', 'refunded'].includes(order.payment_status)
      ? 'paid'
      : order.payment_status === 'failed' ? 'failed' : 'pending',
    order: {
      id: order.id,
      total: order.total,
      shipping: order.shipping,
      status: order.status,
      refundStatus: order.refund_status || null,
      reviewRequired: Boolean(order.checkout_review_required_at || order.checkout_review_reason),
      reviewReason: order.checkout_review_reason || null,
    },
  }
}

export default async function handler(req, res) {
  setNoStore(res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin || !hasMollie) {
    return res.status(500).json({ error: 'Paiement non configuré côté serveur.' })
  }

  const orderId = req.query?.order || new URL(req.url, 'http://x').searchParams.get('order')
  if (!orderId) return res.status(400).json({ error: 'Paramètre order manquant.' })
  if (!CHECKOUT_ORDER_ID_RE.test(String(orderId))) {
    return res.status(400).json({ error: 'Identifiant de commande invalide.' })
  }

  try {
    const rateLimit = await enforceRequestRateLimits(req, [
      { scope: 'payment_status_ip', limit: 60, windowSeconds: 900 },
      { scope: 'payment_status_order', value: String(orderId), limit: 20, windowSeconds: 900 },
    ])
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter))
      return res.status(429).json({ error: 'Trop de vérifications. Réessayez dans quelques minutes.' })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(ORDER_STATUS_FIELDS)
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })

    // Si pas encore payée, on interroge Mollie pour rafraîchir (et finaliser).
    const statusBeforeSync = publicPaymentStatus(order).status
    const requiresRecovery = ['stock_issue', 'refund_pending', 'refund_failed'].includes(order.status)
      || Boolean(order.refund_status)
    const alreadyUnderReview = order.checkout_review_required_at || order.checkout_review_reason
    let finalOrder = order
    if (order.payment_id && !alreadyUnderReview && (statusBeforeSync === 'pending' || requiresRecovery)) {
      try {
        await syncOrderFromMolliePayment(order.payment_id)
      } catch (syncError) {
        // A second matching Mollie payment is durably latched for manual review.
        // Return that safe public state instead of encouraging another payment.
        if (syncError.code !== 'multiple_payments_for_order') throw syncError
      }
      const { data: refreshed, error: refreshError } = await supabaseAdmin
        .from('orders')
        .select(ORDER_STATUS_FIELDS)
        .eq('id', orderId)
        .maybeSingle()
      if (refreshError) throw refreshError
      if (refreshed) finalOrder = refreshed
    }

    return res.status(200).json(publicPaymentStatus(finalOrder))
  } catch (err) {
    console.error('payment-status error:', err)
    return res.status(500).json({ error: err.message })
  }
}
