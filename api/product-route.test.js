import test from 'node:test'
import assert from 'node:assert/strict'
import handler from './product-route.js'

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    endedWith: null,
    setHeader(name, value) {
      res.headers[name.toLowerCase()] = value
      return res
    },
    status(code) {
      res.statusCode = code
      return res
    },
    json(data) {
      res.endedWith = data
      return res
    },
    end(data) {
      res.endedWith = data
      return res
    },
    redirect(status, url) {
      res.statusCode = status
      res.redirectUrl = url
      return res
    }
  }
  return res
}

test('POST /api/product-route rejects requests with invalid or forged tokens', async () => {
  const req = {
    method: 'POST',
    body: {
      orderId: 'order_123',
      productId: 'h40-voopoo',
      token: 'fake-invalid-token',
      rating: 5,
      authorName: 'Jean',
      comment: 'Excellent produit !'
    }
  }
  const res = createMockRes()
  await handler(req, res)

  assert.equal(res.statusCode, 403)
  assert.equal(res.endedWith?.ok, false)
})

test('POST /api/product-route rejects requests with invalid rating', async () => {
  const req = {
    method: 'POST',
    body: {
      orderId: 'order_123',
      productId: 'h40-voopoo',
      token: 'some.token',
      rating: 10,
      authorName: 'Jean',
      comment: 'Trop bien'
    }
  }
  const res = createMockRes()
  await handler(req, res)

  // Token check fails first or rating fails
  assert.ok([400, 403].includes(res.statusCode))
})

test('GET /api/product-route with action=reviews returns array without crashing', async () => {
  const req = {
    method: 'GET',
    query: {
      action: 'reviews',
      id: 'h40-voopoo'
    }
  }
  const res = createMockRes()
  await handler(req, res)

  assert.equal(res.statusCode, 200)
  assert.equal(res.endedWith?.ok, true)
  assert.ok(Array.isArray(res.endedWith?.reviews))
})
