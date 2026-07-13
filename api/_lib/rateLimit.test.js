import assert from 'node:assert/strict'
import test from 'node:test'

import { enforceRequestRateLimits, getClientIp, hashRateLimitKey } from './rateLimit.js'

test('getClientIp prefers the Vercel client header and removes proxy suffixes', () => {
  const req = {
    headers: {
      'x-vercel-forwarded-for': '203.0.113.8, 10.0.0.1',
      'x-forwarded-for': '198.51.100.2',
    },
  }
  assert.equal(getClientIp(req), '203.0.113.8')
})

test('rate-limit keys are deterministic HMAC values and do not expose identity', () => {
  const first = hashRateLimitKey('contact:test@example.com', 'test-secret')
  const second = hashRateLimitKey('contact:test@example.com', 'test-secret')
  assert.equal(first, second)
  assert.equal(first.length, 64)
  assert.equal(first.includes('test@example.com'), false)
})

test('enforceRequestRateLimits stops at the first rejected rule', async () => {
  const calls = []
  const client = {
    rpc: async (name, params) => {
      calls.push({ name, params })
      return { data: calls.length === 1, error: null }
    },
  }
  const result = await enforceRequestRateLimits(
    { headers: { 'x-forwarded-for': '203.0.113.10' } },
    [
      { scope: 'contact_ip', limit: 10, windowSeconds: 3600 },
      { scope: 'contact_email', value: 'test@example.com', limit: 5, windowSeconds: 3600 },
      { scope: 'not_called', limit: 1, windowSeconds: 1 },
    ],
    { client, secret: 'test-secret' },
  )

  assert.deepEqual(result, { allowed: false, retryAfter: 3600 })
  assert.equal(calls.length, 2)
  assert.equal(calls[0].name, 'consume_rate_limit')
  assert.match(calls[0].params.p_key_hash, /^[a-f0-9]{64}$/)
})
