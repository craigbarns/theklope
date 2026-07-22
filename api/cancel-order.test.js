import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cancellationRecoveryRequiresReview,
  isChargebackReview,
  isMultiplePaymentReview,
  isStrictLegacyUnlinkedOrder,
  ORDER_FIELDS,
} from './cancel-order.js'

test('admin cancellation selects and recognizes the protected legacy stock state', () => {
  assert.match(ORDER_FIELDS, /(?:^|, )stock_reservation_status(?:,|$)/)
  assert.match(ORDER_FIELDS, /(?:^|, )checkout_review_reason(?:,|$)/)
  assert.equal(isStrictLegacyUnlinkedOrder({
    status: 'pending_payment',
    payment_status: 'unpaid',
    stock_reservation_status: 'none',
  }), true)
  assert.equal(isStrictLegacyUnlinkedOrder({
    status: 'pending_payment',
    payment_status: 'unpaid',
    stock_reservation_status: 'reserved',
  }), false)
  assert.equal(isMultiplePaymentReview({
    checkout_review_reason: 'multiple_payments_for_order',
  }), true)
  assert.equal(isChargebackReview({
    checkout_review_reason: 'payment_chargeback_detected',
  }), true)
  const amount = { currency: 'EUR', value: '10.00' }
  assert.equal(cancellationRecoveryRequiresReview([
    { id: 'tr_canonical', status: 'paid', amount, amountRefunded: amount },
    { id: 'tr_unexpected', status: 'paid', amount },
  ], 'tr_canonical'), true)
})
