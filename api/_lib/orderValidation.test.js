import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_DELIVERY_INSTRUCTIONS_LENGTH } from '../../src/lib/delivery.js'

import {
  aggregateQuantities,
  normalizeVariant,
  normalizeVariantIntent,
  parseQuantity,
  validateFulfillment,
} from './orderValidation.js'

const product = {
  name: 'Produit test',
  category: 'eliquide',
  colors: ['Noir', 'Rouge'],
  flavors: [],
  nicotine: [0, 3, 6],
  ohmOptions: ['0.8'],
}

test('variant values are canonicalized against catalog options', () => {
  const result = normalizeVariant(product, { color: 'rouge', nicotine: '3', ohm: 0.8 })
  assert.deepEqual(result, { ok: true, variant: { color: 'Rouge', nicotine: 3, ohm: '0.8' } })
})

test('server validation accepts variants from editorial e-liquid subcategories', () => {
  const subcategoryProduct = {
    ...product,
    category: 'eliquide-fruite',
    colors: [],
    flavors: ['Pêche'],
    nicotine: [0, 3],
    ohmOptions: [],
  }

  assert.deepEqual(normalizeVariant(subcategoryProduct, { flavor: 'pêche', nicotine: '3' }), {
    ok: true,
    variant: { flavor: 'Pêche', nicotine: 3 },
  })
})

test('missing ambiguous variants are rejected and a sole option stays implicit', () => {
  const result = normalizeVariant(product, {})
  assert.equal(result.ok, false)
  assert.match(result.error, /couleur/i)

  const singleChoice = normalizeVariant({
    name: 'Résistance test',
    colors: [],
    flavors: [],
    nicotine: [],
    ohmOptions: ['0.8'],
  }, {})
  assert.deepEqual(singleChoice, { ok: true, variant: { ohm: '0.8' } })
})

test('impossible and unknown variants are rejected', () => {
  assert.equal(normalizeVariant(product, { nicotine: 12 }).ok, false)
  assert.equal(normalizeVariant(product, { size: 'XL' }).ok, false)
  assert.equal(normalizeVariant(product, { flavor: 'Menthe' }).ok, false)
  assert.equal(normalizeVariant(product, 'Rouge').ok, false)
})

test('variant intent can be hashed before catalog lookup', () => {
  assert.deepEqual(normalizeVariantIntent({ nicotine: 3, color: ' Noir ' }), {
    ok: true,
    variant: { color: 'noir', nicotine: '3' },
  })
  assert.equal(normalizeVariantIntent({ hiddenPrice: '1' }).ok, false)
  assert.equal(normalizeVariantIntent('nicotine=3').ok, false)
})

test('legacy liquid fields on hardware never become purchasable variants', () => {
  const hardware = {
    name: 'Kit test',
    category: 'ecig',
    colors: ['Noir'],
    flavors: ['Valeur générée'],
    nicotine: [0, 3, 6],
    ohmOptions: [],
  }
  assert.deepEqual(normalizeVariant(hardware, { color: 'Noir' }), {
    ok: true,
    variant: { color: 'Noir' },
  })
  assert.equal(normalizeVariant(hardware, { color: 'Noir', nicotine: 3 }).ok, false)
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

// --- Mondial Relay : le Point Relais est choisi par le client ----------------
const RELAY_ADDRESS = {
  street: '188 rue de Rome',
  zip: '13006',
  city: 'Marseille',
  country: 'France',
}
const RELAY_POINT = {
  id: 'FR-012345',
  name: 'TABAC DE LA PLACE',
  address: '12 place Castellane',
  postcode: '13006',
  city: 'Marseille',
  country: 'FR',
}

test('la livraison en Point Relais est refusée sans point choisi', () => {
  const result = validateFulfillment('relais', RELAY_ADDRESS, null)
  assert.equal(result.ok, false)
  assert.match(result.error, /Point Relais/)
})

test('un identifiant de Point Relais mal formé est refusé', () => {
  for (const id of ['', '  ', 'FR', 'nimportequoi', '<script>', 'FR-']) {
    const result = validateFulfillment('relais', RELAY_ADDRESS, { ...RELAY_POINT, id })
    assert.equal(result.ok, false, `attendu refusé pour « ${id} »`)
  }
})

test('un Point Relais valide est accepté et normalisé', () => {
  const result = validateFulfillment('relais', RELAY_ADDRESS, RELAY_POINT)
  assert.equal(result.ok, true)
  assert.equal(result.relayPoint.id, 'FR-012345')
  assert.equal(result.relayPoint.name, 'TABAC DE LA PLACE')
  assert.equal(result.method.price, 3.9)
})

test('les libellés du Point Relais sont bornés, seul l’identifiant fait foi', () => {
  const result = validateFulfillment('relais', RELAY_ADDRESS, {
    ...RELAY_POINT,
    name: 'x'.repeat(500),
    address: 'y'.repeat(500),
  })
  assert.equal(result.ok, true)
  assert.ok(result.relayPoint.name.length <= 120)
  assert.ok(result.relayPoint.address.length <= 200)
})

test('les autres modes de livraison ne réclament aucun Point Relais', () => {
  for (const id of ['poste', 'pickup']) {
    const result = validateFulfillment(id, RELAY_ADDRESS, null)
    assert.equal(result.ok, true, `attendu accepté pour ${id}`)
    assert.equal(result.relayPoint, undefined)
  }
})
