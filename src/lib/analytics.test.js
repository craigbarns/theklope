import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAnalyticsPageContext,
  buildAcquisitionTouch,
  captureAcquisition,
  getStoredAcquisition,
  parsePurchaseSnapshot,
  serializePurchaseSnapshot,
  setOptionalServicesConsent,
  toAnalyticsItem,
  trackAddPaymentInfo,
  trackCheckoutError,
  trackPageView,
  trackPaymentError,
  trackRemoveFromCart,
  trackSearch,
  trackSelectItem,
  trackViewCart,
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

const withAnalyticsTracking = (callback) => {
  const previousWindow = global.window
  const previousDocument = global.document
  const calls = []
  global.document = {
    title: 'Boutique | THEKLOPE',
    referrer: 'https://www.theklope.com/recherche?email=secret%40example.com#resultats',
  }
  global.window = {
    location: {
      href: 'https://www.theklope.com/boutique?q=client%40example.com#resultats',
      pathname: '/boutique',
    },
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    gtag: (...args) => {
      if (args[0] !== 'event') {
        calls.push(args)
        return
      }

      const params = { ...args[2] }
      assert.equal(params.page_location, 'https://www.theklope.com/boutique')
      assert.equal(params.page_referrer, 'https://www.theklope.com/recherche')
      delete params.page_location
      delete params.page_referrer
      calls.push([args[0], args[1], params])
    },
  }
  setOptionalServicesConsent({
    analytics: true,
    reviews: false,
    analyticsDecision: 'accepted',
  })

  try {
    callback(calls)
  } finally {
    setOptionalServicesConsent({
      analytics: false,
      reviews: false,
      analyticsDecision: 'refused',
    })
    global.window = previousWindow
    global.document = previousDocument
  }
}

test('analytics page context strips queries and fragments from location and referrer', () => {
  assert.deepEqual(buildAnalyticsPageContext({
    href: 'https://www.theklope.com/boutique?q=client%40example.com#resultats',
    referrer: 'https://www.google.com/search?q=eliquide#top',
  }), {
    page_location: 'https://www.theklope.com/boutique',
    page_referrer: 'https://www.google.com/search',
  })
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

test('select_item carries the selected product and list context', () => {
  withAnalyticsTracking((calls) => {
    assert.equal(trackSelectItem({
      product: {
        id: 'liquide-1',
        name: 'E-liquide Test',
        brand: 'THEKLOPE',
        category: 'e-liquides',
        price: 5.9,
      },
      quantity: 2,
      variant: { flavor: 'Pêche', nicotine: '3 mg' },
      itemListId: 'boutique',
      itemListName: 'Boutique',
      index: 3,
    }), true)

    assert.deepEqual(calls, [[
      'event',
      'select_item',
      {
        item_list_id: 'boutique',
        item_list_name: 'Boutique',
        items: [{
          item_id: 'liquide-1',
          item_name: 'E-liquide Test',
          item_brand: 'THEKLOPE',
          item_category: 'e-liquides',
          price: 5.9,
          quantity: 2,
          item_variant: 'Pêche, 3 mg',
          index: 3,
        }],
      },
    ]])
  })
})

test('search emits zero_results only when the known result count is zero', () => {
  withAnalyticsTracking((calls) => {
    assert.equal(trackSearch({ searchTerm: '  pêche   passion ', resultCount: 4 }), true)
    assert.equal(trackSearch({ searchTerm: 'introuvable', resultCount: 0 }), true)
    assert.equal(trackSearch({ searchTerm: '   ', resultCount: 0 }), false)

    assert.deepEqual(calls, [
      ['event', 'search', {
        search_term: 'catalogue_query',
        query_length: 13,
        query_token_count: 2,
        result_count: 4,
      }],
      ['event', 'search', {
        search_term: 'catalogue_query',
        query_length: 11,
        query_token_count: 1,
        result_count: 0,
      }],
      ['event', 'zero_results', {
        search_term: 'catalogue_query',
        query_length: 11,
        query_token_count: 1,
        result_count: 0,
      }],
    ])
  })
})

test('page views strip free-form query parameters and fragments', () => {
  withAnalyticsTracking((calls) => {
    assert.equal(trackPageView('/boutique?q=client%40example.com#resultats'), true)
    assert.deepEqual(calls, [[
      'event',
      'page_view',
      {
        page_path: '/boutique',
        page_title: 'Boutique | THEKLOPE',
      },
    ]])
  })
})

test('cart and payment helpers emit complete GA4 ecommerce payloads', () => {
  withAnalyticsTracking((calls) => {
    const item = toAnalyticsItem({
      id: 'liquide-1',
      name: 'E-liquide Test',
      brand: 'THEKLOPE',
      category: 'e-liquides',
      price: 5.9,
    }, 2, { nicotine: '3 mg' })

    assert.equal(trackViewCart({
      items: [item],
      coupon: 'BIENVENUE',
    }), true)
    assert.equal(trackRemoveFromCart({
      item,
      coupon: 'BIENVENUE',
    }), true)
    assert.equal(trackAddPaymentInfo({
      items: [item],
      value: 19.3,
      coupon: 'BIENVENUE',
      paymentType: 'Mollie',
    }), true)

    assert.deepEqual(calls, [
      ['event', 'view_cart', {
        currency: 'EUR',
        value: 11.8,
        coupon: 'BIENVENUE',
        items: [item],
      }],
      ['event', 'remove_from_cart', {
        currency: 'EUR',
        value: 11.8,
        coupon: 'BIENVENUE',
        items: [item],
      }],
      ['event', 'add_payment_info', {
        currency: 'EUR',
        value: 19.3,
        coupon: 'BIENVENUE',
        payment_type: 'Mollie',
        items: [item],
      }],
    ])
  })
})

test('checkout and payment errors expose codes without customer-facing messages', () => {
  withAnalyticsTracking((calls) => {
    assert.equal(trackCheckoutError({
      errorCode: 'invalid_postcode',
      checkoutStep: '2',
      retryable: false,
    }), true)
    assert.equal(trackPaymentError({
      errorCode: 'provider_unavailable',
      checkoutStep: 'payment',
      paymentProvider: 'Mollie',
      paymentType: 'card',
      retryable: true,
    }), true)

    assert.deepEqual(calls[0].slice(0, 2), ['event', 'checkout_error'])
    assert.equal(calls[0][2].error_code, 'invalid_postcode')
    assert.equal(calls[0][2].checkout_step, 2)
    assert.equal(calls[0][2].retryable, false)
    assert.equal(Object.hasOwn(calls[0][2], 'error_message'), false)

    assert.deepEqual(calls[1], ['event', 'payment_error', {
      error_code: 'provider_unavailable',
      checkout_step: 'payment',
      payment_provider: 'Mollie',
      payment_type: 'card',
      retryable: true,
    }])
  })
})

test('ecommerce helpers reject empty payloads instead of polluting analytics', () => {
  withAnalyticsTracking((calls) => {
    assert.equal(trackSelectItem(), false)
    assert.equal(trackViewCart(), false)
    assert.equal(trackRemoveFromCart(), false)
    assert.equal(trackAddPaymentInfo(), false)
    assert.deepEqual(calls, [])
  })
})
