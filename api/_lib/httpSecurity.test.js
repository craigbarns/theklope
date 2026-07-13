import assert from 'node:assert/strict'
import test from 'node:test'

import { configureSameOriginCors, isRequestOriginAllowed, setNoStore } from './httpSecurity.js'

test('same-origin requests and requests without Origin are accepted', () => {
  assert.equal(isRequestOriginAllowed({ headers: { host: 'www.theklope.com' } }), true)
  assert.equal(isRequestOriginAllowed({
    headers: { host: 'www.theklope.com', origin: 'https://www.theklope.com' },
  }), true)
})

test('cross-origin browser requests are rejected without reflecting their origin', () => {
  const headers = new Map()
  const req = { headers: { host: 'www.theklope.com', origin: 'https://malveillant.example' } }
  const res = { setHeader: (key, value) => headers.set(key, value) }
  assert.equal(configureSameOriginCors(req, res), false)
  assert.equal(headers.has('Access-Control-Allow-Origin'), false)
})

test('sensitive responses are explicitly non-cacheable', () => {
  const headers = new Map()
  setNoStore({ setHeader: (key, value) => headers.set(key, value) })
  assert.equal(headers.get('Cache-Control'), 'private, no-store, max-age=0')
  assert.equal(headers.get('Pragma'), 'no-cache')
})
