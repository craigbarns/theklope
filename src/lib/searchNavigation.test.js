import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createShopSearchState,
  getShopSearchQuery,
  preserveShopSearchFromUrl,
} from './searchNavigation.js'

test('shop search state is normalized, bounded and removable', () => {
  assert.deepEqual(createShopSearchState({ source: 'header' }, '  menthe fraîche  '), {
    source: 'header',
    shopSearchQuery: 'menthe fraîche',
  })
  assert.equal(getShopSearchQuery({ shopSearchQuery: ` ${'a'.repeat(200)} ` }).length, 120)
  assert.deepEqual(createShopSearchState({ source: 'header', shopSearchQuery: 'menthe' }, ''), {
    source: 'header',
  })
})

test('incoming q is moved to router state before analytics while other URL data is preserved', () => {
  const replacements = []
  const history = {
    state: {
      idx: 2,
      key: 'route-key',
      usr: { source: 'search-action' },
    },
    replaceState: (...args) => replacements.push(args),
  }

  assert.equal(preserveShopSearchFromUrl({
    href: 'https://www.theklope.com/boutique?q=client%40example.com&utm_source=google#catalogue',
    history,
  }), 'client@example.com')

  assert.deepEqual(replacements, [[
    {
      idx: 2,
      key: 'route-key',
      usr: {
        source: 'search-action',
        shopSearchQuery: 'client@example.com',
      },
    },
    '',
    '/boutique?utm_source=google#catalogue',
  ]])
})

test('non-shop URLs are left untouched', () => {
  const replacements = []
  const history = {
    state: { usr: { shopSearchQuery: 'déjà présente' } },
    replaceState: (...args) => replacements.push(args),
  }

  assert.equal(preserveShopSearchFromUrl({
    href: 'https://www.theklope.com/blog?q=menthe',
    history,
  }), 'déjà présente')
  assert.deepEqual(replacements, [])
})
