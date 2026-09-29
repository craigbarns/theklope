import assert from 'node:assert/strict'
import test from 'node:test'

import {
  GOOGLE_REVIEW_URL,
  firstName,
  googleReviewEmailHtml,
  sendGoogleReviewRequests,
} from './googleReview.js'

// Base de données en mémoire qui imite le sous-ensemble de PostgREST utilisé.
function fakeClient(rows) {
  const table = rows.map((row) => ({ ...row }))
  const builder = (mode, patch) => {
    const filters = []
    let limit = Infinity
    let returning = false
    const q = {
      select(columns) { if (mode === 'update') returning = true; return q },
      eq(col, value) { filters.push((r) => r[col] === value); return q },
      is(col, value) { filters.push((r) => (r[col] ?? null) === value); return q },
      not(col, op, value) {
        if (op === 'is') filters.push((r) => (r[col] ?? null) !== value)
        else if (op === 'in') {
          const list = value.replace(/[()]/g, '').split(',')
          filters.push((r) => !list.includes(r[col]))
        }
        return q
      },
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
  return {
    table,
    from: () => ({
      select: (columns) => builder('select').select(columns),
      update: (patch) => builder('update', patch),
    }),
  }
}

const NOW = new Date('2026-10-10T08:00:00Z')
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const order = (id, overrides = {}) => ({
  id,
  created_at: daysAgo(6),
  customer: { name: 'Marie Dupont', email: `${id}@exemple.fr` },
  customer_email: `${id}@exemple.fr`,
  status: 'paid',
  payment_status: 'paid',
  checkout_review_required_at: null,
  google_review_email_sent_at: null,
  ...overrides,
})

test('envoie une demande unique aux commandes payées de plus de 5 jours', async () => {
  const client = fakeClient([
    order('TK-OK'),
    order('TK-TROP-RECENT', { created_at: daysAgo(3) }),
    order('TK-TROP-ANCIENNE', { created_at: daysAgo(40) }),
    order('TK-IMPAYEE', { payment_status: 'unpaid' }),
    order('TK-ANNULEE', { status: 'cancelled' }),
    order('TK-REMBOURSEE', { status: 'refunded' }),
    order('TK-EN-REVUE', { checkout_review_required_at: daysAgo(5) }),
    order('TK-DEJA', { google_review_email_sent_at: daysAgo(1) }),
  ])
  const sent = []
  const result = await sendGoogleReviewRequests(client, { now: NOW, send: async (mail) => sent.push(mail) })

  assert.deepEqual(sent.map((mail) => mail.to), ['tk-ok@exemple.fr'])
  assert.equal(result.sent, 1)
  assert.equal(sent[0].idempotencyKey, 'google-review-TK-OK')
  assert.equal(sent[0].replyTo, 'contact@theklope.com')
  assert.match(sent[0].html, /g\.page\/r\/CWgopwUk40fiEAE\/review/)
  assert.ok(client.table.find((r) => r.id === 'TK-OK').google_review_email_sent_at)

  // Deuxième passage du cron : rien ne repart.
  const again = await sendGoogleReviewRequests(client, { now: NOW, send: async (mail) => sent.push(mail) })
  assert.equal(again.sent, 0)
  assert.equal(sent.length, 1)
})

test('un client déjà sollicité ne reçoit jamais de seconde demande', async () => {
  const client = fakeClient([
    order('TK-ANCIENNE', { customer_email: 'fidele@exemple.fr', created_at: daysAgo(30), google_review_email_sent_at: daysAgo(25) }),
    order('TK-NOUVELLE', { customer_email: 'fidele@exemple.fr', customer: { email: 'fidele@exemple.fr' } }),
    order('TK-A', { customer_email: 'double@exemple.fr' }),
    order('TK-B', { customer_email: 'DOUBLE@exemple.fr', created_at: daysAgo(7) }),
  ])
  const sent = []
  const result = await sendGoogleReviewRequests(client, { now: NOW, send: async (mail) => sent.push(mail) })

  assert.deepEqual(sent.map((mail) => mail.to), ['double@exemple.fr'])
  assert.equal(result.skipped, 2)
  // Les commandes ignorées sont marquées : elles ne seront plus reconsidérées.
  assert.ok(client.table.every((r) => r.google_review_email_sent_at))
})

test('un échec d’envoi libère la commande pour le prochain passage', async () => {
  const client = fakeClient([order('TK-KO')])
  const failed = await sendGoogleReviewRequests(client, {
    now: NOW,
    send: async () => { throw new Error('Resend 500') },
  })
  assert.equal(failed.sent, 0)
  assert.equal(failed.failures[0].id, 'TK-KO')
  assert.equal(client.table[0].google_review_email_sent_at, null)

  const sent = []
  const retry = await sendGoogleReviewRequests(client, { now: NOW, send: async (mail) => sent.push(mail) })
  assert.equal(retry.sent, 1)
})

test('l’e-mail est neutre, personnel et sans contenu promotionnel', () => {
  const html = googleReviewEmailHtml({
    customer: { name: 'Marie <script> Dupont' },
    orderId: 'TK-123',
    createdAt: '2026-10-04T10:00:00Z',
  })
  assert.match(html, /Bonjour Marie/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /TK-123/)
  assert.match(html, /4 octobre/)
  assert.ok(html.includes(GOOGLE_REVIEW_URL))
  assert.match(html, /Répondez simplement à cet e-mail/)
  // Ni remise, ni cadeau contre un avis (règles Google), ni promotion (L3513-4).
  assert.doesNotMatch(html, /promo|remise|réduction|offert|gratuit|cadeau|%|5 étoiles|boutique\b\/?"/i)
})

test('prénom : premier mot du nom, vide si absent ou aberrant', () => {
  assert.equal(firstName({ name: 'Jean-Luc Martin' }), 'Jean-Luc')
  assert.equal(firstName({ firstName: 'Sofia', name: 'Autre' }), 'Sofia')
  assert.equal(firstName({}), '')
  assert.equal(firstName({ name: 'x'.repeat(60) }), '')
})
