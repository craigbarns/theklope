import assert from 'node:assert/strict'
import test from 'node:test'

import {
  completedFullRefundProof,
  ensureFullOrderRefund,
  hasMollieChargeback,
  orderConfirmationFulfillmentHtml,
  retryRefundConfirmationEmail,
  syncOrderFromMolliePayment,
  validateMolliePaymentForOrder,
} from './orders.js'

const order = {
  id: 'TK-0123456789ABCDEF',
  payment_id: 'tr_abcdefgh',
  payment_status: 'paid',
  status: 'stock_issue',
  total: '19.90',
  refund_id: null,
}

test('Mollie payment proof must match payment id, amount and currency', () => {
  const valid = {
    id: order.payment_id,
    amount: { currency: 'EUR', value: '19.90' },
  }
  assert.doesNotThrow(() => validateMolliePaymentForOrder(valid, order, order.payment_id))
  assert.throws(
    () => validateMolliePaymentForOrder({ ...valid, amount: { currency: 'EUR', value: '1.00' } }, order, order.payment_id),
    /Montant ou devise/,
  )
  assert.throws(
    () => validateMolliePaymentForOrder({ ...valid, id: 'tr_other' }, order, order.payment_id),
    /Identifiant/,
  )
})

test('pickup confirmation uses the shop address and suppresses delivery instructions', () => {
  const content = orderConfirmationFulfillmentHtml({
    customer: { name: 'Client' },
    shipping: { id: 'pickup' },
    address: { deliveryInstructions: '<ne pas afficher>' },
  })
  assert.match(content.fulfillmentHtml, /Retrait boutique :<br>188 rue de Rome, 13006 Marseille/)
  assert.equal(content.deliveryInstructionsHtml, '')
  assert.doesNotMatch(content.fulfillmentHtml, /Livraison à/)
})

