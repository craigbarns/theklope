import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isEveryNicotineOutOfStock,
  isMissingColumnError,
  isNicotineOutOfStock,
  isProductOrderable,
  normalizeNicotineOutOfStock,
} from './variantStock.js'
import {
  buildCartAddition,
  reconcilePersistedProductVariant,
  resolveProductVariant,
} from './cart.js'
import { normalizeVariant } from '../../api/_lib/orderValidation.js'

const liquid = (overrides = {}) => ({
  id: 'act-1',
  name: 'ACT 1',
  category: 'eliquide',
  price: 5.9,
  stock: 73,
  flavors: ['ACT 1'],
  nicotine: [0, 3, 6, 12, 16],
  nicotineOutOfStock: [6],
  ...overrides,
})

test('les taux en rupture sont bornés aux taux proposés, dans leur ordre', () => {
  assert.deepEqual(normalizeNicotineOutOfStock([16, '6', 99, '3,0'], [0, 3, 6, 12, 16]), [3, 6, 16])
  assert.deepEqual(normalizeNicotineOutOfStock(null, [0, 3]), [])
  assert.deepEqual(normalizeNicotineOutOfStock([3], null), [])
  assert.equal(isNicotineOutOfStock(liquid(), 6), true)
  assert.equal(isNicotineOutOfStock(liquid(), '6'), true)
  assert.equal(isNicotineOutOfStock(liquid(), 3), false)
  assert.equal(isNicotineOutOfStock({ nicotine: [0] }, 0), false)
})

test('le navigateur refuse un taux en rupture et accepte les autres', () => {
  const rejected = resolveProductVariant(liquid(), { nicotine: 6 })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.outOfStock, 'nicotine')
  assert.match(rejected.error, /6 mg de ACT 1 est en rupture/)

  const accepted = resolveProductVariant(liquid(), { nicotine: 3 })
  assert.equal(accepted.ok, true)
  assert.equal(accepted.variant.nicotine, 3)

  const addition = buildCartAddition({
    products: [liquid()],
    entries: [{ productId: 'act-1', qty: 1, variant: { nicotine: 6 } }],
  })
  assert.equal(addition.ok, false)
  assert.match(addition.error, /rupture/)
})

test('un taux unique en rupture n\'est pas complété implicitement', () => {
  const single = liquid({ nicotine: [0], nicotineOutOfStock: [0] })
  assert.equal(resolveProductVariant(single, {}).ok, false)
  assert.equal(normalizeVariant(single, {}).ok, false)
})

test('le serveur refuse au paiement un taux en rupture, même par appel direct', () => {
  const rejected = normalizeVariant(liquid(), { nicotine: '6' })
  assert.equal(rejected.ok, false)
  assert.match(rejected.error, /rupture/)

  const accepted = normalizeVariant(liquid(), { nicotine: '3' })
  assert.equal(accepted.ok, true)
  assert.equal(accepted.variant.nicotine, 3)
})

test('navigateur et serveur sont d\'accord taux par taux', () => {
  const product = liquid({ nicotineOutOfStock: [0, 12] })
  for (const rate of product.nicotine) {
    assert.equal(
      resolveProductVariant(product, { nicotine: rate }).ok,
      normalizeVariant(product, { nicotine: String(rate) }).ok,
      `désaccord sur ${rate} mg`,
    )
  }
})

test('un panier enregistré avec un taux passé en rupture redemande le choix', () => {
  const reconciled = reconcilePersistedProductVariant(liquid(), { flavor: 'ACT 1', nicotine: 6 })
  assert.equal(reconciled.variant.nicotine, undefined)
  assert.equal(reconciled.variant.flavor, 'ACT 1')
  assert.equal(reconciled.complete, false)
  assert.equal(reconciled.changed, true)
})

test('un produit dont tous les taux sont en rupture n\'est plus commandable', () => {
  assert.equal(isProductOrderable(liquid()), true)
  assert.equal(isEveryNicotineOutOfStock(liquid({ nicotineOutOfStock: [0, 3, 6, 12, 16] })), true)
  assert.equal(isProductOrderable(liquid({ nicotineOutOfStock: [0, 3, 6, 12, 16] })), false)
  assert.equal(isProductOrderable(liquid({ stock: 0, nicotineOutOfStock: [] })), false)
  // Le matériel sans nicotine ne dépend que de son stock.
  assert.equal(isProductOrderable({ stock: 4, nicotine: [] }), true)
})

test('une colonne absente (migration non exécutée) est reconnue, pas les autres erreurs', () => {
  assert.equal(isMissingColumnError({
    code: '42703',
    message: 'column products.nicotine_out_of_stock does not exist',
  }), true)
  assert.equal(isMissingColumnError({
    code: 'PGRST204',
    message: "Could not find the 'nicotine_out_of_stock' column of 'products' in the schema cache",
  }), true)
  assert.equal(isMissingColumnError({ code: '42501', message: 'permission denied for table products' }), false)
  assert.equal(isMissingColumnError({ code: '42703', message: 'column products.autre does not exist' }), false)
  assert.equal(isMissingColumnError(null), false)
})
