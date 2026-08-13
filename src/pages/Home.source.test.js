import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const homeSource = await readFile(new URL('./Home.jsx', import.meta.url), 'utf8')

test('home alternatives card targets the canonical rechargeable puffs category', () => {
  assert.match(homeSource, /slug:\s*['"]puffs-rechargeables['"]/)
  assert.doesNotMatch(homeSource, /slug:\s*['"]alternatives-puffs['"]/)
})
