// Daily Vercel cron: reconcile stale checkout reservations against Mollie.
// Ambiguous unlinked creations are deliberately never released automatically;
// they are durably flagged for admin review instead.
import {
  findMolliePaymentsForOrder,
  hasUnexpectedMolliePaymentExposure,
  molliePaymentHasChargeback,
} from './_lib/checkout.js'
import { isAuthorizedCronRequest, isSafelyUnstartedCheckout } from './_lib/cronAuth.js'
import { setNoStore } from './_lib/httpSecurity.js'
import { hasMollie, mollie } from './_lib/mollie.js'
import {
  retryOrderConfirmationEmails,
  retryRefundConfirmationEmail,
  syncOrderFromMolliePayment,
} from './_lib/orders.js'
import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'

const BATCH_LIMIT = 50
const STALE_AFTER_MS = 2 * 60 * 60 * 1000

async function processOrder(order, recentPayments) {
  // Claim the round-robin cursor before external work so a permanently broken
  // Mollie/order record cannot monopolize the oldest batch on every run.
  const reconciliationStartedAt = new Date().toISOString()
  const { error: cursorError } = await supabaseAdmin
    .from('orders')
    .update({ checkout_last_reconciled_at: reconciliationStartedAt })
    .eq('id', order.id)
  if (cursorError) throw cursorError

  if (order.checkout_review_reason === 'payment_chargeback_detected') {
    return { id: order.id, action: 'financial_review_latched' }
  }
  const multiplePaymentReviewLatched = order.checkout_review_reason === 'multiple_payments_for_order'

  let recoveryPayments = [...(recentPayments || [])]
  if (order.payment_id && !recoveryPayments.some(({ id }) => id === order.payment_id)) {
    recoveryPayments = [...recoveryPayments, await mollie.payments.get(order.payment_id)]
  }
  const matchingPayments = findMolliePaymentsForOrder(recoveryPayments, order)
  if (matchingPayments.some(molliePaymentHasChargeback)) {
    const { error: reviewError } = await supabaseAdmin
      .from('orders')
      .update({
        checkout_review_required_at: new Date().toISOString(),
        checkout_review_reason: 'payment_chargeback_detected',
      })
      .eq('id', order.id)
    if (reviewError) throw reviewError
    return { id: order.id, action: 'chargeback_review_required' }
  }
  if (multiplePaymentReviewLatched) {
    return { id: order.id, action: 'financial_review_latched' }
  }
  if (hasUnexpectedMolliePaymentExposure(matchingPayments, order.payment_id)) {
    const { error: reviewError } = await supabaseAdmin
      .from('orders')
      .update({
        checkout_review_required_at: new Date().toISOString(),
        checkout_review_reason: 'multiple_payments_for_order',
      })
      .eq('id', order.id)
      .or('checkout_review_reason.is.null,checkout_review_reason.neq.payment_chargeback_detected')
    if (reviewError) throw reviewError
    return { id: order.id, action: 'multiple_payments_review_required' }
  }

  if (order.payment_id) {
    const result = await syncOrderFromMolliePayment(order.payment_id)
    return { id: order.id, action: `mollie_${result.status}` }
  }

  const recovered = matchingPayments[0]
  if (recovered) {
    const result = await syncOrderFromMolliePayment(recovered.id)
    return { id: order.id, action: `recovered_${result.status}` }
  }

  if (isSafelyUnstartedCheckout(order)) {
    const { data, error } = await supabaseAdmin.rpc('release_order_resources', {
      p_order_id: order.id,
      p_reason: 'Nettoyage automatique : création de paiement jamais démarrée',
      p_require_no_payment: true,
      p_require_unstarted: true,
    })
    if (error) throw error
    return { id: order.id, action: data?.ok ? 'released_unstarted' : `kept_${data?.status || 'unknown'}` }
  }

  const { error: alertError } = await supabaseAdmin
    .from('orders')
    .update({
      checkout_review_required_at: new Date().toISOString(),
      checkout_review_reason: 'ambiguous_payment_creation',
      checkout_last_reconciled_at: reconciliationStartedAt,
    })
    .eq('id', order.id)
    .or('checkout_review_reason.is.null,checkout_review_reason.not.in.(multiple_payments_for_order,payment_chargeback_detected)')
  if (alertError) throw alertError
  return { id: order.id, action: 'admin_review_required' }
}

