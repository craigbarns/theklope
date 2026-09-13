import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PROMO_CODES,
  computeBundleProgress,
  computeTotals,
  getCompletePackSubtotal,
  getQuantityPricingRule,
  isCompletePack,
  resolveVolume,
} from './pricing.js'

const device = { category: 'ecig', price: 40, qty: 1 }
const accessory = { category: 'accessoire', price: 20, qty: 1 }
const resistance = { category: 'resistance', price: 30, qty: 1 }
const liquid = { category: 'eliquide', price: 10, qty: 1, volume: '10ml', brand: 'Other' }

test('editorial e-liquid subcategories receive the advertised quantity price', () => {
  const product = {
    category: 'eliquide-fruite',
    brand: 'Liquidarom',
    volume: '10ml',
    price: 5.9,
  }
  const rule = getQuantityPricingRule(product)
  assert.equal(rule.minQty, 20)
  assert.equal(rule.discountPercent, 50)
  assert.equal(rule.discountedUnitPrice, 2.95)

  const totals = computeTotals({ lines: [{ ...product, qty: 20 }], shippingMethodId: 'pickup' })
  assert.equal(totals.discount, 59)
  assert.equal(totals.total, 59)
})

test('aucun code de remise ne subsiste (conformite L3513-4)', () => {
  // Article L3513-4 du code de la sante publique : toute publicite, directe ou
  // indirecte, en faveur des produits du vapotage est interdite. Ce test empeche
  // la reintroduction d'un code de remise sans decision explicite.
  assert.deepEqual(Object.keys(PROMO_CODES), [])

  for (const code of ['THEKLOPE10', 'BIENVENUE', 'BIENVENUE15', 'PACK15', 'LIVRAISON']) {
    const totals = computeTotals({ lines: [device], shippingMethodId: 'pickup', promoCode: code })
    assert.equal(totals.promo, null, `${code} ne doit plus etre reconnu`)
    assert.equal(totals.appliedPromo, null, `${code} ne doit plus s'appliquer`)
    assert.equal(totals.discount, 0, `${code} ne doit accorder aucune remise`)
  }
})

test('le tarif quantite automatique reste applique sans aucun code', () => {
  // Le prix de lot subsiste (« Pack 20 e-liquides »), seule sa mise en avant
  // publicitaire a ete retiree des pages.
  const totals = computeTotals({
    lines: [{ category: 'eliquide', price: 5.9, qty: 20, volume: '10ml', brand: 'Pulp' }],
    shippingMethodId: 'pickup',
  })
  assert.equal(totals.discountSource, 'auto')
  assert.equal(totals.total, 88.5)
})

test('50ml and 100ml receive the same automatic discount from four units', () => {
  for (const volume of ['50ml', '100ml']) {
    const totals = computeTotals({
      lines: [{ category: 'eliquide', price: 20, qty: 4, volume, brand: 'Other' }],
    })

    assert.equal(totals.subtotal, 80)
    assert.equal(totals.discount, 20)
    assert.equal(totals.discountSource, 'auto')
    assert.equal(totals.total, 60)
    assert.deepEqual(totals.autoDiscount.details, [{
      key: '50-100ml',
      label: 'Tarif quantité · 4 e-liquides 50/100ml ou +',
      amount: 20,
    }])
  }
})

test('50ml and 100ml formats and brands combine toward the four-unit threshold', () => {
  const lines = [
    { category: 'eliquide', price: 19.9, qty: 2, volume: '50ml', brand: 'Freaks' },
    { category: 'eliquide', price: 24.9, qty: 2, volume: '100ml', brand: 'Other' },
  ]
  const totals = computeTotals({ lines })

  assert.equal(totals.subtotal, 89.6)
  assert.equal(totals.discount, 22.4)
  assert.equal(totals.total, 67.2)
  assert.deepEqual(computeBundleProgress(lines), [])
})

test('large-format progress combines 50ml and 100ml before the threshold', () => {
  const lines = [
    { category: 'eliquide', price: 19.9, qty: 1, volume: '50ml' },
    { category: 'eliquide', price: 24.9, qty: 2, volume: '100ml' },
  ]

  assert.deepEqual(computeBundleProgress(lines), [{
    key: '50-100ml',
    progressLabel: 'en 50/100ml (formats et marques combinables)',
    promoLabel: 'tarif quantité',
    current: 3,
    target: 4,
    remaining: 1,
  }])
})

