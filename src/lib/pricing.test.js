import assert from 'node:assert/strict'
import test from 'node:test'

import {
  computeBundleProgress,
  computeTotals,
  getCompletePackSubtotal,
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
  assert.equal(totals.total, 43.5)
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
      key: volume,
      label: `4 e-liquides ${volume} ou +`,
      amount: 20,
    }])
  }
})

test('50ml and 100ml discount thresholds are tracked independently', () => {
  const lines = [
    { category: 'eliquide', price: 20, qty: 2, volume: '50ml' },
    { category: 'eliquide', price: 30, qty: 2, volume: '100ml' },
  ]
  const totals = computeTotals({ lines })

  assert.equal(totals.subtotal, 100)
  assert.equal(totals.discount, 0)
  assert.deepEqual(computeBundleProgress(lines), [
    {
      key: '50ml',
      progressLabel: 'en 50ml (toutes marques)',
      promoLabel: '-25%',
      current: 2,
      target: 4,
      remaining: 2,
    },
    {
      key: '100ml',
      progressLabel: 'en 100ml (toutes marques)',
      promoLabel: '-25%',
      current: 2,
      target: 4,
      remaining: 2,
    },
  ])
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
