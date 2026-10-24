import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BADGES,
  CATEGORIES,
  categoryThumbnailProduct,
  displayBadge,
  diversifyProducts,
  featuredProducts,
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

test('editorial e-liquid subcategories remain visible in the parent and explicit category', () => {
  const product = {
    id: 'peche-liquidarom',
    name: 'Pêche 10 ml - Liquidarom',
    category: 'eliquide-fruite',
    type: 'E-liquide',
  }

  assert.equal(productMatchesCategory(product, 'eliquide'), true)
  assert.equal(productMatchesCategory(product, 'eliquide-fruite'), true)
  assert.deepEqual(productsByCategorySlugFrom([product], 'e-liquides'), [product])
  assert.deepEqual(productsByCategorySlugFrom([product], 'e-liquides-fruites'), [product])
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

  assert.equal(selectHomeHeroProduct(products, Date.parse('2026-07-22T00:00:00Z'))?.id, 'latest-new')
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

  assert.equal(selectHomeHeroProduct(newProducts, Date.parse('2026-07-22T00:00:00Z'))?.id, 'created-latest')
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

test('la page « sans nicotine » réunit les e-liquides disponibles en 0 mg', () => {
  const tenWithZero = { id: 'a', name: 'Cerise Fraise 10 ml', category: 'eliquide', brand: 'Liquidarom', volume: '10ml', nicotine: [0, 3, 6] }
  const tenWithoutZero = { id: 'b', name: 'Sel 10 ml', category: 'eliquide', brand: 'X', volume: '10ml', nicotine: [3, 6] }
  const shortfill = { id: 'c', name: 'Tarte aux fraises 50ml', category: 'eliquide-fruite', brand: 'JNR', volume: '60ml', nicotine: [] }
  const hundred = { id: 'd', name: 'Harry 100 ml', category: 'eliquide', brand: 'Replay', volume: '100ml' }
  const kit = { id: 'e', name: 'Drag H40', category: 'ecig', brand: 'Voopoo', nicotine: [0] }
  assert.equal(productMatchesCategory(tenWithZero, 'eliquide-sans-nicotine'), true)
  assert.equal(productMatchesCategory(tenWithoutZero, 'eliquide-sans-nicotine'), false)
  assert.equal(productMatchesCategory(shortfill, 'eliquide-sans-nicotine'), true)
  assert.equal(productMatchesCategory(hundred, 'eliquide-sans-nicotine'), true)
  assert.equal(productMatchesCategory(kit, 'eliquide-sans-nicotine'), false)
  assert.ok(CATEGORIES.some((c) => c.slug === 'e-liquides-sans-nicotine' && c.key === 'eliquide-sans-nicotine'))
})

test('la page marque Adalya liste les e-liquides Adalya', () => {
  const adalya = CATEGORIES.find((c) => c.slug === 'marque-adalya')
  assert.ok(adalya)
  assert.equal(productMatchesCategory({ name: 'Love 66 60 ml - Adalya', brand: 'Adalya', category: 'eliquide' }, adalya.key), true)
  assert.equal(productMatchesCategory({ name: 'Hawai 60 ml', brand: 'ADALYA', category: 'eliquide' }, adalya.key), true)
  assert.equal(productMatchesCategory({ name: 'Drag H40', brand: 'Voopoo', category: 'ecig' }, adalya.key), false)
})

test('la vitrine alterne matériel, e-liquides et consommables, sans aligner une marque', () => {
  const liquid = (id, brand) => ({ id, brand, category: 'eliquide', stock: 5, badge: 'nouveau' })
  const products = [
    liquid('f1', 'Fruizee'), liquid('f2', 'Fruizee'), liquid('f3', 'Fruizee'), liquid('j1', 'JNR'),
    { id: 'pod', brand: 'Aspire', category: 'pod', stock: 3 },
    { id: 'coil', brand: 'Voopoo', category: 'resistance', stock: 9 },
    { id: 'out', brand: 'Voopoo', category: 'ecig', stock: 0 },
  ]
  const ids = diversifyProducts(products).map((p) => p.id)
  assert.deepEqual(ids.slice(0, 3), ['pod', 'f1', 'coil'], 'une famille après l’autre')
  assert.equal(ids[3], 'j1', 'une autre marque avant de revenir à Fruizee')
  assert.equal(ids.at(-1), 'out', 'les ruptures restent en fin de liste')
  assert.equal(new Set(ids).size, products.length)
})

test('débutants : packs puis pods, jamais une box à accus ; accueil sans doublon', () => {
  const products = [
    { id: 'octa', category: 'ecig', name: 'Armour Octa 220W', stock: 4, badge: 'nouveau' },
    { id: 'pixo', category: 'pod', name: 'Pixo Aura 2', stock: 4 },
    { id: 'xlim', category: 'pod', name: 'Xlim Pro 3', stock: 2 },
    { id: 'pod-out', category: 'pod', name: 'Ancien pod', stock: 0 },
    { id: 'liq', category: 'eliquide', name: 'Fraise 50 ml', stock: 9, badge: 'nouveau' },
  ]
  const { starterPacks, bestSellers } = featuredProducts(products)
  assert.deepEqual(starterPacks.map((p) => p.id), ['pixo', 'xlim'])
  assert.ok(!bestSellers.some((p) => p.badge === 'nouveau'), 'les nouveautés ont leur propre bloc')
})

test('vignettes de catégorie : un produit de la catégorie, sinon aucun', () => {
  const products = [
    { id: 'liq', category: 'eliquide', image: '/a.jpg' },
    { id: 'coil', category: 'resistance', image: '/b.jpg' },
  ]
  assert.equal(categoryThumbnailProduct('resistance', products)?.id, 'coil')
  assert.equal(categoryThumbnailProduct('accessoire', products), null, 'jamais un e-liquide pour les accessoires')
  assert.equal(categoryThumbnailProduct('eliquide', products)?.id, 'liq')
})

test('le badge « Nouveau » s’efface 45 jours après la mise en ligne', () => {
  const now = Date.parse('2026-10-24T12:00:00Z')
  assert.equal(displayBadge({ badge: 'nouveau', createdAt: '2026-10-01T00:00:00Z' }, now), 'nouveau')
  assert.equal(displayBadge({ badge: 'nouveau', createdAt: '2026-08-01T00:00:00Z' }, now), null)
  assert.equal(displayBadge({ badge: 'nouveau' }, now), 'nouveau', 'sans date, le badge saisi reste')
  assert.equal(displayBadge({ badge: 'best-seller', createdAt: '2020-01-01T00:00:00Z' }, now), 'best-seller')
  assert.equal(displayBadge({}, now), null)
})
