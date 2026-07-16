import assert from 'node:assert/strict'
import test from 'node:test'

import { buildProductLong, buildProductShort } from './productCopy.js'

const resistance = {
  name: 'Cartouches Xlim',
  brand: 'OXVA',
  category: 'resistance',
  ohmOptions: ['0.4', '0.8'],
  specs: { Compatibilité: 'Xlim Pro' },
}

test('resistance fallback copy uses the canonical category and compatibility', () => {
  const short = buildProductShort(resistance)
  assert.match(short, /résistance ou cartouche de remplacement/i)
  assert.match(short, /compatible Xlim Pro/i)
  assert.doesNotMatch(short, /un résistance/i)
})

test('resistance long copy lists available ohm values', () => {
  const long = buildProductLong(resistance)
  assert.match(long, /0\.4 Ω et 0\.8 Ω/)
  assert.match(long, /Vérifiez la compatibilité/)
})
