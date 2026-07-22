import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAcquisitionTouch,
  captureAcquisition,
  getStoredAcquisition,
  parsePurchaseSnapshot,
  serializePurchaseSnapshot,
  setOptionalServicesConsent,
} from './analytics.js'

const createStorage = (values = new Map()) => ({
  get length() {
    return values.size
  },
  key: (index) => [...values.keys()][index] ?? null,
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
})

test('acquisition keeps allow-listed campaign values and strips unrelated query data', () => {
  const touch = buildAcquisitionTouch({
    href: 'https://www.theklope.com/boutique?utm_source=google&utm_campaign=ete&email=secret%40example.com&gclid=abc',
    referrer: 'https://www.google.com/search?q=vape',
    capturedAt: '2026-07-21T10:00:00.000Z',
  })

  assert.deepEqual(touch, {
    utm_source: 'google',
    utm_campaign: 'ete',
    gclid: 'abc',
    landing_path: '/boutique?utm_source=google&utm_campaign=ete&gclid=abc',
    referrer: 'https://www.google.com/search',
    captured_at: '2026-07-21T10:00:00.000Z',
  })
})

test('payment-provider returns do not replace acquisition', () => {
  assert.equal(buildAcquisitionTouch({
    href: 'https://www.theklope.com/checkout/retour?order=TK-123',
    referrer: 'https://www.mollie.com/checkout/select-method/abc',
  }), null)
})

test('acquisition is persisted and exposed only after analytics consent', () => {
  const values = new Map()
  const previousWindow = global.window
  global.window = {
    location: { href: 'https://www.theklope.com/?utm_source=newsletter' },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  }

  try {
    captureAcquisition({
      href: global.window.location.href,
      referrer: '',
      capturedAt: '2026-07-21T10:00:00.000Z',
    })
    assert.equal(values.size, 0)
    assert.equal(getStoredAcquisition(), null)

    setOptionalServicesConsent({ analytics: true, reviews: false })
    const acquisition = getStoredAcquisition()
    assert.equal(values.size, 1)
    assert.equal(acquisition.firstTouch.utm_source, 'newsletter')
    assert.equal(acquisition.lastTouch.utm_source, 'newsletter')
  } finally {
    global.window = previousWindow
  }
})

test('an explicit refusal clears persisted and pending acquisition without waiting for storage effects', () => {
  const localValues = new Map([
    ['tk_purchase_TK-1', '{"items":[]}'],
    ['tk_purchase_tracked_TK-1', '1'],
    ['tk_refund_tracked_TK-1', '1'],
    ['tk_checkout_attempt_v1', '{"fingerprint":"safe"}'],
  ])
  const sessionValues = new Map([
    ['tk_purchase_TK-2', '{"items":[]}'],
    ['tk_refund_tracked_TK-2', '1'],
    ['tk_checkout_attempt_v1', '{"fingerprint":"safe-session"}'],
  ])
  const previousWindow = global.window
  global.window = {
    location: { href: 'https://www.theklope.com/?utm_source=affiliate' },
    localStorage: createStorage(localValues),
    sessionStorage: createStorage(sessionValues),
  }

  try {
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    captureAcquisition({ href: global.window.location.href, referrer: '' })
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    setOptionalServicesConsent({ analytics: true, reviews: false, analyticsDecision: 'accepted' })

    assert.deepEqual([...localValues], [
      ['tk_checkout_attempt_v1', '{"fingerprint":"safe"}'],
    ])
    assert.deepEqual([...sessionValues], [
      ['tk_checkout_attempt_v1', '{"fingerprint":"safe-session"}'],
    ])
    assert.equal(getStoredAcquisition(), null)
  } finally {
    setOptionalServicesConsent({ analytics: false, reviews: false, analyticsDecision: 'refused' })
    global.window = previousWindow
  }
})

test('purchase snapshots expire after 24 hours while legacy session snapshots stay readable', () => {
  const data = {
    orderId: 'TK-123',
    total: 34.9,
    items: [{ id: 'liquide-1', quantity: 2 }],
  }
  const createdAt = Date.parse('2026-07-21T10:00:00.000Z')
  const serialized = serializePurchaseSnapshot(data, createdAt)

  assert.deepEqual(parsePurchaseSnapshot(serialized, createdAt + 1), data)
  assert.equal(parsePurchaseSnapshot(serialized, createdAt + (24 * 60 * 60 * 1000)), null)
  assert.deepEqual(parsePurchaseSnapshot(JSON.stringify(data), createdAt), data)
  assert.equal(parsePurchaseSnapshot('{malformed', createdAt), null)
})
