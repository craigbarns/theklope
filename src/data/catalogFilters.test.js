import assert from 'node:assert/strict'
import test from 'node:test'

import { isAlternativePuffProduct, isEliquide10ml, isEliquide50ml, isEliquide100ml, productsByCategorySlugFrom } from './catalog.js'
import { supportsFlavorVariants } from '../lib/productCategory.js'
import { MAIN_NAV } from './navigation.js'

const liquid = (name, extra = {}) => ({ id: name, name, category: 'eliquide', price: 5.9, stock: 5, ...extra })

test('les filtres de contenance trient sur la contenance réelle, pas sur le nom', () => {
  const tenBySpec = liquid('Fraise', { specs: { Contenance: '10 ml' } })
  const fiftyByField = liquid('Custard', { volume: '50ml' })
  const hundredBySpec = liquid('Cinema', { specs: { Contenance: '100 ml' } })
  // Nom trompeur : la contenance renseignée l'emporte.
  const misleading = liquid('Booster pour 50ml', { volume: '10ml' })
  const nameOnly = liquid('Menthe 10ml')

  assert.equal(isEliquide10ml(tenBySpec), true)
  assert.equal(isEliquide10ml(fiftyByField), false)
  assert.equal(isEliquide10ml(hundredBySpec), false)
  assert.equal(isEliquide10ml(misleading), true)
  assert.equal(isEliquide50ml(misleading), false)
  assert.equal(isEliquide10ml(nameOnly), true)
  assert.equal(isEliquide50ml(fiftyByField), true)
  assert.equal(isEliquide100ml(hundredBySpec), true)
  assert.equal(isEliquide10ml({ name: 'Kit 10ml', category: 'ecig' }), false)
})

test('la page 10 ml existe et le menu y mène', () => {
  const products = [
    liquid('A', { volume: '10ml' }),
    liquid('B', { volume: '50ml' }),
    liquid('C', { specs: { Contenance: '100 ml' } }),
  ]
  assert.deepEqual(productsByCategorySlugFrom(products, 'e-liquides-10ml').map((p) => p.name), ['A'])
  const eliquidMenu = MAIN_NAV.find((entry) => entry.label === 'E-liquides')
  assert.equal(eliquidMenu.children.find((child) => child.label === '10 ml').to, '/categorie/e-liquides-10ml')
})

test('un produit classé « Puffs rechargeables » apparaît dans cette catégorie et garde ses saveurs', () => {
  const refill = { name: 'Recharge Dojo Blast 15k', category: 'alternative-puff' }
  assert.equal(isAlternativePuffProduct(refill), true)
  assert.equal(supportsFlavorVariants('alternative-puff'), true)
  assert.equal(supportsFlavorVariants('cartouches'), true)
  assert.equal(supportsFlavorVariants('sels-nicotine'), true)
  // Le matériel reste exclu.
  assert.equal(supportsFlavorVariants('pod'), false)
  assert.equal(supportsFlavorVariants('ecig'), false)
})
