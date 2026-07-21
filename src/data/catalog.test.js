import assert from 'node:assert/strict'
import test from 'node:test'

import { BADGES, CATEGORIES, isResistanceProduct, productMatchesCategory, productsByCategorySlugFrom } from './catalog.js'

test('the persisted promo badge displays the PRIX ROUGE label', () => {
  assert.equal(BADGES.promo.label, 'PRIX ROUGE')
  assert.equal(BADGES['prix-rouge'], undefined)
})

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

test('DIY is a product category and filters independently from accessories', () => {
  const diyCategory = CATEGORIES.find(({ slug }) => slug === 'diy')
  const products = [
    { id: 'base-50-50', name: 'Base 50/50', category: 'diy' },
    { id: 'flacon-vide', name: 'Flacon vide', category: 'accessoire' },
  ]

  assert.deepEqual(diyCategory, {
    slug: 'diy',
    key: 'diy',
    name: 'DIY',
    tagline: 'Bases, boosters, arômes & flacons',
  })
  assert.equal(productMatchesCategory(products[0], 'diy'), true)
  assert.deepEqual(productsByCategorySlugFrom(products, 'diy'), [products[0]])
  assert.deepEqual(productsByCategorySlugFrom(products, 'accessoires'), [products[1]])
})
