import assert from 'node:assert/strict'
import test from 'node:test'

import { authenticateAdminRequest, readBearerToken } from './adminAuth.js'

function mockClient({ user = { id: 'owner-id' }, userError = null, membership = { user_id: 'owner-id' }, membershipError = null } = {}) {
  return {
    auth: {
      getUser: async (token) => {
        assert.equal(token, 'valid-token')
        return { data: { user }, error: userError }
      },
    },
    from: (table) => {
      assert.equal(table, 'admin_users')
      return {
        select: (columns) => {
          assert.equal(columns, 'user_id')
          return {
            eq: (column, value) => {
              assert.equal(column, 'user_id')
              assert.equal(value, user.id)
              return {
                maybeSingle: async () => ({ data: membership, error: membershipError }),
              }
            },
          }
        },
      }
    },
  }
}

test('readBearerToken accepts one strict Bearer token', () => {
  assert.equal(readBearerToken('Bearer valid-token'), 'valid-token')
  assert.equal(readBearerToken('bearer valid-token'), '')
  assert.equal(readBearerToken('Bearer valid-token extra'), '')
  assert.equal(readBearerToken(['Bearer valid-token']), '')
})

test('authenticateAdminRequest rejects requests without a token', async () => {
  const result = await authenticateAdminRequest({ headers: {} }, mockClient())
  assert.deepEqual(result, { ok: false, status: 401, error: 'Authentification requise.' })
})

test('authenticateAdminRequest rejects an invalid Supabase session', async () => {
  const client = mockClient({ user: null, userError: new Error('invalid token') })
  const result = await authenticateAdminRequest({ headers: { authorization: 'Bearer valid-token' } }, client)
  assert.deepEqual(result, { ok: false, status: 401, error: 'Session admin invalide.' })
})

test('authenticateAdminRequest rejects an authenticated non-admin', async () => {
  const result = await authenticateAdminRequest(
    { headers: { authorization: 'Bearer valid-token' } },
    mockClient({ membership: null }),
  )
  assert.deepEqual(result, { ok: false, status: 403, error: 'Acces administrateur refuse.' })
})

test('authenticateAdminRequest fails closed when the allowlist is unavailable', async () => {
  const originalConsoleError = console.error
  console.error = () => {}
  try {
    const result = await authenticateAdminRequest(
      { headers: { authorization: 'Bearer valid-token' } },
      mockClient({ membership: null, membershipError: new Error('missing table') }),
    )
    assert.deepEqual(result, { ok: false, status: 503, error: 'Autorisation admin indisponible.' })
  } finally {
    console.error = originalConsoleError
  }
})

test('authenticateAdminRequest accepts an allowlisted user', async () => {
  const result = await authenticateAdminRequest(
    { headers: { authorization: 'Bearer valid-token' } },
    mockClient(),
  )
  assert.equal(result.ok, true)
  assert.equal(result.user.id, 'owner-id')
})
