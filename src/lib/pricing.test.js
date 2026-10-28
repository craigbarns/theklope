import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FREE_SHIPPING_THRESHOLD,
  LOWEST_SHIPPING_COST,
  PROMO_CODES,
  SHIPPING_METHODS,
  computeBundleProgress,
  computeTotals,
  getCompletePackSubtotal,
  getQuantityPricingRule,
  isCompletePack,
  priceGridRuleFor,
  resolveVolume,
} from './pricing.js'

const device = { category: 'ecig', price: 40, qty: 1 }
const accessory = { category: 'accessoire', price: 20, qty: 1 }
const resistance = { category: 'resistance', price: 30, qty: 1 }
const liquid = { category: 'eliquide', price: 10, qty: 1, volume: '10ml', brand: 'Other' }

test('aucun code de remise ne subsiste (conformite L3513-4)', () => {
  // Article L3513-4 du code de la sante publique : toute publicite, directe ou
  // indirecte, en faveur des produits du vapotage est interdite. Ce test empeche
  // la reintroduction d'un code de remise sans decision explicite.
  assert.deepEqual(Object.keys(PROMO_CODES), [])

  for (const code of ['THEKLOPE10', 'BIENVENUE', 'BIENVENUE15', 'PACK15', 'LIVRAISON']) {
    const totals = computeTotals({ lines: [device], shippingMethodId: 'relais', promoCode: code })
    assert.equal(totals.promo, null, `${code} ne doit plus etre reconnu`)
    assert.equal(totals.appliedPromo, null, `${code} ne doit plus s'appliquer`)
    assert.equal(totals.discount, 0, `${code} ne doit accorder aucune remise`)
  }
})

test('plus aucune remise par lot depuis le 13/10/2026 (prix unitaires de la grille)', () => {
  const twentyTen = computeTotals({
    lines: [{ category: 'eliquide', price: 2.95, qty: 20, volume: '10ml', brand: 'Liquidarom' }],
    shippingMethodId: 'relais',
  })
  assert.equal(twentyTen.discount, 0)
  assert.equal(twentyTen.discountSource, null)
  assert.equal(twentyTen.subtotal, 59)
  assert.equal(twentyTen.total, 59, 'livraison offerte dès 49 €')

  const fourFifty = computeTotals({
    lines: [{ category: 'eliquide', price: 14.9, qty: 4, volume: '50ml', brand: 'JNR' }],
  })
  assert.equal(fourFifty.discount, 0)
  assert.deepEqual(computeBundleProgress([{ category: 'eliquide', price: 14.9, qty: 3, volume: '50ml' }]), [])
  assert.equal(getQuantityPricingRule({ category: 'eliquide', brand: 'Liquidarom', volume: '10ml', price: 2.95 }), null)
})

test('grille de prix : 2,95 / 4,40 / 14,90 / 18,60 selon marque et contenance', () => {
  const price = (product) => priceGridRuleFor(product)?.price ?? null
  assert.equal(price({ category: 'eliquide-fruite', brand: 'Liquidarom', volume: '10ml' }), 2.95)
  assert.equal(price({ category: 'eliquide', brand: 'Freaks', volume: '10 ml' }), 2.95)
  assert.equal(price({ category: 'eliquide', brand: "Secret's Garden", name: 'The Fox 10 ml' }), 2.95)
  assert.equal(price({ category: 'eliquide', brand: 'Alfaliquid', volume: '10ml' }), 4.4)
  assert.equal(price({ category: 'eliquide', brand: 'Pulp', specs: { Contenance: 'Flacon de 10 ml' } }), 4.4)
  assert.equal(price({ category: 'eliquide', brand: 'JNR', name: 'Tarte aux fraises 50ml', volume: '60ml' }), 14.9)
  assert.equal(price({ category: 'eliquide', brand: 'Liquidarom', volume: '50ml' }), 14.9)
  assert.equal(price({ category: 'eliquide', brand: 'Other', specs: { Contenance: '100 ml' } }), 18.6)
  // Hors grille : autres marques en 10 ml, 60 ml, matériel.
  assert.equal(price({ category: 'eliquide', brand: 'JNR', volume: '10ml' }), null)
  assert.equal(price({ category: 'eliquide', brand: 'Petit Nuage', volume: '60ml' }), null)
  assert.equal(price({ category: 'accessoire', volume: '50ml' }), null)
})

test('livraison offerte dès 49 € et retrait en boutique gratuit (24/10/2026)', () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 49)
  assert.deepEqual(SHIPPING_METHODS.map((m) => m.id), ['relais', 'poste', 'coursier', 'pickup'])
  const at = (price, shippingMethodId) => computeTotals({ lines: [{ category: 'ecig', price, qty: 1 }], shippingMethodId })
  assert.equal(at(48.99, 'relais').shipping, 3.9)
  assert.equal(at(48.99, 'poste').shipping, 7.5)
  assert.equal(at(48.99, 'coursier').shipping, 7.5)
  for (const id of ['relais', 'poste', 'coursier']) assert.equal(at(49, id).shipping, 0)
  assert.equal(at(2.95, 'pickup').shipping, 0, 'retrait gratuit quel que soit le montant')
  assert.equal(LOWEST_SHIPPING_COST, 3.9, 'le retrait n’est pas une livraison')
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

test('shortfills : le format vendu (50/100 ml) compte, pas la taille du flacon', () => {
  assert.equal(resolveVolume({ name: 'Tarte aux fraises 50ml', volume: '60ml' }), '50ml')
  assert.equal(resolveVolume({ name: 'Canopée Cèdre', specs: { Contenance: '50 ml dans un flacon de 75 ml' } }), '50ml')
  assert.equal(resolveVolume({ name: 'JNR Kiwi 50ml', specs: { Contenance: '50 ml (flacon 70 ml)' } }), '50ml')
  assert.equal(resolveVolume({ name: 'XL 100ml', volume: '120ml' }), '100ml')
  assert.equal(resolveVolume({ name: 'Mangue 50ml' }), '50ml')
  // Inchangé : un vrai 60 ml, un 10 ml, une contenance ambiguë.
  assert.equal(resolveVolume({ name: 'Petit Nuage 60ml', volume: '60ml' }), '60ml')
  assert.equal(resolveVolume({ name: 'Booster pour 50ml', volume: '10ml' }), '10ml')
  assert.notEqual(resolveVolume({ name: 'Duo', volume: '50ml / 100ml' }), '50ml')

  assert.equal(priceGridRuleFor({ name: 'Canopée Cèdre 50ml', volume: '60ml', category: 'eliquide', brand: 'X' }).price, 14.9)
})
