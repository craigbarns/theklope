import assert from 'node:assert/strict'
import test from 'node:test'

import { baseUrlFromRequest, validateMollieConfiguration } from './mollie.js'

test('production fails closed unless Mollie uses a live key', () => {
  assert.equal(validateMollieConfiguration({
    apiKey: 'test_abcdefghijklmnopqrstuvwxyz',
    vercelEnv: 'production',
    nodeEnv: 'production',
  }).ok, false)
  assert.equal(validateMollieConfiguration({
    apiKey: 'live_abcdefghijklmnopqrstuvwxyz',
    vercelEnv: 'production',
    nodeEnv: 'production',
  }).ok, true)
  assert.equal(validateMollieConfiguration({
    apiKey: '',
    vercelEnv: 'production',
  }).ok, false)
})

test('preview deployments may safely use a test key even with NODE_ENV production', () => {
  const result = validateMollieConfiguration({
    apiKey: 'test_abcdefghijklmnopqrstuvwxyz',
    vercelEnv: 'preview',
    nodeEnv: 'production',
  })
  assert.equal(result.ok, true)
  assert.equal(result.production, false)
})

test('standalone production and all environments reject malformed keys', () => {
  assert.equal(validateMollieConfiguration({
    apiKey: 'test_abcdefghijklmnopqrstuvwxyz',
    nodeEnv: 'production',
  }).ok, false)
  assert.equal(validateMollieConfiguration({
    apiKey: 'sk_live_secret',
    nodeEnv: 'development',
  }).ok, false)
})

test('payment public origins fail closed in production and ignore forwarded hosts', () => {
  assert.throws(
    () => baseUrlFromRequest({ headers: { host: 'evil.example' } }, { VERCEL_ENV: 'production' }),
    /PUBLIC_BASE_URL/,
  )
  assert.equal(
    baseUrlFromRequest(
      { headers: { host: 'evil.example', 'x-forwarded-host': 'evil.example' } },
      { VERCEL_ENV: 'production', PUBLIC_BASE_URL: 'https://www.theklope.com/' },
    ),
    'https://www.theklope.com',
  )
  assert.throws(
    () => baseUrlFromRequest({ headers: {} }, {
      VERCEL_ENV: 'production',
      PUBLIC_BASE_URL: 'https://www.theklope.com/checkout?next=evil',
    }),
    /origine sans chemin/,
  )
})

test('preview uses VERCEL_URL and local development only permits HTTP loopback', () => {
  assert.equal(
    baseUrlFromRequest({ headers: {} }, { VERCEL_ENV: 'preview', VERCEL_URL: 'theklope-preview.vercel.app' }),
    'https://theklope-preview.vercel.app',
  )
  assert.equal(
    baseUrlFromRequest({ headers: { host: 'localhost:5173' } }, { NODE_ENV: 'development' }),
    'http://localhost:5173',
  )
  assert.throws(
    () => baseUrlFromRequest({ headers: { host: 'shop.example' } }, { NODE_ENV: 'development' }),
    /HTTPS/,
  )
})