export default async function handler(req, res) {
  setNoStore(res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!isAuthorizedCronRequest(req)) return res.status(401).json({ error: 'Cron non autorisé.' })
  if (!hasSupabaseAdmin || !hasMollie) {
    return res.status(500).json({ error: 'Paiement ou base de données non configuré.' })
  }

  try {
    const now = Date.now()
    const cutoff = new Date(now - STALE_AFTER_MS).toISOString()
    const reviewRecheckCutoff = new Date(now - 20 * 60 * 60 * 1000).toISOString()
    const checkoutFields = 'id, created_at, checkout_idempotency_key, payment_id, payment_create_status, payment_create_started_at, payment_status, status, stock_reservation_status, total, checkout_review_required_at, checkout_review_reason, checkout_last_reconciled_at'
    const [
      unreviewedResult,
      reviewResult,
      emailResult,
      refundWorkflowResult,
      refundEmailResult,
    ] = await Promise.all([
      supabaseAdmin
      .from('orders')
        .select(checkoutFields)
        .eq('status', 'pending_payment')
        .eq('payment_status', 'unpaid')
        .eq('stock_reservation_status', 'reserved')
        .is('checkout_review_required_at', null)
        .lt('created_at', cutoff)
        .or(`checkout_last_reconciled_at.is.null,checkout_last_reconciled_at.lt.${reviewRecheckCutoff}`)
        .order('checkout_last_reconciled_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(40),
      supabaseAdmin
        .from('orders')
        .select(checkoutFields)
        .eq('status', 'pending_payment')
        .eq('payment_status', 'unpaid')
        .eq('stock_reservation_status', 'reserved')
        .not('checkout_review_required_at', 'is', null)
        .or(`checkout_last_reconciled_at.is.null,checkout_last_reconciled_at.lt.${reviewRecheckCutoff}`)
        .order('checkout_last_reconciled_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(BATCH_LIMIT - 40),
      supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_status', 'paid')
        .in('status', ['processing', 'ready_for_pickup', 'shipped', 'delivered'])
        .is('checkout_review_required_at', null)
        .is('checkout_review_reason', null)
        .or('confirmation_customer_email_sent_at.is.null,confirmation_admin_email_sent_at.is.null')
        .or(`confirmation_email_last_attempt_at.is.null,confirmation_email_last_attempt_at.lt.${reviewRecheckCutoff}`)
        .order('confirmation_email_last_attempt_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(25),
      supabaseAdmin
        .from('orders')
        .select('id, payment_id, status, refund_status')
        .eq('payment_status', 'paid')
        .not('payment_id', 'is', null)
        .in('status', ['stock_issue', 'refund_pending', 'refund_failed'])
        .or('refund_status.in.(requested,queued,pending,processing),and(status.eq.stock_issue,refund_status.is.null),and(status.eq.refund_failed,refund_status.in.(failed,canceled))')
        .or(`checkout_last_reconciled_at.is.null,checkout_last_reconciled_at.lt.${reviewRecheckCutoff}`)
        .order('checkout_last_reconciled_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(25),
      supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_status', 'refunded')
        .is('refund_email_sent_at', null)
        .is('checkout_review_required_at', null)
        .is('checkout_review_reason', null)
        .or(`refund_email_last_attempt_at.is.null,refund_email_last_attempt_at.lt.${reviewRecheckCutoff}`)
        .order('refund_email_last_attempt_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(25),
    ])
    if (unreviewedResult.error) throw unreviewedResult.error
    if (reviewResult.error) throw reviewResult.error
    if (emailResult.error) throw emailResult.error
    if (refundWorkflowResult.error) throw refundWorkflowResult.error
    if (refundEmailResult.error) throw refundEmailResult.error

    const candidates = [...(unreviewedResult.data || []), ...(reviewResult.data || [])]
    const needsRecoveryScan = candidates.length > 0
    const recentPayments = needsRecoveryScan
      ? await mollie.payments.page({ limit: 250 })
      : []

    const results = []
    // Small chunks cap external pressure and keep one broken order from
    // preventing reconciliation of the rest of the bounded batch.
    for (let index = 0; index < candidates.length; index += 5) {
      const chunk = candidates.slice(index, index + 5)
      const settled = await Promise.allSettled(
        chunk.map((order) => processOrder(order, recentPayments)),
      )
      settled.forEach((result, offset) => {
        if (result.status === 'fulfilled') results.push(result.value)
        else results.push({
          id: chunk[offset].id,
          action: 'error',
          error: String(result.reason?.message || result.reason || 'unknown').slice(0, 300),
        })
      })
    }

    const reviewIds = results
      .filter((result) => result.action === 'admin_review_required')
      .map((result) => result.id)
    if (reviewIds.length) {
      console.error('checkout reservations require admin review:', reviewIds.join(', '))
    }

    const emailRetries = []
    const emailOrders = emailResult.data || []
    for (let index = 0; index < emailOrders.length; index += 5) {
      const chunk = emailOrders.slice(index, index + 5)
      const settled = await Promise.allSettled(
        chunk.map((order) => retryOrderConfirmationEmails(order.id)),
      )
      settled.forEach((result, offset) => {
        emailRetries.push({
          id: chunk[offset].id,
          ok: result.status === 'fulfilled',
          ...(result.status === 'fulfilled'
            ? { sent: Boolean(result.value?.sent), alreadySent: Boolean(result.value?.alreadySent) }
            : { error: String(result.reason?.message || result.reason || 'unknown').slice(0, 300) }),
        })
      })
    }

    const refundRetries = []
    const refundOrders = refundWorkflowResult.data || []
    for (let index = 0; index < refundOrders.length; index += 5) {
      const chunk = refundOrders.slice(index, index + 5)
      const settled = await Promise.allSettled(chunk.map(async (order) => {
        const { error: cursorError } = await supabaseAdmin
          .from('orders')
          .update({ checkout_last_reconciled_at: new Date().toISOString() })
          .eq('id', order.id)
        if (cursorError) throw cursorError
        return syncOrderFromMolliePayment(order.payment_id)
      }))
      settled.forEach((result, offset) => {
        refundRetries.push({
          id: chunk[offset].id,
          ok: result.status === 'fulfilled',
          ...(result.status === 'fulfilled'
            ? { status: result.value.status, refundStatus: result.value.refundStatus || null }
            : { error: String(result.reason?.message || result.reason || 'unknown').slice(0, 300) }),
        })
      })
    }

    const refundEmailRetries = []
    const refundEmailOrders = refundEmailResult.data || []
    for (let index = 0; index < refundEmailOrders.length; index += 5) {
      const chunk = refundEmailOrders.slice(index, index + 5)
      const settled = await Promise.allSettled(
        chunk.map((order) => retryRefundConfirmationEmail(order.id)),
      )
      settled.forEach((result, offset) => {
        refundEmailRetries.push({
          id: chunk[offset].id,
          ok: result.status === 'fulfilled',
          ...(result.status === 'fulfilled'
            ? { sent: Boolean(result.value?.sent), alreadySent: Boolean(result.value?.alreadySent) }
            : { error: String(result.reason?.message || result.reason || 'unknown').slice(0, 300) }),
        })
      })
    }
    return res.status(200).json({
      ok: true,
      scanned: candidates.length,
      reviewRequired: reviewIds.length,
      results,
      emailRetries,
      refundRetries,
      refundEmailRetries,
    })
  } catch (error) {
    console.error('cleanup-checkouts error:', error)
    return res.status(500).json({ error: error.message || 'Nettoyage des commandes impossible.' })
  }
}
