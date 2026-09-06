import test from 'node:test'
import assert from 'node:assert/strict'
import { createReviewToken, verifyReviewToken, validateReviewInput } from './productReviews.js'

test('createReviewToken and verifyReviewToken validate legitimate tokens', () => {
  const orderId = 'order_test_123'
  const productId = 'h40-voopoo'
  const secret = 'super-secret-key-xyz'

  const token = createReviewToken({ orderId, productId, secret })
  assert.ok(typeof token === 'string' && token.includes('.'))

  const isValid = verifyReviewToken({ orderId, productId, token, secret })
  assert.equal(isValid, true)
})

test('verifyReviewToken rejects altered orderId or productId or forged signatures', () => {
  const orderId = 'order_test_123'
  const productId = 'h40-voopoo'
  const secret = 'super-secret-key-xyz'

  const token = createReviewToken({ orderId, productId, secret })

  assert.equal(verifyReviewToken({ orderId: 'order_hacked', productId, token, secret }), false)
  assert.equal(verifyReviewToken({ orderId, productId: 'other-product', token, secret }), false)
  assert.equal(verifyReviewToken({ orderId, productId, token: `${token}bad`, secret }), false)
  assert.equal(verifyReviewToken({ orderId, productId, token: 'invalid.token', secret }), false)
})

test('validateReviewInput checks rating, authorName and comment bounds', () => {
  const valid = validateReviewInput({
    rating: 5,
    authorName: 'Alexandre',
    comment: 'Super produit, rendu des saveurs impeccable et tirage précis !',
    title: 'Excellent pod',
  })
  assert.equal(valid.ok, true)
  assert.equal(valid.data.rating, 5)

  assert.equal(validateReviewInput({ rating: 0, authorName: 'A', comment: 'Valide comment' }).ok, false)
  assert.equal(validateReviewInput({ rating: 6, authorName: 'A', comment: 'Valide comment' }).ok, false)
  assert.equal(validateReviewInput({ rating: 4, authorName: '', comment: 'Valide comment' }).ok, false)
  assert.equal(validateReviewInput({ rating: 4, authorName: 'A', comment: 'xyz' }).ok, false)
})
