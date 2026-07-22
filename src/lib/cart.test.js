import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildCartAddition,
  buildCartVariantUpdate,
  getProductVariantChoices,
  isCartCatalogResolved,
  isCartCatalogVerified,
  productRequiresVariantSelection,
  reconcilePersistedProductVariant,
  resolveProductVariant,
} from './cart.js'

const products = [
  { id: 'device', stock: 2, colors: ['Noir'] },
  { id: 'liquid', category: 'eliquide', stock: 3, nicotine: [0, 3] },
]

test('a persisted cart is blocked until every line is resolved by the live catalog', () => {
  const cart = [
    { productId: 'known', qty: 1 },
    { productId: 'newer-than-bootstrap', qty: 1 },
  ]

  assert.equal(isCartCatalogVerified({ cart, cartDetailed: [], catalogReady: false }), false)
  assert.equal(isCartCatalogVerified({ cart, cartDetailed: [{ index: 0 }], catalogReady: true }), false)
  assert.equal(isCartCatalogVerified({ cart, cartDetailed: [{ index: 0 }, { index: 1 }], catalogReady: true }), true)
  assert.equal(isCartCatalogVerified({ cart: [], cartDetailed: [], catalogReady: false }), true)
})

test('catalog verification rejects an obsolete or incomplete saved variant', () => {
  const cart = [{ productId: 'liquid', qty: 1, variant: { nicotine: 12 } }]
  const cartDetailed = [{ ...cart[0], product: products[1] }]

  assert.equal(isCartCatalogResolved({ cart, cartDetailed, catalogReady: true }), true)
  assert.equal(isCartCatalogVerified({ cart, cartDetailed, catalogReady: true }), false)
  assert.deepEqual(reconcilePersistedProductVariant(products[1], cart[0].variant), {
    variant: {},
    complete: false,
    changed: true,
  })
})

test('saved variants keep valid choices, drop obsolete fields and apply sole defaults', () => {
  const product = {
    id: 'liquid-single',
    category: 'eliquide',
    nicotine: [3],
    flavors: ['Menthe', 'Fraise'],
  }
  assert.deepEqual(reconcilePersistedProductVariant(product, {
    nicotine: 12,
    flavor: 'menthe',
    color: 'ancienne option',
  }), {
    variant: { flavor: 'Menthe', nicotine: 3 },
    complete: true,
    changed: true,
  })
})

test('a multi-product addition is atomic when one product lacks stock', () => {
  const cart = [{ productId: 'liquid', qty: 3, variant: { nicotine: 0 } }]
  const result = buildCartAddition({
    cart,
    products,
    entries: [
      { productId: 'device', qty: 1 },
      { productId: 'liquid', qty: 1, variant: { nicotine: 3 } },
    ],
  })

  assert.equal(result.ok, false)
  assert.strictEqual(result.cart, cart)
})

test('a complete multi-product addition applies single-option defaults and merges variants', () => {
  const result = buildCartAddition({
    cart: [{ productId: 'device', qty: 1, variant: { color: 'Noir' } }],
    products,
    entries: [
      { productId: 'device', qty: 1 },
      { productId: 'liquid', qty: 1, variant: { nicotine: 3 } },
    ],
  })

  assert.equal(result.ok, true)
  assert.deepEqual(result.cart, [
    { productId: 'device', qty: 2, variant: { color: 'Noir' } },
    { productId: 'liquid', qty: 1, variant: { nicotine: 3 } },
  ])
})

test('an ambiguous variant is never selected silently', () => {
  const cart = []
  const result = buildCartAddition({
    cart,
    products,
    entries: [{ productId: 'liquid', qty: 1 }],
  })

  assert.equal(productRequiresVariantSelection(products[1]), true)
  assert.equal(result.ok, false)
  assert.strictEqual(result.cart, cart)
  assert.match(result.error, /Taux de nicotine/)
})

test('variant values are canonicalized against catalog values', () => {
  const result = resolveProductVariant(
    { name: 'Test', category: 'eliquide', stock: 1, colors: ['Noir', 'Rouge'], nicotine: [0, 3] },
    { color: 'rouge', nicotine: '3' },
  )

  assert.deepEqual(result, { ok: true, variant: { color: 'Rouge', nicotine: 3 } })
})

test('editing a variant is atomic and merges an identical cart line', () => {
  const cart = [
    { productId: 'liquid', qty: 1, variant: { nicotine: 0 } },
    { productId: 'liquid', qty: 2, variant: { nicotine: 3 } },
  ]
  const result = buildCartVariantUpdate({
    cart,
    products,
    index: 0,
    variant: { nicotine: '3' },
  })

  assert.equal(result.ok, true)
  assert.deepEqual(result.cart, [
    { productId: 'liquid', qty: 3, variant: { nicotine: 3 } },
  ])
})

test('cart editing can repair several missing choices progressively', () => {
  const multiOptionProduct = {
    id: 'multi',
    stock: 2,
    category: 'eliquide',
    colors: ['Noir', 'Rouge'],
    nicotine: [0, 3],
  }
  const initialCart = [{ productId: 'multi', qty: 1, variant: {} }]
  const colorUpdate = buildCartVariantUpdate({
    cart: initialCart,
    products: [multiOptionProduct],
    index: 0,
    variant: { color: 'Rouge' },
  })
  assert.equal(colorUpdate.ok, true)
  assert.deepEqual(colorUpdate.cart[0].variant, { color: 'Rouge' })
  assert.equal(resolveProductVariant(multiOptionProduct, colorUpdate.cart[0].variant).ok, false)

  const nicotineUpdate = buildCartVariantUpdate({
    cart: colorUpdate.cart,
    products: [multiOptionProduct],
    index: 0,
    variant: { ...colorUpdate.cart[0].variant, nicotine: 3 },
  })
  assert.equal(nicotineUpdate.ok, true)
  assert.deepEqual(nicotineUpdate.cart[0].variant, { color: 'Rouge', nicotine: 3 })
  assert.equal(resolveProductVariant(multiOptionProduct, nicotineUpdate.cart[0].variant).ok, true)
})

test('an invalid cart variant edit leaves the original cart untouched', () => {
  const cart = [{ productId: 'liquid', qty: 1, variant: { nicotine: 0 } }]
  const result = buildCartVariantUpdate({ cart, products, index: 0, variant: { nicotine: 12 } })

  assert.equal(result.ok, false)
  assert.strictEqual(result.cart, cart)
})

test('liquid-only fields are ignored on hardware even if legacy data contains them', () => {
  const legacyHardware = {
    id: 'legacy-device',
    name: 'Kit test',
    category: 'ecig',
    stock: 2,
    colors: ['Noir', 'Bleu'],
    flavors: ['Valeur générée'],
    nicotine: [0, 3, 6],
  }

  assert.deepEqual(getProductVariantChoices(legacyHardware).map(({ key }) => key), ['color'])
  assert.deepEqual(resolveProductVariant(legacyHardware, { color: 'Noir' }), {
    ok: true,
    variant: { color: 'Noir' },
  })
  assert.equal(resolveProductVariant(legacyHardware, { color: 'Noir', nicotine: 3 }).ok, false)
})
