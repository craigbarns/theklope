import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCartAddition } from './cart.js'
import {
  getMissingConfiguratorVariantChoices,
  getSingleChoiceDefaults,
} from './configurator.js'

const device = {
  id: 'nexi-pro-aspire',
  name: 'Nexi Pro - Aspire',
  category: 'ecig',
  stock: 20,
  colors: ['Noir', 'Champagne'],
}
const unrelatedResistance = {
  id: 'cartouches-vinci-s-voopoo',
  name: 'Cartouches Vinci S - Voopoo Pack de 2',
  category: 'resistance',
  stock: 20,
  ohmOptions: ['0.6'],
}
const liquid = {
  id: 'cassis-framboise-raisin',
  name: 'Cassis Framboise Raisin 10 ml',
  category: 'eliquide',
  stock: 20,
  flavors: ['Cassis Framboise Raisin Frais'],
  nicotine: [3, 6],
}

test('configurator identifies the actual missing choices without blaming a single ohm option', () => {
  const deviceVariant = getSingleChoiceDefaults(device)
  const resistanceVariant = getSingleChoiceDefaults(unrelatedResistance)
  const liquidVariant = getSingleChoiceDefaults(liquid)

  assert.deepEqual(deviceVariant, {})
  assert.deepEqual(resistanceVariant, { ohm: '0.6' })
  assert.deepEqual(liquidVariant, { flavor: 'Cassis Framboise Raisin Frais' })

  const missing = getMissingConfiguratorVariantChoices([
    { section: 'Mod', product: device, variant: deviceVariant },
    { section: 'Résistance', product: unrelatedResistance, variant: resistanceVariant },
    { section: 'Liquide', product: liquid, variant: liquidVariant },
  ])

  assert.deepEqual(missing.map(({ key, label, section }) => ({ key, label, section })), [
    { key: 'color', label: 'Couleur', section: 'Mod' },
    { key: 'nicotine', label: 'Taux de nicotine', section: 'Liquide' },
  ])
})

test('the reported pack becomes addable with the exact explicit choices', () => {
  const variants = [
    { color: 'Noir' },
    { ohm: '0.6' },
    { flavor: 'Cassis Framboise Raisin Frais', nicotine: 3 },
  ]
  const selections = [device, unrelatedResistance, liquid].map((product, index) => ({
    section: ['Mod', 'Résistance', 'Liquide'][index],
    product,
    variant: variants[index],
  }))

  assert.deepEqual(getMissingConfiguratorVariantChoices(selections), [])

  const addition = buildCartAddition({
    products: [device, unrelatedResistance, liquid],
    entries: selections.map(({ product, variant }) => ({ productId: product.id, qty: 1, variant })),
  })
  assert.equal(addition.ok, true)
  assert.deepEqual(addition.prepared.map(({ productId, variant }) => ({ productId, variant })), [
    { productId: 'nexi-pro-aspire', variant: { color: 'Noir' } },
    { productId: 'cartouches-vinci-s-voopoo', variant: { ohm: '0.6' } },
    {
      productId: 'cassis-framboise-raisin',
      variant: { flavor: 'Cassis Framboise Raisin Frais', nicotine: 3 },
    },
  ])
})