test('Liquidarom, Freaks and Secret Garden 10ml combine at 20 units with 50% on every unit', () => {
  const lines = [
    { category: 'eliquide', price: 5.9, qty: 7, volume: '10ml', brand: 'Liquidarom' },
    { category: 'eliquide', price: 5.9, qty: 7, volume: '10 ml', brand: 'Freaks' },
    { category: 'eliquide', price: 5.9, qty: 7, volume: '10ml', brand: "Secret's Garden" },
  ]
  const totals = computeTotals({ lines })

  assert.equal(totals.subtotal, 123.9)
  assert.equal(totals.discount, 61.95)
  assert.equal(totals.total, 61.95)
  assert.deepEqual(totals.autoDiscount.details, [{
    key: '10ml-liquidarom-freaks-secret-garden',
    label: 'Tarif quantité 10ml · Liquidarom / Freaks / Secret Garden',
    amount: 61.95,
  }])
})

test('Alfaliquid and Pulp 10ml combine at 20 units with an exact 25% total', () => {
  const totals = computeTotals({
    lines: [
      { category: 'eliquide', price: 5.9, qty: 10, volume: '10ml', brand: 'Alfaliquid' },
      { category: 'eliquide', price: 5.9, qty: 10, volume: '10ml', brand: 'Pulp' },
    ],
  })

  assert.equal(totals.subtotal, 118)
  assert.equal(totals.discount, 29.5)
  assert.equal(totals.total, 88.5)
})

test('quantity pricing only starts at 20 units and includes every later eligible unit', () => {
  const makeTotals = (qty) => computeTotals({
    lines: [{ category: 'eliquide', price: 5.9, qty, volume: '10ml', brand: 'Liquidarom' }],
  })

  assert.equal(makeTotals(19).discount, 0)
  assert.equal(makeTotals(20).discount, 59)
  assert.equal(makeTotals(21).discount, 61.95)
})

test('10ml brand groups stay independent below their respective thresholds', () => {
  const totals = computeTotals({
    lines: [
      { category: 'eliquide', price: 5.9, qty: 10, volume: '10ml', brand: 'Liquidarom' },
      { category: 'eliquide', price: 5.9, qty: 10, volume: '10ml', brand: 'Pulp' },
    ],
  })

  assert.equal(totals.discount, 0)
})

test('automatic quantity pricing rounds once per eligible group in integer cents', () => {
  const totals = computeTotals({
    lines: [
      { category: 'eliquide', price: 5.71, qty: 21, volume: '10ml', brand: 'Liquidarom' },
    ],
  })

  assert.equal(totals.subtotal, 119.91)
  assert.equal(totals.discount, 59.96)
  assert.equal(totals.total, 59.95)
  assert.equal(
    totals.autoDiscount.details.reduce((sum, detail) => sum + detail.amount, 0),
    totals.autoDiscount.total,
  )
})

test('product quantity information uses resolved volume and exact cart arithmetic', () => {
  assert.deepEqual(getQuantityPricingRule({
    category: 'eliquide',
    brand: 'Pulp',
    price: 5.9,
    specs: { Contenance: 'Flacon de 10 ml' },
  }), {
    key: '10ml-alfaliquid-pulp',
    minQty: 20,
    rate: 0.25,
    discountPercent: 25,
    unitPrice: 5.9,
    discountedUnitPrice: 4.42,
    conditionLabel: 'À partir de 20 flacons 10ml combinables parmi Alfaliquid et Pulp',
    exampleTotal: 88.5,
  })

  assert.deepEqual(getQuantityPricingRule({
    category: 'eliquide',
    brand: 'Other',
    price: 19.9,
    specs: { Contenance: '50 ml' },
  }), {
    key: '50-100ml',
    minQty: 4,
    rate: 0.25,
    discountPercent: 25,
    unitPrice: 19.9,
    discountedUnitPrice: 14.92,
    conditionLabel: 'À partir de 4 flacons 50ml ou 100ml combinables, toutes marques',
    exampleTotal: 59.7,
  })
  assert.equal(getQuantityPricingRule({ category: 'accessoire', volume: '50ml', price: 19.9 }), null)
})

test('volume discount excludes other categories and other bottle sizes', () => {
  const totals = computeTotals({
    lines: [
      { category: 'accessoire', price: 20, qty: 4, volume: '100ml' },
      { category: 'eliquide', price: 20, qty: 4, volume: '60ml' },
    ],
  })

  assert.equal(totals.discount, 0)
  assert.deepEqual(totals.autoDiscount.details, [])
})

test('volume resolution recognizes 100ml without confusing larger or ambiguous sizes', () => {
  assert.equal(resolveVolume({ volume: '100 ml' }), '100ml')
  assert.equal(resolveVolume({ specs: { Contenance: 'Flacon de 100 ML' } }), '100ml')
  assert.equal(resolveVolume({ specs: { Contenance: '150 ml' } }), '150ml')
  assert.equal(resolveVolume({ specs: { Contenance: '250 ml' } }), '250ml')
  assert.equal(resolveVolume({ specs: { Contenance: '50ml / 100ml' } }), '50ml/100ml')
})
