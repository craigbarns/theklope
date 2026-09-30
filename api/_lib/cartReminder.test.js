import assert from 'node:assert/strict'
import test from 'node:test'

import { cartReminderEmailHtml, encodeCartForUrl, sendCartReminders } from './cartReminder.js'
import { decodeCartRestore } from '../../src/lib/cartRestore.js'

function fakeClient(rows) {
  const table = rows.map((row) => ({ ...row }))
  const builder = (mode, patch) => {
    const filters = []
    let limit = Infinity
    let returning = false
    const q = {
      select() { if (mode === 'update') returning = true; return q },
      eq(col, value) { filters.push((r) => r[col] === value); return q },
      is(col, value) { filters.push((r) => (r[col] ?? null) === value); return q },
      in(col, values) { filters.push((r) => values.includes(r[col])); return q },
      gte(col, value) { filters.push((r) => r[col] >= value); return q },
      lte(col, value) { filters.push((r) => r[col] <= value); return q },
      order() { return q },
      limit(n) { limit = n; return q },
      then(resolve) {
        const matched = table.filter((r) => filters.every((f) => f(r))).slice(0, limit)
        if (mode === 'update') {
          for (const r of matched) Object.assign(r, patch)
          return resolve({ data: returning ? matched.map((r) => ({ id: r.id })) : null, error: null })
        }
        return resolve({ data: matched.map((r) => ({ ...r })), error: null })
      },
    }
    return q
  }
  return { table, from: () => ({ select: () => builder('select'), update: (patch) => builder('update', patch) }) }
}

const NOW = new Date('2026-10-02T07:50:00Z')
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3600000).toISOString()
const items = [{ product_id: 'act-1-0', name: 'ACT 1', qty: 3, variant: { nicotine: 6 }, line_total: 17.7 }]
const attempt = (id, extra = {}) => ({
  id,
  created_at: hoursAgo(10),
  customer: { name: 'Marie Dupont', email: `${id}@ex.fr` },
  customer_email: `${id}@ex.fr`,
  status: 'cancelled',
  payment_status: 'unpaid',
  checkout_review_required_at: null,
  cart_reminder_sent_at: null,
  order_items: items,
  ...extra,
})

test('une seule relance, pour une tentative non payée de 1 h à 48 h', async () => {
  const client = fakeClient([
    attempt('ok'),
    attempt('trop-recent', { created_at: hoursAgo(0.5) }),
    attempt('trop-ancien', { created_at: hoursAgo(72) }),
    attempt('payee', { payment_status: 'paid', status: 'processing' }),
  ])
  const sent = []
  const result = await sendCartReminders(client, { now: NOW, send: async (mail) => sent.push(mail) })
  assert.deepEqual(sent.map((mail) => mail.to), ['ok@ex.fr'])
  assert.equal(result.sent, 1)
  assert.equal((await sendCartReminders(client, { now: NOW, send: async (mail) => sent.push(mail) })).sent, 0)
})

test('pas de relance si le client a payé depuis, ni deux relances au même e-mail', async () => {
  const client = fakeClient([
    attempt('a1', { customer_email: 'finale@ex.fr' }),
    { id: 'a2', created_at: hoursAgo(9), customer_email: 'finale@ex.fr', payment_status: 'paid', status: 'processing', order_items: items },
    attempt('b1', { customer_email: 'double@ex.fr' }),
    attempt('b2', { customer_email: 'double@ex.fr', created_at: hoursAgo(5) }),
  ])
  const sent = []
  await sendCartReminders(client, { now: NOW, send: async (mail) => sent.push(mail) })
  assert.deepEqual(sent.map((mail) => mail.to), ['double@ex.fr'])
})

test('le lien remet exactement le panier, et le décodeur ignore les entrées invalides', () => {
  const encoded = encodeCartForUrl([...items, { product_id: 'kit', qty: 1, variant: {} }])
  assert.deepEqual(decodeCartRestore(encoded), [
    { productId: 'act-1-0', qty: 3, variant: { nicotine: 6 } },
    { productId: 'kit', qty: 1, variant: {} },
  ])
  const hostile = Buffer.from(JSON.stringify([['x', 999], [42, 1], 'nope', ['ok', 2, [1]]])).toString('base64url')
  assert.deepEqual(decodeCartRestore(hostile), [{ productId: 'ok', qty: 2, variant: {} }])
  assert.deepEqual(decodeCartRestore('%%%'), [])
})

test('l’e-mail est neutre : panier, lien de reprise, aucune remise', () => {
  const html = cartReminderEmailHtml(attempt('x'))
  assert.match(html, /Bonjour Marie/)
  assert.match(html, /ACT 1 × 3/)
  assert.match(html, /\/panier\?reprise=/)
  const text = html.replace(/<[^>]+>/g, ' ')
  assert.doesNotMatch(text, /promo|remise|réduction|\d\s?%/i)
})
