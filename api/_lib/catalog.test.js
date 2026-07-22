import assert from 'node:assert/strict'
import test from 'node:test'

import { canUseStaticCatalogFallback } from './catalog.js'

test('static pricing catalog is always disabled in production', () => {
  assert.equal(canUseStaticCatalogFallback({
    VERCEL_ENV: 'production',
    NODE_ENV: 'production',
    ALLOW_STATIC_CATALOG_FALLBACK: 'true',
  }), false)
  assert.equal(canUseStaticCatalogFallback({
    NODE_ENV: 'production',
    ALLOW_STATIC_CATALOG_FALLBACK: 'true',
  }), false)
})

test('static pricing catalog requires an explicit non-production opt-in', () => {
  assert.equal(canUseStaticCatalogFallback({ NODE_ENV: 'development' }), false)
  assert.equal(canUseStaticCatalogFallback({
    VERCEL_ENV: 'preview',
    NODE_ENV: 'production',
    ALLOW_STATIC_CATALOG_FALLBACK: 'true',
  }), true)
})
