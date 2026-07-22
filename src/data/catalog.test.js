import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BADGES,
  CATEGORIES,
  getProductCategoryKey,
  isDiyProduct,
  isResistanceProduct,
  productMatchesCategory,
  productsByCategorySlugFrom,
  selectHomeHeroProduct,
  sortProductsByMerchandising,
} from './catalog.js'

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
    { id: 'chargeur-usb', name: 'Chargeur USB', category: 'accessoire' },
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

test('legacy DIY components are removed from accessories and exposed in DIY', () => {
  const legacyDiyProducts = [
    { id: 'booster', name: 'Booster Sel de Nicotine 20 mg', category: 'accessoire' },
    { id: 'bottle', name: 'Bouteille Vide 200 ml', category: 'accessoire' },
    { id: 'base', name: 'Base DIY 1 Litre', category: 'accessoire' },
    { id: 'pack', name: 'Pack DIY 6 mg 200 ml', category: 'accessoire' },
  ]
  const accessory = { id: 'charger', name: 'Chargeur MC2 Xtar', category: 'accessoire' }
  const products = [...legacyDiyProducts, accessory]

  assert.ok(legacyDiyProducts.every(isDiyProduct))
  assert.ok(legacyDiyProducts.every((product) => getProductCategoryKey(product) === 'diy'))
  assert.deepEqual(productsByCategorySlugFrom(products, 'diy'), legacyDiyProducts)
  assert.deepEqual(productsByCategorySlugFrom(products, 'accessoires'), [accessory])
})

test('the newest explicitly new product drives the home hero', () => {
  const products = [
    { id: 'best', badge: 'best-seller', createdAt: '2026-07-21T10:00:00.000Z' },
    { id: 'older-new', badge: 'nouveau', createdAt: '2026-07-19T10:00:00.000Z' },
    { id: 'latest-new', badge: 'nouveau', createdAt: '2026-07-20T10:00:00.000Z' },
  ]

  assert.equal(selectHomeHeroProduct(products)?.id, 'latest-new')
})

test('home hero selection ignores stock update timestamps and has stable fallbacks', () => {
  const newProducts = [
    { id: 'created-latest', badge: 'nouveau', createdAt: '2026-07-20', updatedAt: '2026-07-20' },
    { id: 'stock-updated', badge: 'nouveau', createdAt: '2026-07-19', updatedAt: '2026-07-21' },
  ]
  const fallbackProducts = [
    { id: 'regular' },
    { id: 'best', badge: 'best-seller' },
  ]

  assert.equal(selectHomeHeroProduct(newProducts)?.id, 'created-latest')
  assert.equal(selectHomeHeroProduct(fallbackProducts)?.id, 'best')
  assert.equal(selectHomeHeroProduct([{ id: 'first' }, { id: 'second' }])?.id, 'first')
  assert.equal(selectHomeHeroProduct([]), undefined)
})

test('merchandising order uses explicit badges and never synthetic review counts', () => {
  const products = [
    { id: 'many-fake-reviews', stock: 10, reviews: 9999 },
    { id: 'editorial-best', stock: 10, badge: 'best-seller', reviews: 0 },
    { id: 'new', stock: 10, badge: 'nouveau', reviews: 0 },
    { id: 'out', stock: 0, badge: 'best-seller', reviews: 9999 },
  ]

  assert.deepEqual(
    sortProductsByMerchandising(products).map(({ id }) => id),
    ['editorial-best', 'new', 'many-fake-reviews', 'out'],
  )
})
