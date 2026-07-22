import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canSafelyCreateMolliePayment,
  checkoutSnapshot,
  paymentRecoveryRequiresReview,
} from './create-payment.js'

test('an RPC existing replay always uses the persisted financial snapshot', () => {
  const snapshot = checkoutSnapshot({
    created: false,
    orderId: 'TK-0123456789ABCDEF',
    orderStatus: 'pending_payment',
    paymentStatus: 'unpaid',
    stockReservationStatus: 'reserved',
    subtotal: '49.00',
    discount: '5.00',
    shippingCost: '4.90',
    total: '48.90',
  }, {
    subtotal: 98,
    discount: 0,
    shipping: 0,
    total: 98,
  })

  assert.equal(snapshot.created, false)
  assert.deepEqual(
    { subtotal: snapshot.subtotal, discount: snapshot.discount, shipping: snapshot.shipping, total: snapshot.total },
    { subtotal: 49, discount: 5, shipping: 4.9, total: 48.9 },
  )
})

test('checkout recovery freezes before linking two payment exposures', () => {
  const amount = { currency: 'EUR', value: '10.00' }
  assert.equal(paymentRecoveryRequiresReview([
    { id: 'tr_one', status: 'paid', amount },
    { id: 'tr_two', status: 'open', amount },
  ]), true)
})

test('two old replays cannot refresh the Mollie payment creation safety window', () => {
  const now = Date.parse('2026-07-21T12:00:00.000Z')
  const oldAttempt = checkoutSnapshot({
    created: false,
    orderId: 'TK-0123456789ABCDEF',
    createdAt: '2026-07-21T10:00:00.000Z',
    paymentCreateStartedAt: '2026-07-21T10:01:00.000Z',
    orderStatus: 'pending_payment',
    paymentStatus: 'unpaid',
    stockReservationStatus: 'reserved',
    total: 10,
  })
  assert.equal(canSafelyCreateMolliePayment(oldAttempt, now), false)

  // The next durable replay remains blocked even if a buggy caller supplies a
  // fresh-looking timestamp: the manual-review latch is authoritative.
  const reviewedReplay = {
    ...oldAttempt,
    paymentCreateStartedAt: '2026-07-21T11:59:59.000Z',
    checkoutReviewRequiredAt: '2026-07-21T12:00:00.000Z',
    checkoutReviewReason: 'payment_not_recoverable_safely',
  }
  assert.equal(canSafelyCreateMolliePayment(reviewedReplay, now + 1_000), false)
})
