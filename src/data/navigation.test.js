import assert from 'node:assert/strict'
import test from 'node:test'

import { MAIN_NAV } from './navigation.js'

test('main navigation links directly to DIY products and accessories', () => {
  assert.deepEqual(
    MAIN_NAV.filter(({ label }) => ['DIY', 'Accessoires'].includes(label)),
    [
      { to: '/categorie/diy', label: 'DIY' },
      { to: '/categorie/accessoires', label: 'Accessoires' },
    ],
  )
})

test('main navigation paths are unique', () => {
  const paths = MAIN_NAV.map(({ to }) => to)
  assert.equal(new Set(paths).size, paths.length)
})
