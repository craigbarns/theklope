import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'))
const redirectsBySource = new Map(config.redirects.map((redirect) => [redirect.source, redirect]))

const expectedLegacyRedirects = {
  '/3-e-cigarettes': '/categorie/cigarettes-electroniques',
  '/4-e-liquides': '/categorie/e-liquides',
  '/15-kits-complets': '/categorie/cigarettes-electroniques',
  '/17-e-liquides-france': '/categorie/e-liquides',
  '/23-pyrex': '/categorie/accessoires',
  '/24-chargeurs': '/categorie/accessoires',
  '/content/5-:slug': '/livraison-retours',
}

test('Vercel redirect sources are unique', () => {
  assert.equal(redirectsBySource.size, config.redirects.length)
})

test('high-traffic legacy URLs redirect to a relevant live page', () => {
  for (const [source, destination] of Object.entries(expectedLegacyRedirects)) {
    const redirect = redirectsBySource.get(source)
    assert.ok(redirect, `Missing redirect for ${source}`)
    assert.equal(redirect.destination, destination)
    assert.equal(redirect.permanent, true)
  }
})

test('no explicit redirect is added for the case-mistyped admin URL', () => {
  assert.equal(redirectsBySource.has('/ADMIN'), false)
})
