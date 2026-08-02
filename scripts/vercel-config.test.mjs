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
  '/12-consommables': '/categorie/resistances',
  '/26-diy': '/categorie/diy',
  '/content/5-:slug': '/livraison-retours',
  '/produit/classico-grege-50-ml-freaks': '/produit/grege-68',
  '/produit/e-liquide-cafe-10ml-liquidarom': '/produit/cafe-liquid-arom-209',
  '/kits-complets/409-geekvape-digi-max.html': '/produit/kit-digi-max-geekvape-89',
  '/kits-complets/74-pocke-x-aspire.html': '/produit/pocke-x-144',
  '/e-liquides-france/209-citron-fizz-10-ml-pulp.html': '/produit/citron-fizz-38',
  '/e-liquides-france/215-menthe-fraiche-10-ml-alfaliquid.html': '/produit/fraicheur-menthe-fraiche-10ml-202',
  '/e-liquides-france/190-boston-menthol-10-ml-pulp.html': '/produit/boston-menthol-23',
  '/e-liquides-france/276-m-blend-10-ml-liquidarom.html': '/produit/m-blend-liquidarom-231',
  '/clearomiseurs-reservoirs/385-cartouche-luxe-q-vaporesso.html': '/produit/luxe-q2-3ml-4pcs-vaporesso-214',
  '/clearomiseurs-reservoirs/418-555-cartouche-apex-vaporesso.html': '/produit/apex-5ml-par-2-vaporesso-212',
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

test('a generic 301 catches legacy numeric PrestaShop category URLs', () => {
  const generic = redirectsBySource.get('/:id(\\d+)-:slug')
  assert.ok(generic, 'Missing generic redirect for /:id(\\d+)-:slug')
  assert.equal(generic.destination, '/boutique')
  assert.equal(generic.permanent, true)
})

test('specific legacy category redirects are evaluated before the generic numeric rule', () => {
  const sources = config.redirects.map((redirect) => redirect.source)
  const genericIndex = sources.indexOf('/:id(\\d+)-:slug')
  assert.ok(genericIndex > -1, 'Generic numeric rule missing')
  for (const source of Object.keys(expectedLegacyRedirects)) {
    const index = sources.indexOf(source)
    assert.ok(index > -1, `Missing redirect for ${source}`)
    assert.ok(index < genericIndex, `${source} must be declared before the generic numeric rule`)
  }
})

test('checkout cleanup is scheduled at most daily for Hobby compatibility', () => {
  const cleanup = config.crons?.find((cron) => cron.path === '/api/cleanup-checkouts')
  assert.ok(cleanup, 'Missing cleanup checkout cron')
  assert.equal(cleanup.schedule, '20 3 * * *')
  assert.equal(config.crons.filter((cron) => cron.path === cleanup.path).length, 1)
})
