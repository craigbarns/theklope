import assert from 'node:assert/strict'
import test from 'node:test'

import { isChunkLoadError } from './lazyWithRetry.js'

test('recognizes browser and bundler chunk loading failures', () => {
  assert.equal(isChunkLoadError(new Error('Failed to fetch dynamically imported module: /assets/Product.js')), true)
  assert.equal(isChunkLoadError(new Error('Loading chunk 42 failed')), true)
  assert.equal(isChunkLoadError(new Error('Erreur métier')), false)
})
