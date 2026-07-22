import assert from 'node:assert/strict'
import test from 'node:test'

import { findCatalogIssues } from './catalogQuality.js'
import { PRODUCTS } from './products.js'

test('catalog quality detects the commercial inconsistencies that can alter pricing or discovery', () => {
  const issues = findCatalogIssues([
    {
      id: 'senois-10',
      name: 'Classico Senois 50 ml',
      category: 'eliquide',
      type: 'E-liquide',
      volume: '10ml',
      specs: { Contenance: '10 ml' },
      price: 5.9,
      stock: 10,
    },
    {
      id: 'coil-as-liquid',
      name: 'Résistances J Series Pack de 5',
      category: 'eliquide',
      type: 'E-liquide',
      price: 5.9,
      stock: 10,
    },
    { id: 'free-product', name: 'Produit actif', category: 'accessoire', price: 0, stock: 1 },
  ])

  assert.deepEqual(
    issues.map(({ code }) => code).sort(),
    ['hardware_as_liquid', 'invalid_price', 'volume_conflict'],
  )
})

test('catalog quality detects accent-insensitive duplicate active names but ignores archived stock', () => {
  const duplicate = { name: 'Classico Grège 50 ml', category: 'eliquide', price: 19.9, stock: 10 }
  const issues = findCatalogIssues([
    { ...duplicate, id: 'grege-a' },
    { ...duplicate, id: 'grege-b', name: '  CLASSICO  GREGE 50 ml ' },
    { ...duplicate, id: 'grege-archive', stock: 0 },
  ])

  assert.equal(issues.length, 1)
  assert.equal(issues[0].code, 'duplicate_active_name')
  assert.deepEqual(issues[0].productIds, ['grege-a', 'grege-b'])
})

test('a coherent catalog produces no quality issue', () => {
  const issues = findCatalogIssues([
    {
      id: 'cerise-50',
      name: 'Cerise Griotte 50ml',
      category: 'eliquide',
      type: 'E-liquide',
      volume: '50ml',
      specs: { Contenance: '50 ml' },
      price: 19.9,
      stock: 20,
    },
  ])

  assert.deepEqual(issues, [])
})

test('the local fallback catalog has no sellable data-quality issue', () => {
  assert.deepEqual(findCatalogIssues(PRODUCTS), [])
})
