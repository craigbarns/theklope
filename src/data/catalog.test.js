import assert from 'node:assert/strict'
import test from 'node:test'

import { isResistanceProduct, productMatchesCategory, productsByCategorySlugFrom } from './catalog.js'

test('products explicitly assigned to the resistance category are always visible', () => {
  const product = {
    id: 'cartouche-xlim',
    name: 'Cartouches Xlim - Pack de 3',
    category: 'resistance',
    type: 'Resistances',
  }

  assert.equal(isResistanceProduct(product), true)
  assert.equal(productMatchesCategory(product, 'resistance'), true)
  assert.deepEqual(productsByCategorySlugFrom([product], 'resistances'), [product])
})

test('legacy resistance accessories remain visible from their product references and images', () => {
  const legacyProducts = [
    { id: 'gt-core', name: 'GT CORE', category: 'accessoire' },
    { id: 'voopoo-tpp', name: 'VOOPOO TPP', category: 'accessoire' },
    { id: 'pnp-x', name: 'PNP X Pack de 5', category: 'accessoire' },
    { id: 'apex', name: 'Apex 5 ml', category: 'accessoire', image: '/products/cartouches-apex.jpg' },
  ]

  assert.deepEqual(
    legacyProducts.filter(isResistanceProduct).map((product) => product.id),
    ['gt-core', 'voopoo-tpp', 'pnp-x', 'apex'],
  )
})

test('resistance keywords never move products out of another explicit category', () => {
  const product = {
    id: 'eliquide-mesh',
    name: 'Mesh Fruits Rouges',
    category: 'eliquide',
  }

  assert.equal(isResistanceProduct(product), false)
  assert.equal(productMatchesCategory(product, 'resistance'), false)
})
