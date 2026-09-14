import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { NICOTINE_BOOSTER_ID, findAvailableNicotineBooster } from './data/catalog.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// Le catalogue de production vient de Supabase : une référence absente ou épuisée
// doit masquer l'option, jamais produire « Le stock vient d'évoluer » à l'ajout.
test('le booster n’est retenu que s’il existe vraiment et qu’il est en stock', () => {
  const booster = { id: NICOTINE_BOOSTER_ID, stock: 500 }

  assert.equal(findAvailableNicotineBooster([booster]), booster)
  assert.equal(findAvailableNicotineBooster([{ ...booster, stock: 0 }]), null)
  assert.equal(findAvailableNicotineBooster([{ id: 'autre-produit', stock: 10 }]), null)
  assert.equal(findAvailableNicotineBooster([]), null)
  assert.equal(findAvailableNicotineBooster(undefined), null)
})

test('aucun écran ne code en dur la référence du booster', async () => {
  // Recopié dans plusieurs écrans, l'identifiant finissait par diverger du
  // catalogue et l'option échouait silencieusement à l'ajout.
  for (const file of ['./pages/Product.jsx', './components/CartDrawer.jsx']) {
    const source = await readSource(file)
    assert.doesNotMatch(source, new RegExp(`['"\`]${NICOTINE_BOOSTER_ID}['"\`]`), `${file} ne doit pas coder l’identifiant en dur`)
    assert.match(source, /findAvailableNicotineBooster/, `${file} doit résoudre le booster depuis le catalogue live`)
  }
})

test('l’option Shake & Vape et la vente croisée sont conditionnées à la disponibilité', async () => {
  const product = await readSource('./pages/Product.jsx')
  const drawer = await readSource('./components/CartDrawer.jsx')

  assert.match(product, /isLargeFormatEliquid && nicotineBooster &&/)
  assert.match(product, /boosterCount > 0 && nicotineBooster/)
  assert.match(drawer, /remainingForFreeShipping <= 10 && nicotineBooster &&/)
})
