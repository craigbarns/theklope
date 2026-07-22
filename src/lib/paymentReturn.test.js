import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHECKOUT_RETURN_STATE,
  isPurchaseTrackable,
  resolveCheckoutReturnState,
  shouldClearCartForPaymentReturn,
} from './paymentReturn.js'

test('paid orders with refund activity never resolve to normal purchase success', () => {
  assert.equal(resolveCheckoutReturnState({
    paymentStatus: 'paid',
    order: { status: 'refund_pending', refundStatus: 'processing' },
  }), CHECKOUT_RETURN_STATE.refundPending)
  assert.equal(resolveCheckoutReturnState({
    paymentStatus: 'paid',
    order: { status: 'refund_failed', refundStatus: 'failed' },
  }), CHECKOUT_RETURN_STATE.refundFailed)
  assert.equal(resolveCheckoutReturnState({
    paymentStatus: 'paid',
    order: { status: 'refunded', refundStatus: 'refunded' },
  }), CHECKOUT_RETURN_STATE.refunded)
})

test('only an uncomplicated paid order is purchase-trackable', () => {
  assert.equal(isPurchaseTrackable(resolveCheckoutReturnState({
    paymentStatus: 'paid',
    order: { status: 'processing', refundStatus: null },
  })), true)
  assert.equal(isPurchaseTrackable(resolveCheckoutReturnState({
    paymentStatus: 'paid',
    order: { status: 'stock_issue', refundStatus: null },
  })), false)
  assert.equal(isPurchaseTrackable(CHECKOUT_RETURN_STATE.refunded), false)
})

test('manual review wins over every payment outcome and is never purchase-trackable', () => {
  for (const paymentStatus of ['pending', 'paid', 'failed']) {
    const state = resolveCheckoutReturnState({
      paymentStatus,
      order: {
        status: 'refunded',
        refundStatus: 'refunded',
        reviewRequired: true,
      },
    })
    assert.equal(state, CHECKOUT_RETURN_STATE.reviewRequired)
    assert.equal(isPurchaseTrackable(state), false)
  }
})

test('only the active payment return may clear the current cart', () => {
  assert.equal(shouldClearCartForPaymentReturn({
    attemptMatched: true,
    alreadyCleared: false,
  }), true)
  assert.equal(shouldClearCartForPaymentReturn({
    attemptMatched: false,
    alreadyCleared: false,
  }), false)
  assert.equal(shouldClearCartForPaymentReturn({
    attemptMatched: true,
    alreadyCleared: true,
  }), false)
})
