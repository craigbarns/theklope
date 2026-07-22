import assert from 'node:assert/strict'
import test from 'node:test'

import { parseCatalogBootstrap, readCatalogBootstrap } from './catalogBootstrap.js'

test('catalog bootstrap accepts only minimally valid products', () => {
  const result = parseCatalogBootstrap(JSON.stringify([
    { id: 'ok', name: 'Produit', price: 5.9, stock: 2 },
    { id: 'bad-price', name: 'Produit', price: 'inconnu', stock: 2 },
    { id: '', name: 'Produit', price: 1, stock: 2 },
  ]))

  assert.deepEqual(result, [{ id: 'ok', name: 'Produit', price: 5.9, stock: 2 }])
})

test('catalog bootstrap fails closed on malformed input', () => {
  assert.deepEqual(parseCatalogBootstrap('{'), [])
  assert.deepEqual(parseCatalogBootstrap('{"products":[]}'), [])
})

test('a bootstrap generated for another route is ignored', () => {
  const node = {
    textContent: JSON.stringify([{ id: 'home', name: 'Accueil', price: 1, stock: 1 }]),
    getAttribute: () => '/',
  }
  const doc = {
    defaultView: { location: { pathname: '/checkout' } },
    getElementById: () => node,
  }

  assert.deepEqual(readCatalogBootstrap(doc), [])
})
