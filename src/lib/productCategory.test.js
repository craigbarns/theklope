import assert from 'node:assert/strict'
import test from 'node:test'

import {
  categoryMatches,
  isDiyCategory,
  isEliquidCategory,
  isEliquidProduct,
} from './productCategory.js'

test('editorial liquid subcategories belong to the e-liquid family', () => {
  for (const category of [
    'eliquide',
    'eliquide-fruite',
    'eliquide-menthe',
    'eliquide-gourmand',
    'eliquide-tabac',
    'eliquide-50ml',
  ]) {
    assert.equal(isEliquidCategory(category), true)
    assert.equal(categoryMatches(category, 'eliquide'), true)
  }

  assert.equal(isEliquidProduct({ category: 'eliquide-fruite' }), true)
  assert.equal(isEliquidCategory('ecig'), false)
})

test('DIY subcategories keep the same family behavior without matching liquids', () => {
  assert.equal(isDiyCategory('diy-aromes'), true)
  assert.equal(categoryMatches('diy-aromes', 'diy'), true)
  assert.equal(categoryMatches('diy-aromes', 'eliquide'), false)
})
