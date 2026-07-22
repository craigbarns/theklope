import assert from 'node:assert/strict'
import test from 'node:test'

import { publicPaymentStatus } from './payment-status.js'

test('public payment status exposes a non-sensitive manual-review latch', () => {
  const result = publicPaymentStatus({
    id: 'TK-0123456789ABCDEF',
    payment_status: 'paid',
    status: 'processing',
    total: 19.9,
    shipping: { id: 'pickup' },
    refund_status: null,
    checkout_review_required_at: '2026-07-21T12:00:00.000Z',
    checkout_review_reason: 'multiple_payments_for_order',
  })
  assert.equal(result.status, 'paid')
  assert.equal(result.order.reviewRequired, true)
  assert.equal(result.order.reviewReason, 'multiple_payments_for_order')
  assert.equal('checkoutReviewRequiredAt' in result.order, false)
})
