const REFUND_PENDING_STATUSES = new Set(['requested', 'queued', 'pending', 'processing'])
const REFUND_FAILED_STATUSES = new Set(['failed', 'canceled'])

export const CHECKOUT_RETURN_STATE = Object.freeze({
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
  reviewRequired: 'review_required',
  stockIssue: 'stock_issue',
  refundPending: 'refund_pending',
  refundFailed: 'refund_failed',
  refunded: 'refunded',
})

export function resolveCheckoutReturnState({ paymentStatus, order } = {}) {
  // A durable server-side review latch always wins over the apparent Mollie
  // status. In particular, a second matching payment must never render the
  // normal success screen or invite the customer to pay again.
  if (order?.reviewRequired) return CHECKOUT_RETURN_STATE.reviewRequired
  if (paymentStatus === 'failed') return CHECKOUT_RETURN_STATE.failed
  if (paymentStatus !== 'paid') return CHECKOUT_RETURN_STATE.pending

  const orderStatus = String(order?.status || '')
  const refundStatus = String(order?.refundStatus || '')
  if (orderStatus === 'refunded' || refundStatus === 'refunded') {
    return CHECKOUT_RETURN_STATE.refunded
  }
  if (orderStatus === 'refund_failed' || REFUND_FAILED_STATUSES.has(refundStatus)) {
    return CHECKOUT_RETURN_STATE.refundFailed
  }
  if (orderStatus === 'refund_pending' || REFUND_PENDING_STATUSES.has(refundStatus)) {
    return CHECKOUT_RETURN_STATE.refundPending
  }
  if (orderStatus === 'stock_issue') return CHECKOUT_RETURN_STATE.stockIssue
  return CHECKOUT_RETURN_STATE.paid
}

export const isPurchaseTrackable = (state) => state === CHECKOUT_RETURN_STATE.paid

// A historical confirmation URL must never erase a newer basket. Only the
// order attached to the active browser payment attempt owns that cart.
export const shouldClearCartForPaymentReturn = ({ attemptMatched, alreadyCleared } = {}) => (
  Boolean(attemptMatched) && !alreadyCleared
)
