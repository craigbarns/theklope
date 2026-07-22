import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHECKOUT_ATTEMPT_STORAGE_KEY,
  CHECKOUT_ATTEMPT_TTL_MS,
  clearPaymentAttempt,
  clearPaymentAttemptForOrder,
  createCheckoutAttemptFingerprint,
  createCheckoutIdempotencyKey,
  persistPaymentAttempt,
  readStoredPaymentAttempt,
} from './checkoutAttempt.js'

const memoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('checkout attempt fingerprint ignores acquisition but changes with the commercial payload', async () => {
  const base = {
    items: [{ id: 'p1', qty: 1, variant: { nicotine: 3 } }],
    customer: { email: 'client@example.com' },
    acquisition: { lastTouch: { utm_source: 'google' } },
  }
  const first = await createCheckoutAttemptFingerprint(base)
  const consentChanged = await createCheckoutAttemptFingerprint({ ...base, acquisition: {} })
  const cartChanged = await createCheckoutAttemptFingerprint({
    ...base,
    items: [{ id: 'p1', qty: 2, variant: { nicotine: 3 } }],
  })

  assert.equal(first, consentChanged)
  assert.notEqual(first, cartChanged)
  assert.match(first, /^(?:[a-f0-9]{64}|fallback-)/)
})

test('checkout attempt fingerprint follows server canonicalization', async () => {
  const first = {
    ageConfirmed: true,
    items: [
      { id: 'liquid-b', qty: 1, variant: { nicotine: 3 } },
      { id: 'liquid-a', qty: 2, variant: { flavor: 'Menthe' } },
    ],
    shippingMethodId: 'poste',
    promoCode: ' bienvenue ',
    customer: { name: ' Alice Martin ', email: 'ALICE@EXAMPLE.COM ', phone: ' 0600000000 ' },
    address: {
      street: ' 1 rue Test ',
      extra: '',
      zip: '13 006',
      city: ' Marseille ',
      country: 'fr',
      deliveryInstructions: ' Interphone 2\r\n3e étage ',
    },
    acquisition: { lastTouch: { utm_source: 'google' } },
  }
  const equivalent = {
    ...first,
    items: [
      { id: 'liquid-a', qty: 2, variant: { flavor: ' menthe ' } },
      { id: 'liquid-b', qty: 1, variant: { nicotine: '3' } },
    ],
    promoCode: 'BIENVENUE',
    customer: { name: 'Alice Martin', email: 'alice@example.com', phone: '0600000000' },
    address: {
      street: '1 rue Test',
      extra: '',
      zip: '13006',
      city: 'Marseille',
      country: 'France',
      deliveryInstructions: 'Interphone 2\n3e étage',
    },
    acquisition: null,
  }

  assert.equal(
    await createCheckoutAttemptFingerprint(first),
    await createCheckoutAttemptFingerprint(equivalent),
  )
})

test('a valid payment attempt survives reload only for its fingerprint and TTL', () => {
  const storage = memoryStorage()
  const now = 1_800_000_000_000
  const attempt = { fingerprint: 'fingerprint-a', key: 'checkout:1234567890', createdAt: now }

  assert.equal(persistPaymentAttempt(attempt, storage), true)
  assert.deepEqual(readStoredPaymentAttempt('fingerprint-a', { storage, now: now + 1_000 }), attempt)
  assert.equal(readStoredPaymentAttempt('fingerprint-b', { storage, now: now + 1_000 }), null)
  assert.equal(readStoredPaymentAttempt('fingerprint-a', {
    storage,
    now: now + CHECKOUT_ATTEMPT_TTL_MS + 1,
  }), null)
  assert.equal(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY), null)
})

test('clearing one payment attempt cannot delete a newer attempt', () => {
  const storage = memoryStorage()
  const attempt = { fingerprint: 'fingerprint', key: 'checkout:new-attempt', createdAt: Date.now() }
  persistPaymentAttempt(attempt, storage)

  assert.equal(clearPaymentAttempt('checkout:older-attempt', storage), false)
  assert.notEqual(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY), null)
  assert.equal(clearPaymentAttempt(attempt.key, storage), true)
  assert.equal(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY), null)
})

test('a Mollie return clears only the attempt linked to its terminal order', () => {
  const storage = memoryStorage()
  const attempt = {
    fingerprint: 'fingerprint',
    key: 'checkout:terminal-attempt',
    createdAt: Date.now(),
    orderId: 'TK-20260721-ABC123',
  }
  persistPaymentAttempt(attempt, storage)

  assert.equal(clearPaymentAttemptForOrder('TK-20260721-OTHER1', storage), false)
  assert.notEqual(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY), null)
  assert.equal(clearPaymentAttemptForOrder(attempt.orderId, storage), true)
  assert.equal(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY), null)
})

test('generated checkout idempotency keys match the server contract', () => {
  assert.match(createCheckoutIdempotencyKey(), /^[A-Za-z0-9._:-]{16,128}$/)
})
