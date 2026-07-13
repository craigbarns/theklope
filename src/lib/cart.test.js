import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCartAddition } from './cart.js'

const products = [
  { id: 'device', stock: 2, colors: ['Noir'] },
  { id: 'liquid', stock: 3, nicotine: [0, 3] },
]

test('a multi-product addition is atomic when one product lacks stock', () => {
  const cart = [{ productId: 'liquid', qty: 3, variant: { nicotine: 0 } }]
  const result = buildCartAddition({
    cart,
    products,
    entries: [
      { productId: 'device', qty: 1 },
      { productId: 'liquid', qty: 1 },
    ],
  })

  assert.equal(result.ok, false)
  assert.strictEqual(result.cart, cart)
})

test('a complete multi-product addition applies defaults and merges variants', () => {
  const result = buildCartAddition({
    cart: [{ productId: 'device', qty: 1, variant: { color: 'Noir' } }],
    products,
    entries: [
      { productId: 'device', qty: 1 },
      { productId: 'liquid', qty: 1, variant: { nicotine: 3 } },
    ],
  })

  assert.equal(result.ok, true)
  assert.deepEqual(result.cart, [
    { productId: 'device', qty: 2, variant: { color: 'Noir' } },
    { productId: 'liquid', qty: 1, variant: { nicotine: 3 } },
  ])
})
