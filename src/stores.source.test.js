import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { STORES, buildStoreSchema } from './data/localBusiness.js'
import { STATIC_SEO_PAGES } from './data/staticSeoPages.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// /puff-marseille était pré-rendue et dans le sitemap, mais sans route dans
// l'appli : une fois chargée, elle affichait « Page introuvable » en noindex.
test('chaque page SEO statique a sa route dans l’appli', async () => {
  const app = await readSource('./App.jsx')
  for (const slug of Object.keys(STATIC_SEO_PAGES)) {
    assert.match(app, new RegExp(`path="/${slug}" element={<StaticSeoPage />}`), `route manquante pour /${slug}`)
  }
})

// Données identiques aux fiches Google des trois boutiques (16/10/2026).
test('les trois boutiques ont nom, adresse, téléphone et horaires', () => {
  const byId = Object.fromEntries(STORES.map((store) => [store.id, store]))
  assert.equal(byId['clope-and-clope-marseille'].streetAddress, '49 rue de Rome')
  assert.equal(byId['clope-and-clope-marseille'].phoneDisplay, '09 83 74 14 61')
  assert.equal(byId['clope-and-clope-salon'].streetAddress, '36 cours Carnot')
  assert.equal(byId['clope-and-clope-salon'].phoneDisplay, '04 90 56 00 80')
  assert.ok(byId['clope-and-clope-salon'].hours[0].days.includes('Saturday'))
  for (const store of STORES) {
    assert.match(store.telephone, /^\+33\d{9}$/)
    assert.ok(store.mapUrl.startsWith('https://'))
  }
})

test('les boutiques sont rattachées à l’organisation THEKLOPE et listées sur leurs pages', async () => {
  const salon = buildStoreSchema('clope-and-clope-salon')
  assert.equal(salon['@type'], 'Store')
  assert.equal(salon.parentOrganization['@id'], 'https://www.theklope.com/#organization')
  assert.equal(salon.address.postalCode, '13300')
  assert.deepEqual(STATIC_SEO_PAGES['nos-boutiques'].stores, STORES.map((store) => store.id))
  assert.ok(STATIC_SEO_PAGES['boutique-vape-marseille'].stores.includes('clope-and-clope-marseille'))
  const footer = await readSource('./components/Footer.jsx')
  for (const store of STORES) assert.ok(footer.includes(store.phoneDisplay), `pied de page : ${store.phoneDisplay}`)
})
