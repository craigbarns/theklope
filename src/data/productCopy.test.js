import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProductLong,
  buildProductShort,
  enrichProductCopy,
  sanitizeProductSpecs,
} from './productCopy.js'

const resistance = {
  name: 'Cartouches Xlim',
  brand: 'OXVA',
  category: 'resistance',
  ohmOptions: ['0.4', '0.8'],
  specs: { Compatibilité: 'Xlim Pro' },
}

test('resistance fallback copy uses the canonical category and compatibility', () => {
  const short = buildProductShort(resistance)
  assert.match(short, /résistance ou cartouche de remplacement/i)
  assert.match(short, /compatible Xlim Pro/i)
  assert.doesNotMatch(short, /un résistance/i)
})

test('resistance long copy lists available ohm values', () => {
  const long = buildProductLong(resistance)
  assert.match(long, /0\.4 Ω et 0\.8 Ω/)
  assert.match(long, /Vérifiez la compatibilité/)
})

test('DIY fallback copy describes preparation without presenting a concentrate as ready to vape', () => {
  const product = {
    name: 'Arôme Fruits Rouges',
    brand: 'THEKLOPE',
    category: 'diy',
    type: 'Arôme concentré',
    volume: '30ml',
    flavors: ['Fruits rouges'],
  }

  const short = buildProductShort(product)
  const long = buildProductLong(product)

  assert.match(short, /produit DIY destiné à la préparation/i)
  assert.match(long, /ne doit jamais être vapoté seul/i)
  assert.doesNotMatch(`${short} ${long}`, /prêt à vapoter/i)
})

test('legacy synthetic product ratings are stripped from every enriched product', () => {
  const product = enrichProductCopy({
    name: 'Produit test',
    brand: 'Marque',
    category: 'accessoire',
    short: 'Description vérifiée.',
    long: 'Description longue vérifiée.',
    rating: 4.9,
    reviews: 999,
  })

  assert.equal('rating' in product, false)
  assert.equal('reviews' in product, false)
})

test('generic universal compatibility claims are removed', () => {
  assert.deepEqual(sanitizeProductSpecs({
    Compatibilité: 'Standard universel',
    Contenance: '3 ml',
  }), { Contenance: '3 ml' })
})

test('hardware fallback copy uses correct French agreement', () => {
  assert.match(buildProductShort({
    name: 'Kit test',
    brand: 'Marque',
    category: 'ecig',
    specs: {},
  }), /cigarette électronique sélectionnée/)
})
