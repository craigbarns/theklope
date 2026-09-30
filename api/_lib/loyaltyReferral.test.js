import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ensureLoyaltyVoucher,
  ensureReferralCode,
  ensureReferralReward,
  findUsableVoucher,
  loyaltyEmailHtml,
} from './vouchers.js'
import { computeTotals } from '../../src/lib/pricing.js'

// Base en mémoire, plusieurs tables, contraintes d'unicité utiles.
function fakeDb(seed = {}) {
  const tables = Object.fromEntries(Object.entries(seed).map(([name, rows]) => [name, rows.map((r) => ({ ...r }))]))
  const table = (name) => (tables[name] ||= [])
  const unique = {
    vouchers: [['code', 'vouchers_pkey'], [['source_order_id', 'kind'], 'vouchers_source_order_id_kind_key']],
    referral_codes: [['email', 'referral_codes_pkey'], ['code', 'referral_codes_code_key']],
  }
  const query = (name, mode, payload) => {
    const filters = []
    let limit = Infinity
    const q = {
      select() { return q },
      eq(col, value) { filters.push((r) => r[col] === value); return q },
      is(col, value) { filters.push((r) => (r[col] ?? null) === value); return q },
      gte(col, value) { filters.push((r) => (r[col] ?? '') >= value); return q },
      in(col, values) { filters.push((r) => values.includes(r[col])); return q },
      limit(n) { limit = n; return q },
      maybeSingle() { return q.run(true) },
      single() { return q.run(true) },
      then(resolve, reject) { return q.run(false).then(resolve, reject) },
      async run(one) {
        const rows = table(name)
        if (mode === 'insert') {
          for (const [cols, constraint] of unique[name] || []) {
            const keys = Array.isArray(cols) ? cols : [cols]
            if (rows.some((r) => keys.every((k) => r[k] === payload[k]))) {
              return { data: null, error: { code: '23505', message: `duplicate key value violates unique constraint "${constraint}"` } }
            }
          }
          const row = { created_at: '2026-10-01T10:00:00Z', used_at: null, ...payload }
          rows.push(row)
          return { data: { ...row }, error: null }
        }
        const matched = rows.filter((r) => filters.every((f) => f(r))).slice(0, limit)
        if (mode === 'update') {
          matched.forEach((r) => Object.assign(r, payload))
          return { data: null, error: null }
        }
        return { data: one ? (matched[0] ? { ...matched[0] } : null) : matched.map((r) => ({ ...r })), error: null }
      },
    }
    return q
  }
  return {
    tables,
    from: (name) => ({
      select: () => query(name, 'select'),
      insert: (row) => query(name, 'insert', row),
      update: (patch) => query(name, 'update', patch),
    }),
  }
}

const NOW = new Date('2026-10-10T10:00:00Z')
const paid = (id, email, subtotal, extra = {}) => ({
  id, customer_email: email, payment_status: 'paid', subtotal, discount: 0, created_at: '2026-10-05T10:00:00Z', ...extra,
})

test('fidélité : 1 € = 1 point, un bon de 5 € par tranche de 100 points', async () => {
  const db = fakeDb({ orders: [paid('A', 'm@e.fr', 60.9), paid('B', 'm@e.fr', 45.5)] })
  const first = await ensureLoyaltyVoucher({ id: 'B', customer_email: 'm@e.fr' }, db, { now: NOW })
  assert.match(first.voucher.code, /^FIDEL-/)
  assert.equal(Number(first.voucher.amount), 5)
  assert.equal(first.earned, 105)
  assert.equal(first.balance, 5)
  // Confirmation rejouée : même bon, pas de second bon.
  const again = await ensureLoyaltyVoucher({ id: 'B', customer_email: 'm@e.fr' }, db, { now: NOW })
  assert.equal(again.voucher.code, first.voucher.code)
  assert.equal(db.tables.vouchers.length, 1)
})

