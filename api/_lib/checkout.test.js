import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildCheckoutIdempotencyHash,
  buildMolliePaymentRequest,
  buildMollieRefundRequest,
  checkoutPayloadHash,
  findMolliePaymentForOrder,
  findMolliePaymentsForOrder,
  hasMultipleSettleableMolliePayments,
  hasUnexpectedMolliePaymentExposure,
  molliePaymentHasChargeback,
  molliePaymentMaySettle,
  mollieOrderIdFromMetadata,
  normalizeAcquisition,
  readCheckoutIdempotencyKey,
} from './checkout.js'

test('explicit checkout idempotency keys are validated and hashed durably', () => {
  assert.equal(readCheckoutIdempotencyKey({ headers: { 'idempotency-key': 'checkout_1234567890' } }).ok, true)
  assert.equal(readCheckoutIdempotencyKey({ headers: { 'idempotency-key': 'short' } }).ok, false)
  assert.equal(readCheckoutIdempotencyKey({ headers: { 'idempotency-key': 'bad key with spaces' } }).ok, false)

  const first = buildCheckoutIdempotencyHash({
    requestKey: 'checkout_1234567890',
    payloadHash: 'payload-a',
  })
  const replay = buildCheckoutIdempotencyHash({
    requestKey: 'checkout_1234567890',
    payloadHash: 'payload-b',
  })
  assert.equal(first, replay)
  assert.match(first, /^[a-f0-9]{64}$/)
})

test('payment recovery prioritizes paid evidence and exposes duplicate candidates', () => {
  const orderId = 'TK-0123456789ABCDEF'
  const amount = { currency: 'EUR', value: '19.90' }
  const candidates = [
    { id: 'tr_failed', status: 'failed', metadata: { orderId }, amount },
    { id: 'tr_open', status: 'open', metadata: { orderId }, amount },
    { id: 'tr_paid', status: 'paid', metadata: { orderId }, amount },
  ]
  const matches = findMolliePaymentsForOrder(candidates, { id: orderId, total: 19.9 })
  assert.deepEqual(matches.map(({ id }) => id), ['tr_paid', 'tr_open', 'tr_failed'])
  assert.equal(findMolliePaymentForOrder(candidates, { id: orderId, total: 19.9 }).id, 'tr_paid')
  assert.equal(hasMultipleSettleableMolliePayments(matches), true)
  assert.equal(hasMultipleSettleableMolliePayments([
    candidates[0],
    candidates[2],
  ]), false)
  assert.equal(hasMultipleSettleableMolliePayments([
    candidates[2],
    { ...candidates[2], id: 'tr_refunded', amountRefunded: amount },
  ]), false)
  assert.equal(hasUnexpectedMolliePaymentExposure([
    { ...candidates[2], amountRefunded: amount },
    { ...candidates[2], id: 'tr_unexpected' },
  ], 'tr_paid'), true)
  const fullChargeback = {
    ...candidates[2],
    id: 'tr_chargedback',
    amountChargedBack: amount,
  }
  assert.equal(molliePaymentHasChargeback(fullChargeback), true)
  assert.equal(molliePaymentMaySettle(fullChargeback), false)
  assert.equal(molliePaymentMaySettle({
    ...fullChargeback,
    amountChargedBack: { currency: 'EUR', value: '1.00' },
  }), true)
  assert.deepEqual(
    findMolliePaymentsForOrder([
      candidates[0],
      { ...candidates[2], id: 'tr_fully_refunded', amountRefunded: amount },
    ], { id: orderId, total: 19.9 }).map(({ id }) => id),
    ['tr_fully_refunded', 'tr_failed'],
  )
})

test('Mollie metadata accepts its documented object form and safe JSON replays', () => {
  assert.equal(mollieOrderIdFromMetadata({ orderId: 'TK-0123456789ABCDEF' }), 'TK-0123456789ABCDEF')
  assert.equal(mollieOrderIdFromMetadata('{"orderId":"TK-0123456789ABCDEF"}'), 'TK-0123456789ABCDEF')
  assert.equal(mollieOrderIdFromMetadata('{invalid'), '')
  assert.equal(mollieOrderIdFromMetadata(['TK-0123456789ABCDEF']), '')
})

test('payment recovery requires matching order metadata, EUR and exact cents', () => {
  const payments = [
    { id: 'tr_wrong_amount', metadata: { orderId: 'TK-0123456789ABCDEF' }, amount: { currency: 'EUR', value: '1.00' } },
    { id: 'tr_wrong_order', metadata: { orderId: 'TK-AAAAAAAAAAAAAAAA' }, amount: { currency: 'EUR', value: '19.90' } },
    { id: 'tr_match', metadata: { orderId: 'TK-0123456789ABCDEF' }, amount: { currency: 'EUR', value: '19.90' } },
  ]
  assert.equal(findMolliePaymentForOrder(payments, {
    id: 'TK-0123456789ABCDEF',
    total: 19.9,
  })?.id, 'tr_match')
})

