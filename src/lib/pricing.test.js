import assert from 'node:assert/strict'
import test from 'node:test'

import {
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

test('PACK15 is rejected outside a complete configured pack', () => {
  const totals = computeTotals({ lines: [device], promoCode: 'PACK15' })
  assert.equal(totals.promo, null)
  assert.equal(totals.promoRejected, true)
  assert.equal(totals.discount, 0)
})

test('PACK15 applies to a device, accessory and e-liquid composition', () => {
  const lines = [device, accessory, liquid]
  assert.equal(isCompletePack(lines), true)
  const totals = computeTotals({ lines, promoCode: 'PACK15' })
  assert.equal(totals.promo.code, 'PACK15')
  assert.equal(totals.discount, 10.5)
  assert.equal(totals.total, 59.5)
})

test('PACK15 accepts the canonical resistance category', () => {
  const lines = [device, resistance, liquid]
  assert.equal(isCompletePack(lines), true)
  const totals = computeTotals({ lines, promoCode: 'PACK15' })
  assert.equal(totals.promo.code, 'PACK15')
  assert.equal(totals.discount, 12)
  assert.equal(totals.total, 68)
})

test('regular promo codes keep working outside packs', () => {
  const totals = computeTotals({ lines: [device], promoCode: 'THEKLOPE10' })
  assert.equal(totals.discount, 4)
  assert.equal(totals.total, 36)
})

test('percentage promo codes round half cents deterministically', () => {
  const tenPercent = computeTotals({
    lines: [{ category: 'ecig', price: 1.45, qty: 1 }],
    shippingMethodId: 'pickup',
    promoCode: 'THEKLOPE10',
  })
  assert.equal(tenPercent.discount, 0.15)
  assert.equal(tenPercent.total, 1.3)

  const fifteenPercent = computeTotals({
    lines: [{ category: 'ecig', price: 6.9, qty: 1 }],
    shippingMethodId: 'pickup',
    promoCode: 'BIENVENUE',
  })
  assert.equal(fifteenPercent.discount, 1.04)
  assert.equal(fifteenPercent.total, 5.86)

  const fifteenPercentAlias = computeTotals({
    lines: [{ category: 'ecig', price: 6.9, qty: 1 }],
    shippingMethodId: 'pickup',
    promoCode: 'bienvenue15',
  })
  assert.equal(fifteenPercentAlias.discount, 1.04)
  assert.equal(fifteenPercentAlias.total, 5.86)
})

test('PACK15 discounts one configured pack, not extra quantities or unrelated items', () => {
  const lines = [
    { ...device, qty: 2 },
    accessory,
    liquid,
    { ...resistance, qty: 3 },
  ]
  assert.equal(getCompletePackSubtotal(lines), 80)
  const totals = computeTotals({ lines, promoCode: 'PACK15' })
  assert.equal(totals.subtotal, 200)
  assert.equal(totals.discount, 12)
  assert.equal(totals.total, 188)
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

test('a valid code is only marked applied when it actually sets price or shipping', () => {
  const automaticWins = computeTotals({
    lines: [{ category: 'eliquide', price: 5.9, qty: 20, volume: '10ml', brand: 'Pulp' }],
    promoCode: 'BIENVENUE',
  })
  assert.equal(automaticWins.promo.code, 'BIENVENUE')
  assert.equal(automaticWins.discountSource, 'auto')
  assert.equal(automaticWins.appliedPromo, null)

  const percentCodeWins = computeTotals({ lines: [device], promoCode: 'THEKLOPE10' })
  assert.equal(percentCodeWins.discountSource, 'promo')
  assert.equal(percentCodeWins.appliedPromo.code, 'THEKLOPE10')

  const shippingCodeAppliesWithQuantityPricing = computeTotals({
    lines: [{ category: 'eliquide', price: 5.9, qty: 20, volume: '10ml', brand: 'Pulp' }],
    promoCode: 'LIVRAISON',
  })
  assert.equal(shippingCodeAppliesWithQuantityPricing.discountSource, 'auto')
  assert.equal(shippingCodeAppliesWithQuantityPricing.appliedPromo.code, 'LIVRAISON')
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
