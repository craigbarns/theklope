// =============================================================================
// POST /api/cancel-order — explicit, authenticated cancellation/refund workflow.
// Unpaid orders release their stock reservation only after Mollie confirms a
// terminal/canceled payment. Paid, unshipped orders request a full refund.
// =============================================================================
import { authenticateAdminRequest } from './_lib/adminAuth.js'
import {
  CHECKOUT_ORDER_ID_RE,
  findMolliePaymentsForOrder,
  hasUnexpectedMolliePaymentExposure,
  molliePaymentHasChargeback,
} from './_lib/checkout.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { hasMollie, mollie, mollieConfigurationError } from './_lib/mollie.js'
import {
  ensureFullOrderRefund,
  syncOrderFromMolliePayment,
  validateMolliePaymentForOrder,
} from './_lib/orders.js'
import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'

export const ORDER_FIELDS = 'id, created_at, status, payment_status, payment_id, payment_create_status, payment_create_started_at, stock_reservation_status, total, refund_id, refund_status, refund_reason, checkout_review_required_at, checkout_review_reason'

export const isMultiplePaymentReview = (order) => (
  order?.checkout_review_reason === 'multiple_payments_for_order'
)

export const isChargebackReview = (order) => (
  order?.checkout_review_reason === 'payment_chargeback_detected'
)

export const cancellationRecoveryRequiresReview = (payments, linkedPaymentId) => (
  hasUnexpectedMolliePaymentExposure(payments, linkedPaymentId)
)

export const isStrictLegacyUnlinkedOrder = (order) => (
  order?.status === 'pending_payment'
  && order?.payment_status === 'unpaid'
  && order?.stock_reservation_status === 'none'
)

async function getOrder(orderId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw error
  return data
}

async function flagCancellationReview(orderId, reason) {
  let query = supabaseAdmin
    .from('orders')
    .update({
      checkout_review_required_at: new Date().toISOString(),
      checkout_review_reason: reason,
    })
    .eq('id', orderId)
  if (reason === 'multiple_payments_for_order') {
    query = query.or('checkout_review_reason.is.null,checkout_review_reason.neq.payment_chargeback_detected')
  }
  const { error } = await query
  if (error) throw error
}

async function matchingMolliePayments(order) {
  const recentPayments = [...await mollie.payments.page({ limit: 250 })]
  if (order.payment_id && !recentPayments.some(({ id }) => id === order.payment_id)) {
    recentPayments.push(await mollie.payments.get(order.payment_id))
  }
  return findMolliePaymentsForOrder(recentPayments, order)
}

function responseOrder(order, override = {}) {
  return {
    id: order.id,
    status: override.status || order.status,
    paymentStatus: override.paymentStatus || order.payment_status,
    refundStatus: override.refundStatus ?? order.refund_status ?? null,
  }
}

