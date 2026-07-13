import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSitemapEntries, renderSitemapXml } from './sitemap-data.mjs'

test('sitemap builds unique product URLs and preserves update dates', () => {
  const entries = buildSitemapEntries([
    { id: 'produit-test', updated_at: '2026-07-12T10:00:00.000Z' },
    { id: 'produit-test', updated_at: '2026-07-13T10:00:00.000Z' },
  ], '2026-07-13')
  const products = entries.filter((entry) => entry.loc === '/produit/produit-test')
  assert.equal(products.length, 1)
  assert.equal(products[0].lastmod, '2026-07-13')
})

test('sitemap XML escapes the base URL and product identifiers', () => {
  const entries = buildSitemapEntries([{ id: 'menthe & citron' }], '2026-07-13')
  const xml = renderSitemapXml(entries, 'https://www.theklope.com?source=a&b=c')
  assert.match(xml, /menthe%20%26%20citron/)
  assert.match(xml, /source=a&amp;b=c/)
  assert.doesNotMatch(xml, /undefined|null/)
})

test('sitemap rejects invalid product dates', () => {
  assert.throws(
    () => buildSitemapEntries([{ id: 'test', updated_at: 'not-a-date' }], '2026-07-13'),
    /Date de sitemap invalide/,
  )
})
