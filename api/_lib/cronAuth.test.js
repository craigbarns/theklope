import assert from 'node:assert/strict'
import test from 'node:test'

import { isAuthorizedCronRequest, isSafelyUnstartedCheckout } from './cronAuth.js'

test('cron authorization fails closed and compares the complete bearer secret', () => {
  const secret = '0123456789abcdef0123456789abcdef'
  assert.equal(isAuthorizedCronRequest({ headers: {} }, secret), false)
  assert.equal(isAuthorizedCronRequest({ headers: { authorization: `Bearer ${secret}x` } }, secret), false)
  assert.equal(isAuthorizedCronRequest({ headers: { authorization: `Bearer ${secret}` } }, secret), true)
  assert.equal(isAuthorizedCronRequest({ headers: { authorization: `Bearer short` } }, 'short'), false)
})

test('only a durable checkout proven never started can be released without Mollie', () => {
  assert.equal(isSafelyUnstartedCheckout({
    checkout_idempotency_key: 'a'.repeat(64),
    payment_create_status: 'not_started',
    payment_create_started_at: null,
    payment_id: null,
  }), true)
  for (const state of ['creating', 'failed']) {
    assert.equal(isSafelyUnstartedCheckout({
      checkout_idempotency_key: 'a'.repeat(64),
      payment_create_status: state,
      payment_create_started_at: '2026-07-21T10:00:00.000Z',
      payment_id: null,
    }), false)
  }
})
