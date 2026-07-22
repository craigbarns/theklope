import test from 'node:test'
import assert from 'node:assert/strict'

import { getPaidOrders } from './dashboard.js'

test('sales metrics include only paid, non-cancelled orders without financial review', () => {
  const paidOrders = getPaidOrders([
    { id: 'paid-processing', paymentStatus: 'paid', status: 'processing' },
    { id: 'paid-stock-issue', paymentStatus: 'paid', status: 'stock_issue' },
    { id: 'abandoned', paymentStatus: 'unpaid', status: 'pending_payment' },
    { id: 'failed', paymentStatus: 'failed', status: 'cancelled' },
    { id: 'cancelled-after-payment', paymentStatus: 'paid', status: 'cancelled' },
    {
      id: 'charged-back',
      paymentStatus: 'paid',
      status: 'processing',
      checkoutReviewRequiredAt: '2026-07-21T12:00:00.000Z',
      checkoutReviewReason: 'payment_chargeback_detected',
    },
    {
      id: 'multiple-payments',
      paymentStatus: 'paid',
      status: 'processing',
      checkoutReviewRequiredAt: '2026-07-21T12:00:00.000Z',
      checkoutReviewReason: 'multiple_payments_for_order',
    },
    {
      id: 'legacy-review',
      paymentStatus: 'paid',
      status: 'refund_failed',
      checkoutReviewRequiredAt: '2026-07-21T12:00:00.000Z',
      checkoutReviewReason: 'legacy_paid_cancelled_unreconciled',
    },
  ])

  assert.deepEqual(
    paidOrders.map((order) => order.id),
    ['paid-processing', 'paid-stock-issue'],
  )
})
