import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('configurator keeps required variant controls next to its cart action', async () => {
  const source = await readFile(new URL('./Configurateur.jsx', import.meta.url), 'utf8')
  const asideStart = source.indexOf('<aside')
  const asideEnd = source.indexOf('</aside>', asideStart)
  const aside = source.slice(asideStart, asideEnd)
  const controlsIndex = aside.indexOf('<PackVariantChoices')
  const actionIndex = aside.indexOf('Ajouter la sélection au panier')
  const actionTag = aside.match(/<button\s+onClick=\{handleAddToCart\}[\s\S]*?>/)?.[0] || ''

  assert.ok(asideStart >= 0 && asideEnd > asideStart, 'configurator summary must be found')
  assert.ok(controlsIndex >= 0 && controlsIndex < actionIndex, 'variant controls must appear before the cart action')
  assert.match(source, /type="radio"/)
  assert.match(actionTag, /aria-disabled=\{!variantChoicesComplete\}/)
  assert.doesNotMatch(actionTag, /\sdisabled=/)
  assert.doesNotMatch(source, /dont la résistance en ohms/)
})
