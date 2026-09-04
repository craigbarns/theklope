import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { BLOG_POSTS } from '../src/data/blog.js'
import { PRODUCTS } from '../src/data/products.js'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

test('chaque article de blog a une image locale du catalogue, pas un lien externe', () => {
  const remote = BLOG_POSTS.filter((p) => !p.image || !p.image.startsWith('/'))
  assert.deepEqual(
    remote.map((p) => `${p.slug} -> ${p.image}`),
    [],
    'Les images de blog doivent pointer vers /products/… (les URLs externes type Unsplash cassent ou affichent du hors-sujet)',
  )
})

test('chaque image de blog existe dans public/', () => {
  const missing = BLOG_POSTS.filter(
    (p) => p.image && p.image.startsWith('/') && !existsSync(join(publicDir, decodeURIComponent(p.image))),
  )
  assert.deepEqual(
    missing.map((p) => `${p.slug} -> ${p.image}`),
    [],
    'Image de blog introuvable dans public/',
  )
})

test('chaque relatedProductId de blog existe dans le catalogue de produits', () => {
  const productIds = new Set(PRODUCTS.map((p) => p.id))
  const invalid = []
  for (const post of BLOG_POSTS) {
    for (const id of post.relatedProductIds || []) {
      if (!productIds.has(id)) {
        invalid.push(`${post.slug} -> ${id}`)
      }
    }
  }
  assert.deepEqual(invalid, [], 'Produit associé au blog introuvable dans le catalogue')
})