test('legacy fallback deduplicates a payload in one window without exposing the IP', () => {
  const args = {
    requestKey: '',
    payloadHash: 'abc',
    clientIp: '203.0.113.42',
    secret: 'test-secret',
  }
  const first = buildCheckoutIdempotencyHash({ ...args, now: 1_700_000_000_000 })
  const replay = buildCheckoutIdempotencyHash({ ...args, now: 1_700_000_100_000 })
  const later = buildCheckoutIdempotencyHash({ ...args, now: 1_700_001_000_000 })
  assert.equal(first, replay)
  assert.notEqual(first, later)
  assert.equal(first.includes(args.clientIp), false)
})

test('nested acquisition touches are allowlisted, trimmed and bounded', () => {
  const result = normalizeAcquisition({
    firstTouch: {
      utm_source: '  google ',
      utm_campaign: 'x'.repeat(300),
      gclid: ' click-id ',
      landing_path: '/boutique?utm_source=google',
      captured_at: '2026-07-21T10:00:00.000Z',
      ignored: 'secret',
    },
    lastTouch: {
      utm_medium: ' cpc ',
      captured_at: '2026-07-21T10:02:00Z',
    },
    consentRecordedAt: '2026-07-21T10:01:00Z',
    ignored: 'secret',
  })
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.value).sort(), ['consentRecordedAt', 'firstTouch', 'lastTouch'])
  assert.equal(result.value.firstTouch.utm_source, 'google')
  assert.equal(result.value.firstTouch.utm_campaign.length, 200)
  assert.equal(result.value.lastTouch.utm_medium, 'cpc')
  assert.equal(result.value.consentRecordedAt, '2026-07-21T10:01:00.000Z')
  assert.equal('ignored' in result.value.firstTouch, false)
  assert.equal(normalizeAcquisition('google').ok, false)
  assert.equal(normalizeAcquisition({ firstTouch: { utm_source: 42 } }).ok, false)
  assert.equal(normalizeAcquisition({ lastTouch: { captured_at: 'yesterday-ish' } }).ok, false)
  assert.deepEqual(normalizeAcquisition({
    lastTouch: { utm_source: 'google' },
  }), { ok: true, value: {} })
})

test('Mollie requests use deterministic idempotency and exact EUR amounts', () => {
  const payloadHash = checkoutPayloadHash({ cart: [['p1', 2]], email: 'client@example.com' })
  const payment = buildMolliePaymentRequest({
    orderId: 'TK-0123456789ABCDEF',
    total: 12.3,
    baseUrl: 'https://www.theklope.com',
    checkoutHash: payloadHash,
  })
  assert.equal(payment.amount.value, '12.30')
  assert.equal(payment.idempotencyKey, `tk-payment-${payloadHash}`)
  assert.equal(payment.cancelUrl, payment.redirectUrl)

  const refund = buildMollieRefundRequest({
    id: 'TK-0123456789ABCDEF',
    payment_id: 'tr_test',
    total: '12.30',
  }, 'Rupture de stock')
  assert.equal(refund.amount.value, '12.30')
  assert.equal(refund.paymentId, 'tr_test')
  assert.equal(refund.metadata.refundAttempt, 1)
  assert.match(refund.idempotencyKey, /^tk-refund-[a-f0-9]{48}$/)
  assert.notEqual(
    refund.idempotencyKey,
    buildMollieRefundRequest({ id: 'TK-0123456789ABCDEF', payment_id: 'tr_test', total: 12.3 }, '', 2).idempotencyKey,
  )
  assert.deepEqual(
    refund,
    buildMollieRefundRequest({
      id: 'TK-0123456789ABCDEF',
      payment_id: 'tr_test',
      total: '12.30',
    }, 'Une raison différente sur le replay'),
  )
  assert.equal(
    buildMollieRefundRequest({ id: 'TK-0123456789ABCDEF', payment_id: 'tr_test', total: 12.3 }, '', 2, 7.3).amount.value,
    '7.30',
  )
})

test('checkout payload hashes are stable across object key order', () => {
  assert.equal(
    checkoutPayloadHash({ customer: { email: 'a@example.com', name: 'A' }, lines: [{ qty: 1, id: 'p1' }] }),
    checkoutPayloadHash({ lines: [{ id: 'p1', qty: 1 }], customer: { name: 'A', email: 'a@example.com' } }),
  )
})
