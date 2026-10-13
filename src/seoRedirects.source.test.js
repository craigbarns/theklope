import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { CATEGORIES } from './data/catalog.js'

const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
const bySource = new Map(config.redirects.map((r) => [r.source, r]))

// Fiches supprimées qui recevaient encore des impressions Google (Search
// Console, juillet–octobre 2026) : Lady Killer à elle seule, 1 477 impressions
// en position 9 vers une page « Produit introuvable ».
test('les fiches supprimées encore visibles sur Google redirigent en 301', () => {
  const expected = {
    '/produit/lady-killer-60-ml-adalya': '/categorie/marque-adalya',
    '/produit/african-crush-60-ml-adalya': '/categorie/marque-adalya',
    '/produit/kit-drag-x3': '/produit/drag-x3-52',
    '/nous-contacter': '/contact',
  }
  for (const [source, destination] of Object.entries(expected)) {
    const redirect = bySource.get(source)
    assert.ok(redirect, `redirection manquante pour ${source}`)
    assert.equal(redirect.destination, destination)
    assert.equal(redirect.permanent, true)
  }
})

test('les redirections vers une catégorie visent une catégorie qui existe', () => {
  const slugs = new Set(CATEGORIES.map((c) => c.slug))
  for (const redirect of config.redirects) {
    const match = /^\/categorie\/([^/?#:]+)$/.exec(redirect.destination)
    if (match) assert.ok(slugs.has(match[1]), `${redirect.source} → catégorie inconnue ${match[1]}`)
  }
})
