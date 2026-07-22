import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const cleanupPath = new URL('./cleanup-checkouts.js', import.meta.url)

test('checkout cleanup is fail-closed for financial review and rotates durable outboxes', async () => {
  const source = await readFile(cleanupPath, 'utf8')
  assert.match(source, /hasUnexpectedMolliePaymentExposure\(matchingPayments, order\.payment_id\)/)
  assert.match(source, /checkout_review_reason === 'payment_chargeback_detected'/)
  assert.match(source, /multiplePaymentReviewLatched = order\.checkout_review_reason === 'multiple_payments_for_order'/)
  assert.match(source, /status\.eq\.refund_failed,refund_status\.in\.\(failed,canceled\)/)
  const refundEmailQuery = source.match(/\.eq\('payment_status', 'refunded'\)[\s\S]*?\.limit\(25\)/)?.[0]
  assert.ok(refundEmailQuery)
  assert.match(refundEmailQuery, /checkout_review_required_at', null/)
  assert.match(refundEmailQuery, /checkout_review_reason', null/)
})