async function cancelOrRefundLinkedOrder(order, reason) {
  const payment = await mollie.payments.get(order.payment_id)
  validateMolliePaymentForOrder(payment, order, order.payment_id)
  const isPaid = typeof payment.isPaid === 'function' ? payment.isPaid() : payment.status === 'paid'

  if (isPaid) {
    await syncOrderFromMolliePayment(order.payment_id)
    const refreshed = await getOrder(order.id)
    if (isChargebackReview(refreshed) || isMultiplePaymentReview(refreshed)) {
      const reviewError = new Error('Une vérification financière manuelle bloque ce remboursement.')
      reviewError.code = 'review_required'
      throw reviewError
    }
    if (refreshed.payment_status === 'refunded') {
      return {
        action: 'already_refunded',
        order: responseOrder(refreshed),
      }
    }
    const refund = await ensureFullOrderRefund(refreshed, reason, { allowRetry: true })
    return {
      action: refund.refundStatus === 'refunded' ? 'refunded' : 'refund_requested',
      order: responseOrder(refreshed, {
        status: refund.orderStatus,
        paymentStatus: refund.refundStatus === 'refunded' ? 'refunded' : 'paid',
        refundStatus: refund.refundStatus,
      }),
    }
  }

  if (!['failed', 'canceled', 'expired'].includes(payment.status)) {
    if (!payment.isCancelable) {
      const error = new Error('Ce paiement est encore susceptible d’être encaissé et ne peut pas être annulé automatiquement.')
      error.code = 'payment_not_cancelable'
      throw error
    }
    const canceled = await mollie.payments.cancel(order.payment_id, {
      idempotencyKey: `tk-cancel-${order.id}`,
    })
    if (!['failed', 'canceled', 'expired'].includes(canceled.status)) {
      const error = new Error('Mollie n’a pas encore confirmé l’annulation du paiement.')
      error.code = 'payment_not_terminal'
      throw error
    }
  }
  return null
}

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })
  if (!hasMollie) return res.status(500).json({ error: `Paiement non configuré (${mollieConfigurationError})` })

  const adminAuth = await authenticateAdminRequest(req)
  if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Corps JSON invalide.' })
  }

  const orderId = String(body.orderId || '').trim()
  const reason = String(body.reason || 'Annulation demandée par un administrateur')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, 500)
  if (!CHECKOUT_ORDER_ID_RE.test(orderId)) {
    return res.status(400).json({ error: 'Identifiant de commande invalide.' })
  }

  try {
    let order = await getOrder(orderId)
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })
    if (isChargebackReview(order)) {
      return res.status(409).json({
        error: 'Un chargeback Mollie est rattaché à cette commande. Réconciliation financière manuelle obligatoire.',
      })
    }
    if (isMultiplePaymentReview(order)) {
      // A bounded global Mollie page can never prove that an older duplicate
      // does not exist. This latch is therefore cleared only by an operator
      // after reconciling every known provider payment ID.
      return res.status(409).json({
        error: 'Plusieurs paiements Mollie sont à réconcilier manuellement avant toute annulation ou livraison.',
      })
    }

    let recoveredPayments = []
    if (order.payment_id
      || ['creating', 'failed'].includes(order.payment_create_status)) {
      recoveredPayments = await matchingMolliePayments(order)
      if (recoveredPayments.some(molliePaymentHasChargeback)) {
        await flagCancellationReview(order.id, 'payment_chargeback_detected')
        return res.status(409).json({
          error: 'Un chargeback Mollie est rattaché à cette commande. Réconciliation financière manuelle obligatoire.',
        })
      }
      if (cancellationRecoveryRequiresReview(recoveredPayments, order.payment_id)) {
        await flagCancellationReview(order.id, 'multiple_payments_for_order')
        return res.status(409).json({
          error: 'Plusieurs paiements Mollie peuvent être encaissés pour cette commande. Intervention Mollie manuelle requise.',
        })
      }
    }
    if (order.payment_status === 'refunded') {
      return res.status(200).json({ ok: true, action: 'already_refunded', order: responseOrder(order) })
    }
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(409).json({ error: 'Une commande expédiée ou livrée exige un traitement manuel.' })
    }

    if (!order.payment_id && ['creating', 'failed'].includes(order.payment_create_status)) {
      const recoveredPayment = recoveredPayments[0]
      if (recoveredPayment) {
        const { data: linked, error: linkError } = await supabaseAdmin.rpc('link_order_payment', {
          p_order_id: order.id,
          p_payment_id: recoveredPayment.id,
          p_checkout_url: typeof recoveredPayment.getCheckoutUrl === 'function'
            ? recoveredPayment.getCheckoutUrl()
            : recoveredPayment._links?.checkout?.href || null,
          p_expires_at: recoveredPayment.expiresAt || null,
        })
        if (linkError) throw linkError
        if (!linked?.ok) {
          if (linked?.status !== 'order_not_payable' || !isStrictLegacyUnlinkedOrder(order)) {
            return res.status(409).json({ error: `Paiement en cours non rattaché (${linked?.status || 'unknown'}).` })
          }
          const { data: recoveredLegacy, error: recoveryError } = await supabaseAdmin.rpc('record_late_paid_order', {
            p_order_id: order.id,
            p_payment_id: recoveredPayment.id,
          })
          if (recoveryError) throw recoveryError
          if (!recoveredLegacy?.ok || recoveredLegacy.status !== 'legacy_linked') {
            return res.status(409).json({ error: `Paiement legacy non rattaché (${recoveredLegacy?.status || 'unknown'}).` })
          }
        }
        order.payment_id = recoveredPayment.id
      } else if (order.payment_create_status === 'creating') {
        const startedAt = Date.parse(order.payment_create_started_at || '')
        if (!Number.isFinite(startedAt) || Date.now() - startedAt < 10 * 60 * 1000) {
          return res.status(409).json({
            error: 'La création du paiement est encore en cours. Réessayez dans quelques minutes.',
          })
        }
        await flagCancellationReview(order.id, 'ambiguous_payment_creation')
        return res.status(409).json({
          error: 'La recherche Mollie bornée ne peut pas exclure un ancien paiement. Vérification Mollie exhaustive requise avant de libérer le stock.',
        })
      } else {
        // A failed external POST is ambiguous too: Mollie may have accepted it
        // before the transport error. Never use a bounded global page as proof
        // that an old payment does not exist.
        await flagCancellationReview(order.id, 'ambiguous_payment_creation')
        return res.status(409).json({
          error: 'La création Mollie a échoué de façon ambiguë. Vérification Mollie exhaustive requise avant de libérer le stock.',
        })
      }
    }

    if (order.payment_id) {
      const result = await cancelOrRefundLinkedOrder(order, reason)
      if (result) return res.status(200).json({ ok: true, ...result })
    } else if (order.payment_status === 'paid') {
      return res.status(409).json({ error: 'Commande payée sans identifiant Mollie : intervention manuelle requise.' })
    }

    let { data: released, error: releaseError } = await supabaseAdmin.rpc('release_order_resources', {
      p_order_id: order.id,
      p_reason: reason,
      p_require_no_payment: !order.payment_id,
    })
    if (releaseError) throw releaseError

    // A concurrent create-payment may have linked Mollie after our initial
    // read. The atomic DB guard refuses release; reload and follow the verified
    // cancel/refund path instead of racing stock restoration against payment.
    if (!released?.ok && released?.status === 'payment_exists') {
      order = await getOrder(orderId)
      if (!order?.payment_id) {
        return res.status(409).json({ error: 'Le paiement vient de changer. Rechargez puis réessayez.' })
      }
      const racePayments = await matchingMolliePayments(order)
      if (racePayments.some(molliePaymentHasChargeback)) {
        await flagCancellationReview(order.id, 'payment_chargeback_detected')
        return res.status(409).json({
          error: 'Un chargeback Mollie est rattaché à cette commande. Réconciliation financière manuelle obligatoire.',
        })
      }
      if (cancellationRecoveryRequiresReview(racePayments, order.payment_id)) {
        await flagCancellationReview(order.id, 'multiple_payments_for_order')
        return res.status(409).json({
          error: 'Plusieurs paiements Mollie peuvent être encaissés pour cette commande. Intervention Mollie manuelle requise.',
        })
      }
      const result = await cancelOrRefundLinkedOrder(order, reason)
      if (result) return res.status(200).json({ ok: true, ...result })
      ;({ data: released, error: releaseError } = await supabaseAdmin.rpc('release_order_resources', {
        p_order_id: order.id,
        p_reason: reason,
        p_require_no_payment: false,
      }))
      if (releaseError) throw releaseError
    }
    if (!released?.ok) {
      return res.status(409).json({ error: `Annulation refusée (${released?.status || 'unknown'}).` })
    }

    order = await getOrder(orderId)
    return res.status(200).json({ ok: true, action: 'cancelled', order: responseOrder(order) })
  } catch (error) {
    console.error('cancel-order error:', error)
    const conflictCodes = new Set([
      'already_fulfilled',
      'already_shipped',
      'not_paid',
      'refund_failed',
      'refund_retry_exhausted',
      'payment_not_cancelable',
      'payment_not_terminal',
      'review_required',
    ])
    const status = conflictCodes.has(error.code) ? 409 : 500
    return res.status(status).json({ error: error.message || 'Erreur serveur annulation.' })
  }
}
