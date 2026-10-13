import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  OPTIMIZED_IMAGE_QUALITY,
  OPTIMIZED_IMAGE_WIDTHS,
  SUPABASE_IMAGE_HOST,
  isOptimizableImage,
  optimizedImageAttrs,
  optimizedWidthsFor,
} from './imageUrl.js'

const STORAGE = `https://${SUPABASE_IMAGE_HOST}/storage/v1/object/public/products/`

test('seules les images publiques du catalogue Supabase passent par l’optimiseur', () => {
  assert.equal(isOptimizableImage(`${STORAGE}cerise-fraise-10-ml.jpg`), true)
  assert.equal(isOptimizableImage(`${STORAGE}kiwi.PNG`), true)
  assert.equal(isOptimizableImage('/products/ACT 1.jpg'), false, 'images locales : déjà en WebP')
  assert.equal(isOptimizableImage('/products/product-placeholder.svg'), false)
  assert.equal(isOptimizableImage(`${STORAGE}logo.svg`), false)
  assert.equal(isOptimizableImage(`https://${SUPABASE_IMAGE_HOST}/storage/v1/object/sign/products/x.jpg`), false)
  assert.equal(isOptimizableImage('https://evil.example.com/storage/v1/object/public/products/x.jpg'), false)
  assert.equal(isOptimizableImage(`http://${SUPABASE_IMAGE_HOST}/storage/v1/object/public/products/x.jpg`), false)
  assert.equal(isOptimizableImage(''), false)
  assert.equal(isOptimizableImage(null), false)
})

test('trois largeurs seulement, 1x et 2x selon la taille affichée', () => {
  assert.deepEqual(optimizedWidthsFor(48), [256])
  assert.deepEqual(optimizedWidthsFor(80), [256])
  assert.deepEqual(optimizedWidthsFor(150), [256, 384])
  assert.deepEqual(optimizedWidthsFor(400), [384, 828])
  assert.deepEqual(optimizedWidthsFor(448), [384, 828])
  assert.deepEqual(optimizedWidthsFor(600), [828])
  assert.deepEqual(optimizedWidthsFor(undefined), [828])
  for (const width of [16, 48, 64, 80, 96, 150, 400, 448, 600, 1200]) {
    for (const w of optimizedWidthsFor(width)) assert.ok(OPTIMIZED_IMAGE_WIDTHS.includes(w), `${w} autorisé`)
  }
})

test('URL optimisée : image encodée, largeur et qualité autorisées', () => {
  const src = `${STORAGE}pomme verte & orange.png`
  const attrs = optimizedImageAttrs(src, 400)
  const url = new URL(attrs.src, 'https://www.theklope.com')
  assert.equal(url.pathname, '/_vercel/image')
  assert.equal(url.searchParams.get('url'), src)
  assert.equal(url.searchParams.get('w'), '384')
  assert.equal(url.searchParams.get('q'), String(OPTIMIZED_IMAGE_QUALITY))
  assert.match(attrs.srcSet, / 1x, .*w=828.* 2x$/)
  assert.equal(optimizedImageAttrs(src, 600).srcSet, undefined)
  assert.equal(optimizedImageAttrs('/products/x.jpg', 400), null)
})

test('vercel.json autorise exactement ce que le site demande', async () => {
  const config = JSON.parse(await readFile(new URL('../../vercel.json', import.meta.url), 'utf8'))
  const images = config.images
  assert.ok(images, 'bloc images présent')
  for (const width of OPTIMIZED_IMAGE_WIDTHS) assert.ok(images.sizes.includes(width), `largeur ${width}`)
  assert.ok(images.qualities.includes(OPTIMIZED_IMAGE_QUALITY))
  const pattern = images.remotePatterns.find((p) => p.hostname === SUPABASE_IMAGE_HOST)
  assert.ok(pattern, 'hôte Supabase autorisé')
  assert.equal(pattern.protocol, 'https')
  assert.ok(new RegExp(pattern.pathname).test('/storage/v1/object/public/products/x.jpg'))
  assert.ok(!new RegExp(pattern.pathname).test('/storage/v1/object/sign/products/x.jpg'))
  assert.ok(images.minimumCacheTTL >= 30 * 24 * 3600, 'cache d’au moins 30 jours : quota Hobby')
  assert.equal(images.dangerouslyAllowSVG ?? false, false)
})
