import test from 'node:test'
import assert from 'node:assert/strict'

import { getPaidOrders } from './dashboard.js'

test('sales metrics include only paid, non-cancelled orders', () => {
  const paidOrders = getPaidOrders([
    { id: 'paid-processing', paymentStatus: 'paid', status: 'processing' },
    { id: 'paid-stock-issue', paymentStatus: 'paid', status: 'stock_issue' },
    { id: 'abandoned', paymentStatus: 'unpaid', status: 'pending_payment' },
    { id: 'failed', paymentStatus: 'failed', status: 'cancelled' },
    { id: 'cancelled-after-payment', paymentStatus: 'paid', status: 'cancelled' },
  ])

  assert.deepEqual(
    paidOrders.map((order) => order.id),
    ['paid-processing', 'paid-stock-issue'],
  )
})
