import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCT_PAGE_STATE,
  getProductPageState,
  isPageReadyForAnalytics,
} from './pageReadiness.js'

test('a missing product stays in loading state until the catalog resolves', () => {
  assert.equal(
    getProductPageState({ product: null, catalogReady: false, syncStatus: 'connecting' }),
    PRODUCT_PAGE_STATE.loading,
  )
  assert.equal(
    getProductPageState({ product: null, catalogReady: false, syncStatus: 'syncing' }),
    PRODUCT_PAGE_STATE.loading,
  )
})

test('a product is only declared missing after the catalog resolves', () => {
  assert.equal(
    getProductPageState({ product: null, catalogReady: true, syncStatus: 'online' }),
    PRODUCT_PAGE_STATE.notFound,
  )
})

test('a cached product can render while the catalog refreshes', () => {
  assert.equal(
    getProductPageState({ product: { id: 'known-product' }, catalogReady: false, syncStatus: 'syncing' }),
    PRODUCT_PAGE_STATE.ready,
  )
})

test('a catalog failure is distinct from a product not found', () => {
  assert.equal(
    getProductPageState({ product: null, catalogReady: false, syncStatus: 'error' }),
    PRODUCT_PAGE_STATE.error,
  )
})

test('analytics waits for the SEO state of the current route', () => {
  assert.equal(isPageReadyForAnalytics('/produit/known-product', '/boutique'), false)
  assert.equal(isPageReadyForAnalytics('/produit/known-product', '/produit/known-product'), true)
  assert.equal(isPageReadyForAnalytics('/autre-page', '/page-introuvable'), false)
  assert.equal(isPageReadyForAnalytics('', ''), false)
})
