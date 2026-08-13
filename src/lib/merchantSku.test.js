import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../data/products.js'
import { buildMerchantSku, MERCHANT_SKU_MAX_LENGTH } from './merchantSku.js'

test('merchant SKUs preserve existing valid product identifiers', () => {
  assert.equal(buildMerchantSku('e-liquide-peche-10ml-liquidarom'), 'e-liquide-peche-10ml-liquidarom')
})

test('merchant SKUs are ASCII, whitespace-free and at most 50 characters', () => {
  const sku = buildMerchantSku('  Très long produit avec espaces et caractères spéciaux — édition limitée  ')

  assert.ok(sku.length >= 1)
  assert.ok(sku.length <= MERCHANT_SKU_MAX_LENGTH)
  assert.match(sku, /^[A-Za-z0-9_-]+$/)
  assert.doesNotMatch(sku, /\s/)
})

test('long merchant SKUs stay stable and distinct after truncation', () => {
  const firstId = 'cactus-aloe-vera-fruit-du-dragon-10-ml-ice-cool-by-liquidarom'
  const secondId = 'cactus-aloe-vera-fruit-du-dragon-50-ml-ice-cool-by-liquidarom'

  assert.equal(buildMerchantSku(firstId), buildMerchantSku(firstId))
  assert.notEqual(buildMerchantSku(firstId), buildMerchantSku(secondId))
})

test('every fallback catalogue product produces a unique Google-compatible SKU', () => {
  const skus = PRODUCTS.map((product) => buildMerchantSku(product.id))

  assert.equal(new Set(skus).size, PRODUCTS.length)
  assert.ok(skus.every((sku) => sku.length >= 1 && sku.length <= MERCHANT_SKU_MAX_LENGTH))
  assert.ok(skus.every((sku) => /^[A-Za-z0-9_-]+$/.test(sku)))
})
