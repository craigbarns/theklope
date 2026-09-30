import assert from 'node:assert/strict'
import test from 'node:test'

import {
  consumeOrderVoucher,
  ensureOrderVoucher,
  findUsableVoucher,
  generateVoucherCode,
  isVoucherCode,
  voucherEmailHtml,
} from './vouchers.js'
import { computeTotals } from '../../src/lib/pricing.js'

// Table « vouchers » en mémoire avec les contraintes d'unicité réelles.
function fakeVouchers(rows = []) {
  const table = rows.map((row) => ({ ...row }))
  const query = (mode, payload) => {
    const filters = []
    const q = {
      select() { return q },
      eq(col, value) { filters.push((r) => r[col] === value); return q },
      is(col, value) { filters.push((r) => (r[col] ?? null) === value); return q },
      maybeSingle() { return q.run(true) },
      single() { return q.run(true) },
      then(resolve, reject) { return q.run(false).then(resolve, reject) },
      async run(one) {
        if (mode === 'insert') {
          if (table.some((r) => r.code === payload.code)) return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "vouchers_pkey"' } }
          if (table.some((r) => r.source_order_id === payload.source_order_id)) return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "vouchers_source_order_id_key"' } }
          table.push({ used_at: null, ...payload })
          return { data: { ...payload }, error: null }
        }
        const matched = table.filter((r) => filters.every((f) => f(r)))
        if (mode === 'update') {
          for (const r of matched) Object.assign(r, payload)
          return { data: null, error: null }
        }
        return { data: one ? (matched[0] ? { ...matched[0] } : null) : matched, error: null }
      },
    }
    return q
  }
  return {
    table,
    from: () => ({
      select: () => query('select'),
      insert: (row) => query('insert', row),
      update: (patch) => query('update', patch),
    }),
  }
}

const NOW = new Date('2026-10-01T10:00:00Z')
const order = { id: 'TK-1', customer: { email: 'Marie@Exemple.fr' } }

test('code : format lisible, sans caractères ambigus', () => {
  const code = generateVoucherCode()
  assert.match(code, /^MERCI-[A-HJ-KM-NP-Z2-9]{6}$/)
  assert.equal(isVoucherCode(code.toLowerCase()), true)
  assert.equal(isVoucherCode('MERCI-O0I1LL'), false)
  assert.equal(isVoucherCode('BIENVENUE'), false)
})

test('un seul bon par commande, même si la confirmation est rejouée', async () => {
  const client = fakeVouchers()
  const first = await ensureOrderVoucher(order, client, { now: NOW })
  const again = await ensureOrderVoucher(order, client, { now: NOW })
  assert.equal(client.table.length, 1)
  assert.equal(again.code, first.code)
  assert.equal(client.table[0].email, 'marie@exemple.fr')
  assert.equal(client.table[0].percent, 5)
  assert.equal(client.table[0].expires_at, '2026-11-30T10:00:00.000Z')
})

test('une collision de code est réessayée avec un autre code', async () => {
  const client = fakeVouchers([{ code: 'MERCI-AAAAAA', source_order_id: 'TK-0', email: 'x@y.fr' }])
  const draws = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
  const voucher = await ensureOrderVoucher(order, client, { now: NOW, random: () => draws.shift() })
  assert.equal(voucher.code, 'MERCI-BBBBBB')
})

test('vérification : nominatif, usage unique, date limite', async () => {
  const client = fakeVouchers([
    { code: 'MERCI-ABCDEF', email: 'marie@exemple.fr', percent: 5, expires_at: '2026-11-30T10:00:00Z', used_at: null },
    { code: 'MERCI-USEDXX', email: 'marie@exemple.fr', percent: 5, expires_at: '2026-11-30T10:00:00Z', used_at: '2026-10-01T09:00:00Z' },
    { code: 'MERCI-PASTXX', email: 'marie@exemple.fr', percent: 5, expires_at: '2026-09-30T10:00:00Z', used_at: null },
  ])
  const ok = await findUsableVoucher(client, ' merci-abcdef ', 'MARIE@exemple.fr', { now: NOW })
  assert.deepEqual(ok, { ok: true, voucher: { code: 'MERCI-ABCDEF', percent: 5, expiresAt: '2026-11-30T10:00:00Z' } })
  assert.match((await findUsableVoucher(client, 'MERCI-ABCDEF', 'autre@exemple.fr', { now: NOW })).error, /invalide/)
  assert.match((await findUsableVoucher(client, 'MERCI-USEDXX', 'marie@exemple.fr', { now: NOW })).error, /déjà été utilisé/)
  assert.match((await findUsableVoucher(client, 'MERCI-PASTXX', 'marie@exemple.fr', { now: NOW })).error, /expiré/)
  assert.match((await findUsableVoucher(client, 'N-IMPORTE', 'marie@exemple.fr', { now: NOW })).error, /invalide/)
})

test('le bon est consommé une seule fois quand la commande qui l’utilise est payée', async () => {
  const client = fakeVouchers([{ code: 'MERCI-ABCDEF', email: 'm@e.fr', percent: 5, expires_at: '2026-11-30T10:00:00Z', used_at: null }])
  const paid = { id: 'TK-2', promo: { code: 'MERCI-ABCDEF', kind: 'voucher', type: 'percent', value: 5 } }
  assert.equal(await consumeOrderVoucher(paid, client, { now: NOW }), true)
  assert.equal(client.table[0].used_order_id, 'TK-2')
  await consumeOrderVoucher({ ...paid, id: 'TK-3' }, client, { now: new Date('2026-10-02T00:00:00Z') })
  assert.equal(client.table[0].used_order_id, 'TK-2', 'un second passage ne réattribue pas le bon')
  assert.equal(await consumeOrderVoucher({ id: 'TK-4', promo: null }, client), false)
})

test('totaux : 5 % appliqués, jamais cumulés avec le tarif quantité', () => {
  const voucher = { code: 'MERCI-ABCDEF', percent: 5 }
  const kit = [{ price: 40, qty: 1, category: 'ecig' }]
  const withVoucher = computeTotals({ lines: kit, promoCode: 'MERCI-ABCDEF', voucher, shippingMethodId: 'pickup' })
  assert.equal(withVoucher.discount, 2)
  assert.equal(withVoucher.appliedPromo.kind, 'voucher')

  // 20 fioles Liquidarom : le tarif quantité (−50 %) l'emporte, le bon n'est pas consommé.
  const bulk = [{ price: 5.9, qty: 20, brand: 'Liquidarom', volume: '10ml', category: 'eliquide' }]
  const beaten = computeTotals({ lines: bulk, promoCode: 'MERCI-ABCDEF', voucher, shippingMethodId: 'pickup' })
  assert.equal(beaten.discountSource, 'auto')
  assert.equal(beaten.appliedPromo, null)

  // Sans bon vérifié, le code seul ne donne rien.
  assert.equal(computeTotals({ lines: kit, promoCode: 'MERCI-ABCDEF' }).discount, 0)
  assert.equal(computeTotals({ lines: kit, promoCode: 'MERCI-ZZZZZZ', voucher }).discount, 0)
})

test('e-mail : code, pourcentage, date limite et règle de non-cumul', () => {
  const html = voucherEmailHtml({ code: 'MERCI-ABCDEF', percent: 5, expires_at: '2026-11-30T10:00:00Z' })
  assert.match(html, /MERCI-ABCDEF/)
  assert.match(html, /5 % de réduction/)
  assert.match(html, /30 novembre 2026/)
  assert.match(html, /Non cumulable/)
  assert.equal(voucherEmailHtml(null), '')
})
