import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_DELIVERY_INSTRUCTIONS_LENGTH } from '../../src/lib/delivery.js'

import {
  aggregateQuantities,
  normalizeVariant,
  parseQuantity,
  validateFulfillment,
} from './orderValidation.js'

const product = {
  name: 'Produit test',
  colors: ['Noir', 'Rouge'],
  flavors: [],
  nicotine: [0, 3, 6],
  ohmOptions: ['0.8'],
}

test('variant values are canonicalized against catalog options', () => {
  const result = normalizeVariant(product, { color: 'rouge', nicotine: '3', ohm: 0.8 })
  assert.deepEqual(result, { ok: true, variant: { color: 'Rouge', nicotine: 3, ohm: '0.8' } })
})

test('missing quick-add variants use catalog defaults', () => {
  const result = normalizeVariant(product, {})
  assert.deepEqual(result.variant, { color: 'Noir', nicotine: 0, ohm: '0.8' })
})

test('impossible and unknown variants are rejected', () => {
  assert.equal(normalizeVariant(product, { nicotine: 12 }).ok, false)
  assert.equal(normalizeVariant(product, { size: 'XL' }).ok, false)
  assert.equal(normalizeVariant(product, { flavor: 'Menthe' }).ok, false)
  assert.equal(normalizeVariant(product, 'Rouge').ok, false)
})

test('quantities are strict and aggregate across variant lines', () => {
  assert.equal(parseQuantity('2'), 2)
  assert.equal(parseQuantity(0), null)
  assert.equal(parseQuantity(1.5), null)
  assert.equal(parseQuantity(101), null)
  const totals = aggregateQuantities([
    { productId: 'p1', qty: 2 },
    { productId: 'p1', qty: 3 },
    { productId: 'p2', qty: 1 },
  ])
  assert.equal(totals.get('p1'), 5)
  assert.equal(totals.get('p2'), 1)
})

test('pickup works without an address and uses the store address', () => {
  const result = validateFulfillment('pickup', { deliveryInstructions: { malicious: true } })
  assert.equal(result.ok, true)
  assert.equal(result.address.zip, '13006')
  assert.equal('deliveryInstructions' in result.address, false)
  assert.equal(validateFulfillment('pickup', null).ok, true)
})

test('courier is restricted to Marseille and postal shipping to France', () => {
  const marseille = { street: '1 rue Test', zip: '13016', city: 'Marseille', country: 'France' }
  assert.equal(validateFulfillment('coursier', marseille).ok, true)
  assert.equal(validateFulfillment('coursier', { ...marseille, zip: '13100' }).ok, false)
  assert.equal(validateFulfillment('poste', { ...marseille, country: 'Belgique' }).ok, false)
  assert.equal(validateFulfillment('poste', null).ok, false)
  assert.equal(validateFulfillment('unknown', marseille).ok, false)
})

test('delivery instructions are optional, trimmed and keep intentional line breaks', () => {
  const address = { street: '1 rue Test', zip: '13016', city: 'Marseille', country: 'France' }
  const empty = validateFulfillment('poste', address)
  assert.equal(empty.ok, true)
  assert.equal(empty.address.deliveryInstructions, '')

  const result = validateFulfillment('coursier', {
    ...address,
    deliveryInstructions: '  3e étage\r\nInterphone Dupont\nAppeler à l’arrivée  ',
  })
  assert.equal(result.ok, true)
  assert.equal(result.address.deliveryInstructions, '3e étage\nInterphone Dupont\nAppeler à l’arrivée')
})

test('delivery instructions reject invalid types and excessive content', () => {
  const address = { street: '1 rue Test', zip: '13016', city: 'Marseille', country: 'France' }
  const exactLimit = validateFulfillment('poste', {
    ...address,
    deliveryInstructions: 'a'.repeat(MAX_DELIVERY_INSTRUCTIONS_LENGTH),
  })
  assert.equal(exactLimit.ok, true)
  assert.equal(exactLimit.address.deliveryInstructions.length, MAX_DELIVERY_INSTRUCTIONS_LENGTH)

  assert.equal(validateFulfillment('poste', { ...address, deliveryInstructions: 'a'.repeat(MAX_DELIVERY_INSTRUCTIONS_LENGTH + 1) }).ok, false)
  assert.equal(validateFulfillment('poste', { ...address, deliveryInstructions: { floor: 3 } }).ok, false)
  assert.equal(validateFulfillment('poste', { ...address, deliveryInstructions: ['3e étage'] }).ok, false)
})
