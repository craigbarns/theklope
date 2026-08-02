import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getProductSearchScore,
  matchesProductSearch,
  normalizeSearchText,
  rankProductsBySearch,
  searchProducts,
  tokenizeSearchQuery,
} from './productSearch.js'

const products = [
  {
    id: 'soleil-levant',
    name: 'Soleil levant',
    brand: 'Maison Test',
    type: 'E-liquide',
    category: 'eliquide',
    flavors: ['Pêche glacée', 'Fruits rouges'],
    short: 'Une référence fruitée.',
    specs: {
      Contenance: '50 ml',
      Ratio: '50 PG / 50 VG',
    },
  },
  {
    id: 'coil-corex',
    name: 'Résistances Corex',
    brand: 'Vaporesso',
    type: 'Résistance',
    category: 'resistance',
    flavors: [],
    specs: {
      Compatibilité: 'Pods XROS 4 et XROS Pro',
      Valeur: '0,6 ohm',
    },
  },
  {
    id: 'classic-blond',
    name: 'Le Blond',
    brand: 'Maison Test',
    type: 'E-liquide',
    category: 'eliquide',
    flavors: ['Classic blond'],
    specs: { Contenance: '10 ml' },
  },
  {
    id: 'xros-kit',
    name: 'Kit XROS Pro',
    brand: 'Vaporesso',
    type: 'Cigarette électronique',
    category: 'ecig',
    flavors: [],
    specs: { Charge: 'USB-C' },
  },
]

test('search normalization is case, accent and punctuation insensitive while preserving decimals', () => {
  assert.equal(
    normalizeSearchText('  É-LIQUIDE Pêche & Crème 0,6 Ω  '),
    'e liquide peche creme 0.6 ω',
  )
  assert.deepEqual(tokenizeSearchQuery('PNP-X / XROS 4'), ['pnp', 'x', 'xros', '4'])
})

test('search matches flavors and requires every useful query concept', () => {
  assert.equal(matchesProductSearch(products[0], 'PECHE glacee'), true)
  assert.equal(matchesProductSearch(products[0], 'fruits rouge'), true)
  assert.equal(matchesProductSearch(products[0], 'pêche xros'), false)
})

test('search includes specification labels, values and compatibility references', () => {
  assert.equal(matchesProductSearch(products[1], 'compatible xros pro'), true)
  assert.equal(matchesProductSearch(products[1], 'xros 0.6 ohm'), true)
  assert.equal(matchesProductSearch(products[1], 'vaporesso coil'), true)
})

test('limited catalogue synonyms remain useful without weakening multi-token matching', () => {
  assert.equal(matchesProductSearch(products[0], 'juice peche'), true)
  assert.equal(matchesProductSearch(products[2], 'tabac 10 ml'), true)
  assert.equal(matchesProductSearch(products[3], 'vapoteuse usb c'), true)
  assert.equal(matchesProductSearch(products[3], 'coil xros'), false)
})

test('partial words return useful results while the user is still typing', () => {
  assert.equal(matchesProductSearch(products[1], 'vapo'), true)
  assert.equal(matchesProductSearch(products[0], 'pec'), true)
  assert.equal(matchesProductSearch(products[3], 'xro'), true)
  assert.equal(matchesProductSearch(products[1], 'va'), false)
})

test('one-letter typos are tolerated only for long alphabetic words and score below exact matches', () => {
  assert.equal(matchesProductSearch(products[0], 'pechf glacee'), true)
  assert.equal(matchesProductSearch(products[1], 'vaporeso coil'), true)
  assert.ok(
    getProductSearchScore(products[1], 'vaporesso')
      > getProductSearchScore(products[1], 'vaporeso'),
  )

  assert.equal(matchesProductSearch(products[3], 'xroa pro'), false)
  assert.equal(matchesProductSearch(products[1], 'xros 5 ohm'), false)
})

test('results are ranked by the strongest product fields and remain stable at equal score', () => {
  const ranked = rankProductsBySearch([
    {
      id: 'description-only',
      name: 'Produit neutre',
      brand: 'A',
      type: 'Accessoire',
      short: 'Compatible XROS Pro',
    },
    products[1],
    products[3],
  ], 'xros pro')

  assert.deepEqual(ranked.map(({ id }) => id), ['xros-kit', 'coil-corex', 'description-only'])
  assert.ok(
    getProductSearchScore(products[3], 'xros pro')
      > getProductSearchScore(products[1], 'xros pro'),
  )
})

test('search can limit results, does not mutate input and returns the catalogue for an empty query', () => {
  const originalOrder = products.map(({ id }) => id)

  assert.equal(searchProducts(products, 'maison test', { limit: 1 }).length, 1)
  assert.deepEqual(searchProducts(products, ''), products)
  assert.deepEqual(products.map(({ id }) => id), originalOrder)
})