function syncClient(orderRow) {
  const updates = []
  const rpcs = []
  return {
    updates,
    rpcs,
    from() {
      let operation = 'select'
      return {
        select() { operation = 'select'; return this },
        update(values) { operation = 'update'; updates.push(values); return this },
        eq() { return this },
        or() { return this },
        async maybeSingle() { return { data: orderRow, error: null } },
        then(resolve) {
          resolve(operation === 'update' ? { data: null, error: null } : { data: orderRow, error: null })
        },
      }
    },
    async rpc(name, params) {
      rpcs.push([name, params])
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
}

test('partial and full chargebacks latch review before any order transition', async () => {
  for (const value of ['1.00', '19.90']) {
    const payment = {
      id: order.payment_id,
      status: 'paid',
      amount: { currency: 'EUR', value: '19.90' },
      amountChargedBack: { currency: 'EUR', value },
      metadata: { orderId: order.id },
      isPaid: () => true,
    }
    assert.equal(hasMollieChargeback(payment), true)
    const client = syncClient({
      ...order,
      stock_reservation_status: 'consumed',
      refund_status: null,
      refund_attempt: 0,
      refund_reason: null,
    })
    const result = await syncOrderFromMolliePayment(order.payment_id, {
      client,
      mollieClient: { payments: { async get() { return payment } } },
    })
    assert.equal(result.reviewReason, 'payment_chargeback_detected')
    assert.equal(client.updates.at(-1).checkout_review_reason, 'payment_chargeback_detected')
    assert.equal(client.rpcs.length, 0)
  }
})

test('a terminal non-canonical payment is ignored while an exposed one latches review', async () => {
  const orderRow = {
    ...order,
    stock_reservation_status: 'consumed',
    refund_status: null,
    refund_attempt: 0,
    refund_reason: null,
  }
  const terminalClient = syncClient(orderRow)
  const terminal = await syncOrderFromMolliePayment('tr_terminal', {
    client: terminalClient,
    mollieClient: { payments: { async get() {
      return {
        id: 'tr_terminal',
        status: 'failed',
        amount: { currency: 'EUR', value: '19.90' },
        metadata: { orderId: order.id },
      }
    } } },
  })
  assert.equal(terminal.ignoredDuplicate, true)
  assert.equal(terminalClient.updates.length, 0)

  const exposedClient = syncClient(orderRow)
  await assert.rejects(
    syncOrderFromMolliePayment('tr_exposed', {
      client: exposedClient,
      mollieClient: { payments: { async get() {
        return {
          id: 'tr_exposed',
          status: 'open',
          amount: { currency: 'EUR', value: '19.90' },
          metadata: { orderId: order.id },
        }
      } } },
    }),
    (error) => error.code === 'multiple_payments_for_order',
  )
  assert.equal(exposedClient.updates.at(-1).checkout_review_reason, 'multiple_payments_for_order')

  const chargebackClient = syncClient(orderRow)
  const chargeback = await syncOrderFromMolliePayment('tr_chargedback', {
    client: chargebackClient,
    mollieClient: { payments: { async get() {
      return {
        id: 'tr_chargedback',
        status: 'paid',
        amount: { currency: 'EUR', value: '19.90' },
        amountChargedBack: { currency: 'EUR', value: '19.90' },
        metadata: { orderId: order.id },
        isPaid: () => true,
      }
    } } },
  })
  assert.equal(chargeback.reviewReason, 'payment_chargeback_detected')
  assert.equal(chargebackClient.updates.at(-1).checkout_review_reason, 'payment_chargeback_detected')
})

test('refund confirmation is suppressed for any financial review', async () => {
  let updateCalls = 0
  const client = {
    from() {
      return {
        select() { return this },
        eq() { return this },
        update() { updateCalls += 1; return this },
        async maybeSingle() {
          return {
            data: {
              id: order.id,
              payment_status: 'refunded',
              checkout_review_required_at: '2026-07-21T12:00:00.000Z',
              checkout_review_reason: 'multiple_payments_for_order',
              refund_email_sent_at: null,
              customer: { email: 'client@example.com' },
              total: order.total,
            },
            error: null,
          }
        },
      }
    },
  }
  const result = await retryRefundConfirmationEmail(order.id, client)
  assert.equal(result.sent, false)
  assert.equal(updateCalls, 0)
})

test('full refund recovery reuses a Mollie refund created before a database crash', async () => {
  const calls = []
  const existingRefund = {
    id: 're_abcdefgh',
    status: 'pending',
    amount: { currency: 'EUR', value: '19.90' },
    description: `Remboursement THEKLOPE ${order.id}`,
    metadata: { orderId: order.id },
  }
  const client = {
    async rpc(name, params) {
      calls.push([name, params])
      if (name === 'mark_order_refund_requested') {
        return { data: { ok: true, status: 'requested', refundId: null, refundAttempt: 1 }, error: null }
      }
      if (name === 'record_order_refund_state') {
        return { data: { ok: true, status: params.p_refund_status }, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
  let createCalls = 0
  const mollieClient = {
    paymentRefunds: {
      async page() { return [existingRefund] },
      async create() { createCalls += 1; return existingRefund },
    },
  }

  const result = await ensureFullOrderRefund(order, 'Rupture de stock', { client, mollieClient })
  assert.equal(result.refundId, existingRefund.id)
  assert.equal(result.refundStatus, 'pending')
  assert.equal(createCalls, 0)
  assert.equal(calls.at(-1)[0], 'record_order_refund_state')
  assert.equal(calls.at(-1)[1].p_refund_id, existingRefund.id)
  assert.equal(calls.at(-1)[1].p_refund_attempt, 1)
  assert.equal(calls.find(([name]) => name === 'mark_order_refund_requested')[1].p_allow_retry, false)
})

test('a newly created full refund carries a stable idempotency key', async () => {
  let request
  const client = {
    async rpc(name, params) {
      if (name === 'mark_order_refund_requested') {
        return { data: { ok: true, status: 'requested', refundId: null, refundAttempt: 1 }, error: null }
      }
      if (name === 'record_order_refund_state') {
        return { data: { ok: true, status: params.p_refund_status }, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
  const mollieClient = {
    paymentRefunds: {
      async page() { return [] },
      async create(parameters) {
        request = parameters
        return {
          id: 're_newrefund',
          status: 'queued',
          amount: parameters.amount,
          metadata: parameters.metadata,
        }
      },
    },
  }

  const result = await ensureFullOrderRefund(order, 'Annulation client', { client, mollieClient })
  assert.equal(result.refundStatus, 'queued')
  assert.equal(request.amount.value, '19.90')
  assert.match(request.idempotencyKey, /^tk-refund-[a-f0-9]{48}$/)
})

test('a prior partial refund only requests the exact remaining balance', async () => {
  let request
  const calls = []
  const partial = {
    id: 're_partial',
    status: 'refunded',
    amount: { currency: 'EUR', value: '5.00' },
    metadata: { orderId: order.id },
  }
  const client = {
    async rpc(name, params) {
      calls.push([name, params])
      if (name === 'mark_order_refund_requested') {
        return { data: { ok: true, status: 'requested', refundId: null, refundAttempt: 2, refundAmount: 14.9 }, error: null }
      }
      if (name === 'record_order_refund_state') {
        return { data: { ok: true, status: params.p_refund_status }, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
  const mollieClient = {
    paymentRefunds: {
      async page() { return [partial] },
      async create(parameters) {
        request = parameters
        return { id: 're_remaining', status: 'queued', amount: parameters.amount, metadata: parameters.metadata }
      },
    },
  }

  const result = await ensureFullOrderRefund(order, 'Solde du remboursement', {
    client,
    mollieClient,
    allowRetry: true,
  })
  assert.equal(result.refundStatus, 'queued')
  assert.equal(request.amount.value, '14.90')
  assert.equal(request.metadata.refundAttempt, 2)
  assert.equal(calls.find(([name]) => name === 'mark_order_refund_requested')[1].p_allow_retry, true)
  assert.equal(calls.find(([name]) => name === 'mark_order_refund_requested')[1].p_amount, 14.9)
  assert.equal(calls.at(-1)[1].p_refund_attempt, 2)
})

test('a full refund completed outside the app reconciles before local retry limits', async () => {
  const refunds = [
    { id: 're_one', status: 'refunded', amount: { currency: 'EUR', value: '5.00' } },
    { id: 're_two', status: 'refunded', amount: { currency: 'EUR', value: '14.90' } },
  ]
  assert.equal(completedFullRefundProof(refunds, order).refundedCents, 1990)

  const calls = []
  let refundEmailLookups = 0
  const client = {
    from() {
      refundEmailLookups += 1
      return {
        select() { return this },
        eq() { return this },
        async maybeSingle() {
          return {
            data: {
              id: order.id,
              payment_status: 'refunded',
              refund_email_sent_at: '2026-07-21T12:00:00.000Z',
              customer: {},
              total: order.total,
            },
            error: null,
          }
        },
      }
    },
    async rpc(name, params) {
      calls.push([name, params])
      if (name === 'reconcile_external_order_refund') {
        return { data: { ok: true, status: 'refunded' }, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
  const mollieClient = { paymentRefunds: { async page() { return refunds } } }
  const result = await ensureFullOrderRefund({ ...order, refund_attempt: 3 }, 'Déjà fait dans Mollie', {
    client,
    mollieClient,
  })
  assert.equal(result.refundStatus, 'refunded')
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'reconcile_external_order_refund')
  assert.equal(calls[0][1].p_refund_id, 're_two')
  assert.equal(refundEmailLookups, 1)
})

test('a terminal Mollie refund from the same attempt is recovered without another POST', async () => {
  const failedRefund = {
    id: 're_failedonce',
    status: 'failed',
    amount: { currency: 'EUR', value: '19.90' },
    metadata: { orderId: order.id, refundAttempt: 1 },
  }
  const calls = []
  const client = {
    async rpc(name, params) {
      calls.push([name, params])
      if (name === 'mark_order_refund_requested') {
        return { data: { ok: true, status: 'requested', refundId: null, refundAttempt: 1, refundAmount: 19.9 }, error: null }
      }
      if (name === 'record_order_refund_state') {
        return { data: { ok: true, status: params.p_refund_status }, error: null }
      }
      throw new Error(`Unexpected RPC ${name}`)
    },
  }
  let createCalls = 0
  const mollieClient = {
    paymentRefunds: {
      async page() { return [failedRefund] },
      async create() { createCalls += 1; return failedRefund },
    },
  }

  const result = await ensureFullOrderRefund(order, 'Récupération', { client, mollieClient })
  assert.equal(result.refundStatus, 'failed')
  assert.equal(createCalls, 0)
  assert.equal(calls.at(-1)[1].p_refund_id, failedRefund.id)
  assert.equal(calls.at(-1)[1].p_refund_status, 'failed')
})
