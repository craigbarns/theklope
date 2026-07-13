import assert from 'node:assert/strict'
import test from 'node:test'

import { computeTotals, getCompletePackSubtotal, isCompletePack } from './pricing.js'

const device = { category: 'ecig', price: 40, qty: 1 }
const accessory = { category: 'accessoire', price: 20, qty: 1 }
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
    { category: 'resistance', price: 30, qty: 3 },
  ]
  assert.equal(getCompletePackSubtotal(lines), 70)
  const totals = computeTotals({ lines, promoCode: 'PACK15' })
  assert.equal(totals.subtotal, 200)
  assert.equal(totals.discount, 10.5)
  assert.equal(totals.total, 189.5)
})
