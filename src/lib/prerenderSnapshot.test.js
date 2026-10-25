import assert from 'node:assert/strict'
import test from 'node:test'
import { capturePrerenderSnapshot, getPrerenderSnapshot, getPrerenderSnapshotKind } from './prerenderSnapshot.js'

const capture = (path, html, kind) => {
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  globalThis.window = { location: { pathname: path } }
  globalThis.document = {
    querySelector: () => ({
      innerHTML: html,
      getAttribute: (name) => name === 'data-prerender-path' ? path : kind,
    }),
  }
  try {
    capturePrerenderSnapshot()
  } finally {
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test('component snapshots retain their own layout while the route module loads', () => {
  capture('/faq', '<section class="container-page">FAQ</section>', 'component')
  assert.equal(getPrerenderSnapshotKind('/faq'), 'component')
  assert.equal(getPrerenderSnapshot('/faq'), '<section class="container-page">FAQ</section>')
  assert.equal(getPrerenderSnapshot('/contact'), null)
  assert.equal(getPrerenderSnapshotKind('/contact'), null)
})

test('existing text-only snapshots keep their original styling contract', () => {
  capture('/', '<h1>Accueil</h1>', null)
  assert.equal(getPrerenderSnapshotKind('/'), 'seo')
  assert.equal(getPrerenderSnapshot('/'), '<h1>Accueil</h1>')
})
