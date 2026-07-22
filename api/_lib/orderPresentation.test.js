import assert from 'node:assert/strict'
import test from 'node:test'

import { escapeHtml } from './email.js'
import { formatOrderItemLabel, formatOrderVariant } from './orderPresentation.js'

test('order variants are rendered with explicit commerce labels', () => {
  assert.equal(formatOrderVariant({
    color: 'Noir',
    flavor: 'Menthe',
    nicotine: 6,
    ohm: '0.8',
  }), 'Couleur : Noir · Saveur : Menthe · Nicotine : 6 mg · Résistance : 0.8 Ω')
  assert.equal(formatOrderItemLabel({ name: 'Produit', variant: {} }), 'Produit')
})

test('the complete item label can be escaped before insertion into emails', () => {
  const label = formatOrderItemLabel({
    name: '<img src=x>',
    variant: { color: '<script>alert(1)</script>' },
  })
  const escaped = escapeHtml(label)
  assert.equal(escaped.includes('<script>'), false)
  assert.match(escaped, /&lt;script&gt;/)
})
