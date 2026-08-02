import test from 'node:test'
import assert from 'node:assert/strict'
import { fuzzySearchProducts, levenshteinDistance, normalizeText } from './fuzzySearch.js'

test('normalizeText removes accents and converts to lowercase', () => {
  assert.equal(normalizeText('Pêche Abricot FRUITS'), 'peche abricot fruits')
  assert.equal(normalizeText('  VaporÉsso  '), 'vaporesso')
})

test('levenshteinDistance calculates edit distance correctly', () => {
  assert.equal(levenshteinDistance('vaporesso', 'vaporesso'), 0)
  assert.equal(levenshteinDistance('vaporeso', 'vaporesso'), 1)
  assert.equal(levenshteinDistance('lequideo', 'liquideo'), 1)
})

test('fuzzySearchProducts finds products despite typos and missing accents', () => {
  const products = [
    { id: '1', name: 'Drag S2 Voopoo', brand: 'Voopoo', type: 'Kit Pod', short: 'Pod performant', stock: 10 },
    { id: '2', name: 'Freeze Dragon Liquideo', brand: 'Liquideo', type: 'E-liquide', short: 'Fruit du dragon givré', stock: 5 },
    { id: '3', name: 'Gen Max Vaporesso', brand: 'Vaporesso', type: 'Box Mod', short: 'Puissance 220W', stock: 3 },
  ]

  // Typos sur la marque
  const res1 = fuzzySearchProducts('vaporeso', products)
  assert.equal(res1.length, 1)
  assert.equal(res1[0].id, '3')

  // Accent & sous-chaine
  const res2 = fuzzySearchProducts('givre', products)
  assert.equal(res2.length, 1)
  assert.equal(res2[0].id, '2')
})
