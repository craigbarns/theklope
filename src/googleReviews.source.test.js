import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { STORE_REVIEW_SUMMARY } from './data/reviews.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// Décision du 30/07/2026 : affichage FACTUEL et LIMITÉ des avis Google
// (pages contact + pages locales Marseille uniquement), conformément au
// compromis retenu face à la restriction publicitaire vape (L.3513-4 CSP).
// Le bandeau promotionnel global reste interdit (cf. publicCompliance.source.test.js).

test('les avis Google sont référencés sur la page contact et les pages locales', async () => {
  const contact = await readSource('./pages/Contact.jsx')
  const staticSeo = await readSource('./pages/StaticSeoPage.jsx')

  assert.match(contact, /STORE_REVIEW_SUMMARY/)
  assert.match(staticSeo, /STORE_REVIEW_SUMMARY/)
})

test('le résumé des avis pointe vers la fiche Google officielle et reste factuel', () => {
  assert.equal(STORE_REVIEW_SUMMARY.source, 'Google')
  assert.match(STORE_REVIEW_SUMMARY.googleUrl, /^https:\/\/maps\.google\.com\/\?cid=\d+$/)
  assert.ok(STORE_REVIEW_SUMMARY.count >= 411)
  assert.match(STORE_REVIEW_SUMMARY.compactLabel, /avis Google/)
})
