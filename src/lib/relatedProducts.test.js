import assert from 'node:assert/strict'
import test from 'node:test'

import {
  addRelatedProductId,
  normalizeRelatedProductIds,
  removeRelatedProductId,
  removeProductAndReferences,
  resolveCartRelatedProducts,
  resolveRelatedProducts,
  searchRelatedProducts,
} from './relatedProducts.js'

const products = [
  { id: 'kit-a', name: 'Kit Élégance', brand: 'Marque A', type: 'Kit', category: 'ecig', stock: 3 },
  { id: 'liquid-b', name: 'Fruits rouges', brand: 'Maison B', type: 'E-liquide', category: 'eliquide', stock: 8 },
  { id: 'coil-c', name: 'Résistance C', brand: 'Marque A', type: 'Résistance', category: 'accessoire', stock: 0 },
  { id: 'pod-d', name: 'Pod D', brand: 'Maison D', type: 'Pod', category: 'pod', stock: 5 },
]

test('related product IDs are trimmed, deduplicated and never include the current product', () => {
  assert.deepEqual(
    normalizeRelatedProductIds([' liquid-b ', '', 'kit-a', 'liquid-b', null, 'pod-d'], 'kit-a'),
    ['liquid-b', 'pod-d'],
  )
  assert.deepEqual(normalizeRelatedProductIds('liquid-b, pod-d, liquid-b'), ['liquid-b', 'pod-d'])
  assert.deepEqual(normalizeRelatedProductIds(null), [])
})

test('manual additions and removals are explicit and idempotent', () => {
  const added = addRelatedProductId(['liquid-b'], 'pod-d', 'kit-a')
  assert.deepEqual(added, ['liquid-b', 'pod-d'])
  assert.deepEqual(addRelatedProductId(added, 'pod-d', 'kit-a'), added)
  assert.deepEqual(removeRelatedProductId(added, 'liquid-b', 'kit-a'), ['pod-d'])
})

test('deleting a product removes incoming references permanently', () => {
  const linkedProducts = products.map((product) => (
    product.id === 'kit-a' ? { ...product, relatedProductIds: ['liquid-b', 'pod-d'] } : product
  ))
  const afterDelete = removeProductAndReferences(linkedProducts, 'liquid-b')
  const afterRecreate = [...afterDelete, { ...products[1] }]

  assert.deepEqual(afterDelete.find((product) => product.id === 'kit-a').relatedProductIds, ['pod-d'])
  assert.deepEqual(
    resolveRelatedProducts(afterDelete.find((product) => product.id === 'kit-a'), afterRecreate)
      .map((product) => product.id),
    ['pod-d'],
  )
})

test('related product search requires a query and excludes current and selected products', () => {
  assert.deepEqual(searchRelatedProducts({ products, query: '', currentProductId: 'kit-a' }), [])
  assert.deepEqual(
    searchRelatedProducts({ products, query: 'resistance', currentProductId: 'kit-a' }).map((product) => product.id),
    ['coil-c'],
  )
  assert.deepEqual(
    searchRelatedProducts({ products, query: 'marque a', currentProductId: 'kit-a', selectedIds: ['coil-c'] }),
    [],
  )

  const manyMatches = Array.from({ length: 20 }, (_, index) => ({
    id: `liquid-${index}`,
    name: `Liquide ${index}`,
    brand: 'Maison test',
    type: 'E-liquide',
  }))
  assert.equal(searchRelatedProducts({ products: manyMatches, query: 'Maison test' }).length, 20)
})

test('resolution uses only saved IDs in their order, with no category fallback', () => {
  assert.deepEqual(resolveRelatedProducts({ id: 'kit-a', category: 'ecig', relatedProductIds: [] }, products), [])
  assert.deepEqual(
    resolveRelatedProducts(
      { id: 'kit-a', relatedProductIds: ['pod-d', 'missing', 'liquid-b', 'kit-a'] },
      products,
    ).map((product) => product.id),
    ['pod-d', 'liquid-b'],
  )
})

test('cart suggestions aggregate only manual associations and never auto-select stock or category fallbacks', () => {
  const catalog = products.map((product) => ({ ...product }))
  catalog[0].relatedProductIds = ['liquid-b', 'coil-c', 'pod-d']
  catalog[1].relatedProductIds = ['pod-d', 'kit-a']
  const cartDetailed = [
    { product: catalog[0] },
    { product: catalog[1] },
  ]

  assert.deepEqual(
    resolveCartRelatedProducts(cartDetailed, catalog).map((product) => product.id),
    ['pod-d'],
  )
  assert.deepEqual(resolveCartRelatedProducts([{ product: { ...catalog[0], relatedProductIds: [] } }], catalog), [])
})
