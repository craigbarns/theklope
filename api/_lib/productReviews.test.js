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

// --- Le système d'avis ne doit jamais faire tomber la chaîne de paiement -----
// orders.js importe ce module, et mollie-webhook / payment-status / cancel-order
// / mark-shipped / cleanup-checkouts importent orders.js. Un throw au chargement
// laissait le client être débité sans que la commande soit jamais confirmée.

test('le module s’importe même sans REVIEW_TOKEN_SECRET', async () => {
  const previous = process.env.REVIEW_TOKEN_SECRET
  delete process.env.REVIEW_TOKEN_SECRET
  try {
    // Import frais : c'est bien le chargement du module qui est testé.
    const mod = await import(`./productReviews.js?nosecret=${Date.now()}`)
    assert.equal(typeof mod.createReviewToken, 'function')
    assert.equal(typeof mod.verifyReviewToken, 'function')
  } finally {
    if (previous === undefined) delete process.env.REVIEW_TOKEN_SECRET
    else process.env.REVIEW_TOKEN_SECRET = previous
  }
})

test('la chaîne de paiement s’importe sans REVIEW_TOKEN_SECRET', async () => {
  const previous = process.env.REVIEW_TOKEN_SECRET
  delete process.env.REVIEW_TOKEN_SECRET
  try {
    const orders = await import(`./orders.js?nosecret=${Date.now()}`)
    assert.equal(typeof orders.syncOrderFromMolliePayment, 'function')
  } finally {
    if (previous === undefined) delete process.env.REVIEW_TOKEN_SECRET
    else process.env.REVIEW_TOKEN_SECRET = previous
  }
})

test('sans secret, la vérification de token refuse au lieu de lever', () => {
  const previous = process.env.REVIEW_TOKEN_SECRET
  delete process.env.REVIEW_TOKEN_SECRET
  try {
    assert.equal(
      verifyReviewToken({ orderId: 'TK-1', productId: 'h40-voopoo', token: 'a.b' }),
      false,
    )
  } finally {
    if (previous === undefined) delete process.env.REVIEW_TOKEN_SECRET
    else process.env.REVIEW_TOKEN_SECRET = previous
  }
})