test('fidélité : sous 100 points, aucun bon ; les commandes d’avant le lancement ne comptent pas', async () => {
  const db = fakeDb({ orders: [paid('A', 'm@e.fr', 80), paid('OLD', 'm@e.fr', 500, { created_at: '2026-09-01T10:00:00Z' })] })
  const status = await ensureLoyaltyVoucher({ id: 'A', customer_email: 'm@e.fr' }, db, { now: NOW })
  assert.equal(status.voucher, null)
  assert.equal(status.balance, 80)
  assert.match(loyaltyEmailHtml({ loyalty: status }), /80 points[\s\S]*Encore 20 points/)
})

test('parrainage : un code par client, refusé à soi-même et hors première commande', async () => {
  const db = fakeDb({ orders: [paid('P1', 'parrain@e.fr', 30), paid('X1', 'ancien@e.fr', 30)] })
  const code = await ensureReferralCode(db, 'Parrain@E.fr')
  assert.match(code, /^AMI-/)
  assert.equal(await ensureReferralCode(db, 'parrain@e.fr'), code)

  const ok = await findUsableVoucher(db, code, 'filleul@e.fr', { now: NOW })
  assert.deepEqual(ok.voucher, { code, kind: 'referral', amount: 5, minSubtotal: 20 })
  assert.match((await findUsableVoucher(db, code, 'parrain@e.fr', { now: NOW })).error, /propre code/)
  assert.match((await findUsableVoucher(db, code, 'ancien@e.fr', { now: NOW })).error, /première commande/)
  assert.match((await findUsableVoucher(db, 'AMI-ZZZZZZ', 'filleul@e.fr', { now: NOW })).error, /invalide/)
})

test('parrainage : le parrain reçoit un bon de 5 € une seule fois par commande de filleul', async () => {
  const db = fakeDb({ referral_codes: [{ email: 'parrain@e.fr', code: 'AMI-ABCDEF' }] })
  const order = { id: 'F1', promo: { code: 'AMI-ABCDEF', kind: 'referral', type: 'amount', value: 5 } }
  const reward = await ensureReferralReward(order, db, { now: NOW })
  assert.equal(reward.email, 'parrain@e.fr')
  assert.match(reward.voucher.code, /^PARRAIN-/)
  const replay = await ensureReferralReward(order, db, { now: NOW })
  assert.equal(replay.voucher.code, reward.voucher.code)
  assert.equal(db.tables.vouchers.length, 1)
  assert.equal(await ensureReferralReward({ id: 'Z', promo: null }, db), null)
})

test('parrainage : plafond de 10 récompenses par an', async () => {
  const rewards = Array.from({ length: 10 }, (_, i) => ({
    code: `PARRAIN-AAAAA${'BCDEFGHJKM'[i]}`, kind: 'referral_reward', email: 'parrain@e.fr', source_order_id: `R${i}`, created_at: '2026-09-15T00:00:00Z',
  }))
  const db = fakeDb({ referral_codes: [{ email: 'parrain@e.fr', code: 'AMI-ABCDEF' }], vouchers: rewards })
  const order = { id: 'F11', promo: { code: 'AMI-ABCDEF', kind: 'referral' } }
  assert.equal(await ensureReferralReward(order, db, { now: NOW }), null)
})

test('totaux : 5 € fixes, minimum 20 € pour le parrainage, jamais cumulé', () => {
  const referral = { code: 'AMI-ABCDEF', kind: 'referral', amount: 5, minSubtotal: 20 }
  const kit = (price) => [{ price, qty: 1, category: 'ecig' }]
  assert.equal(computeTotals({ lines: kit(30), promoCode: 'AMI-ABCDEF', voucher: referral }).discount, 5)
  const below = computeTotals({ lines: kit(15), promoCode: 'AMI-ABCDEF', voucher: referral })
  assert.equal(below.discount, 0)
  assert.equal(below.promoRejected, true)
  const fidel = { code: 'FIDEL-ABCDEF', kind: 'voucher', amount: 5 }
  assert.equal(computeTotals({ lines: kit(3), promoCode: 'FIDEL-ABCDEF', voucher: fidel }).discount, 3, 'jamais plus que le panier')
  const bulk = [{ price: 5.9, qty: 20, brand: 'Liquidarom', volume: '10ml', category: 'eliquide' }]
  assert.equal(computeTotals({ lines: bulk, promoCode: 'FIDEL-ABCDEF', voucher: fidel }).discountSource, 'auto')
})
