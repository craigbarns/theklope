import assert from 'node:assert/strict'
import test from 'node:test'

import { COIL_FAMILIES, coilFamilyForProduct, familyFaq } from './coilCompatibility.js'
import { isCartoucheProduct, isResistanceProduct } from './catalog.js'
import { PRODUCTS } from './products.js'
import { buildSitemapEntries } from '../../scripts/sitemap-data.mjs'

test('chaque famille est sourcée et complète', () => {
  const slugs = new Set()
  for (const family of COIL_FAMILIES) {
    assert.ok(!slugs.has(family.slug), `slug en double : ${family.slug}`)
    slugs.add(family.slug)
    assert.match(family.source.url, /^https:\/\//, `${family.slug} : source manquante`)
    assert.ok(family.devices.length > 0)
    assert.ok(family.seoTitle.length <= 65, `${family.slug} : titre trop long pour Google`)
    assert.equal(familyFaq(family).length, 3)
  }
})

test('une famille ne s’applique qu’aux résistances et cartouches, jamais aux kits', () => {
  for (const product of PRODUCTS) {
    const family = coilFamilyForProduct(product)
    if (family) assert.ok(isResistanceProduct(product) || isCartoucheProduct(product), `${product.name} classé ${family.slug}`)
    assert.ok(COIL_FAMILIES.filter((f) => f.match(product)).length <= 1, `${product.name} dans plusieurs familles`)
  }
  assert.equal(coilFamilyForProduct({ name: 'Kit XROS 4 Vaporesso', category: 'pod' }), null)
  assert.equal(coilFamilyForProduct({ name: 'Kit Drag S2 avec PnP-X', category: 'ecig' }), null)
})

test('les pages de compatibilité sont dans le sitemap', () => {
  const locs = buildSitemapEntries([]).map((entry) => entry.loc)
  assert.ok(locs.includes('/compatibilite'))
  for (const family of COIL_FAMILIES) assert.ok(locs.includes(`/compatibilite/${family.slug}`))
})
