// =============================================================================
// Bons, fidélité et parrainage — décision du gérant (30/09/2026, « fais tout
// comme LPV »), prise en connaissance du risque juridique signalé
// (art. L3513-4 CSP : publicité indirecte en faveur des produits du vapotage).
// -----------------------------------------------------------------------------
// Trois mécanismes, tous adossés à des codes SECRETS envoyés par e-mail :
//
// 1. Bon « prochaine commande » MERCI-XXXXXX : 5 %, un par commande payée.
// 2. Fidélité : 1 € payé = 1 point (commandes payées depuis le lancement).
//    Chaque tranche de 100 points devient un bon FIDEL-XXXXXX de 5 €.
// 3. Parrainage : chaque client reçoit un code AMI-XXXXXX à partager. Un
//    filleul (première commande, dès 20 €) a 5 € de réduction ; une fois sa
//    commande payée, le parrain reçoit un bon PARRAIN-XXXXXX de 5 €.
//
// Tous les bons sont nominatifs (e-mail du client), à usage unique, et
// s'appliquent en plus du tarif quantité, sur les seuls articles qui n'en
// bénéficient pas (computeTotals, choix du gérant du 01/10/2026). Un bon est consommé quand la commande qui
// l'utilise est payée.
// =============================================================================
import { randomInt } from 'node:crypto'
import { emailLayout, escapeHtml } from './email.js'

export const VOUCHER_PERCENT = 5
export const VOUCHER_VALID_DAYS = 60
export const VOUCHER_PREFIX = 'MERCI-'
export const LOYALTY_POINTS_PER_VOUCHER = 100
export const LOYALTY_VOUCHER_AMOUNT = 5
export const LOYALTY_VALID_DAYS = 90
// Seules les commandes payées à partir du lancement rapportent des points :
// pas de bons rétroactifs en rafale pour les anciens clients.
export const LOYALTY_START = '2026-10-01T00:00:00Z'
export const REFERRAL_AMOUNT = 5
export const REFERRAL_MIN_SUBTOTAL = 20
export const REFERRAL_MAX_REWARDS_PER_YEAR = 10

// Sans 0/O ni 1/I/L : le code se recopie sans ambiguïté.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const SUFFIX = '[A-HJ-KM-NP-Z2-9]{6}'
const VOUCHER_RE = new RegExp(`^(MERCI|FIDEL|PARRAIN)-${SUFFIX}$`)
const REFERRAL_RE = new RegExp(`^AMI-${SUFFIX}$`)
const DAY_MS = 24 * 60 * 60 * 1000

const PREFIX_BY_KIND = { next_order: 'MERCI-', loyalty: 'FIDEL-', referral_reward: 'PARRAIN-' }

export const normalizeVoucherCode = (code) => String(code || '').trim().toUpperCase().replace(/\s+/g, '')
export const isVoucherCode = (code) => VOUCHER_RE.test(normalizeVoucherCode(code))
export const isReferralCode = (code) => REFERRAL_RE.test(normalizeVoucherCode(code))
export const isAnyDiscountCode = (code) => isVoucherCode(code) || isReferralCode(code)
const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export function generateVoucherCode(random = randomInt, prefix = VOUCHER_PREFIX) {
  let suffix = ''
  for (let index = 0; index < 6; index += 1) suffix += ALPHABET[random(ALPHABET.length)]
  return `${prefix}${suffix}`
}

const isUniqueViolation = (error, needle = '') => error?.code === '23505'
  && (!needle || `${error?.message || ''} ${error?.details || ''}`.includes(needle))

const VOUCHER_FIELDS = 'code, kind, percent, amount, expires_at'

// Crée (ou relit) le bon d'un type donné rattaché à une commande. Idempotent
// grâce à l'unicité (source_order_id, kind).
async function ensureVoucher(client, { orderId, kind, email, percent = null, amount = null, days }, { now, random }) {
  const read = () => client.from('vouchers').select(VOUCHER_FIELDS).eq('source_order_id', orderId).eq('kind', kind).maybeSingle()
  const existing = await read()
  if (existing.error) throw existing.error
  if (existing.data) return { ...existing.data, created: false }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const row = {
      code: generateVoucherCode(random, PREFIX_BY_KIND[kind]),
      kind,
      email,
      percent,
      amount,
      source_order_id: orderId,
      expires_at: new Date(now.getTime() + days * DAY_MS).toISOString(),
    }
    const inserted = await client.from('vouchers').insert(row).select(VOUCHER_FIELDS).single()
    if (!inserted.error) return { ...inserted.data, created: true }
    if (isUniqueViolation(inserted.error, 'source_order_id')) {
      const again = await read()
      if (again.error) throw again.error
      return again.data ? { ...again.data, created: false } : null
    }
    if (!isUniqueViolation(inserted.error)) throw inserted.error
  }
  throw new Error('Impossible de générer un code de réduction unique.')
}

// 1. Bon « prochaine commande » (5 %).
export async function ensureOrderVoucher(order, client, { now = new Date(), random = randomInt } = {}) {
  const email = normalizeEmail(order?.customer_email || order?.customer?.email)
  if (!client || !order?.id || !email) return null
  return ensureVoucher(client, {
    orderId: order.id, kind: 'next_order', email, percent: VOUCHER_PERCENT, days: VOUCHER_VALID_DAYS,
  }, { now, random })
}

// 2. Fidélité : solde = points gagnés − 100 × bons fidélité déjà émis.
export async function loyaltyStatus(client, email) {
  const normalized = normalizeEmail(email)
  const [orders, vouchers] = await Promise.all([
    client.from('orders').select('subtotal, discount').eq('customer_email', normalized).eq('payment_status', 'paid').gte('created_at', LOYALTY_START),
    client.from('vouchers').select('code').eq('email', normalized).eq('kind', 'loyalty'),
  ])
  if (orders.error) throw orders.error
  if (vouchers.error) throw vouchers.error
  const earned = (orders.data || []).reduce(
    (sum, row) => sum + Math.floor(Math.max(0, Number(row.subtotal || 0) - Number(row.discount || 0))),
    0,
  )
  const converted = (vouchers.data || []).length * LOYALTY_POINTS_PER_VOUCHER
  return { earned, balance: Math.max(0, earned - converted) }
}

export async function ensureLoyaltyVoucher(order, client, { now = new Date(), random = randomInt } = {}) {
  const email = normalizeEmail(order?.customer_email || order?.customer?.email)
  if (!client || !order?.id || !email) return null
  // Déjà émis pour cette commande (confirmation rejouée) : on le relit.
  const existing = await client.from('vouchers').select(VOUCHER_FIELDS).eq('source_order_id', order.id).eq('kind', 'loyalty').maybeSingle()
  if (existing.error) throw existing.error
  const status = await loyaltyStatus(client, email)
  if (existing.data) return { voucher: existing.data, ...status }
  if (status.balance < LOYALTY_POINTS_PER_VOUCHER) return { voucher: null, ...status }
  const voucher = await ensureVoucher(client, {
    orderId: order.id, kind: 'loyalty', email, amount: LOYALTY_VOUCHER_AMOUNT, days: LOYALTY_VALID_DAYS,
  }, { now, random })
  return { voucher, earned: status.earned, balance: status.balance - (voucher?.created ? LOYALTY_POINTS_PER_VOUCHER : 0) }
}

// 3. Parrainage : un code partageable par client (idempotent par e-mail).
export async function ensureReferralCode(client, email, { random = randomInt } = {}) {
  const normalized = normalizeEmail(email)
  if (!client || !normalized) return null
  const read = () => client.from('referral_codes').select('code').eq('email', normalized).maybeSingle()
  const existing = await read()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data.code
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateVoucherCode(random, 'AMI-')
    const inserted = await client.from('referral_codes').insert({ code, email: normalized }).select('code').single()
    if (!inserted.error) return inserted.data.code
    // referral_codes : clé primaire = e-mail ; « _pkey » signale une course
    // avec une autre exécution pour le même client, « code » une collision.
    if (isUniqueViolation(inserted.error, 'referral_codes_pkey')) {
      const again = await read()
      if (again.error) throw again.error
      return again.data?.code || null
    }
    if (!isUniqueViolation(inserted.error)) throw inserted.error
  }
  throw new Error('Impossible de générer un code de parrainage unique.')
}

// Parrain récompensé une fois la commande du filleul payée.
export async function ensureReferralReward(order, client, { now = new Date(), random = randomInt } = {}) {
  const promo = order?.promo
  if (!client || promo?.kind !== 'referral' || !isReferralCode(promo.code)) return null
  const { data: referral, error } = await client.from('referral_codes').select('email').eq('code', normalizeVoucherCode(promo.code)).maybeSingle()
  if (error) throw error
  if (!referral?.email) return null
  const yearAgo = new Date(now.getTime() - 365 * DAY_MS).toISOString()
  const { data: previous, error: previousError } = await client
    .from('vouchers').select('code').eq('email', referral.email).eq('kind', 'referral_reward').gte('created_at', yearAgo)
  if (previousError) throw previousError
  const alreadyForOrder = await client.from('vouchers').select(VOUCHER_FIELDS).eq('source_order_id', order.id).eq('kind', 'referral_reward').maybeSingle()
  if (alreadyForOrder.error) throw alreadyForOrder.error
  if (alreadyForOrder.data) return { voucher: { ...alreadyForOrder.data, created: false }, email: referral.email }
  if ((previous || []).length >= REFERRAL_MAX_REWARDS_PER_YEAR) return null
  const voucher = await ensureVoucher(client, {
    orderId: order.id, kind: 'referral_reward', email: referral.email, amount: REFERRAL_AMOUNT, days: VOUCHER_VALID_DAYS,
  }, { now, random })
  return { voucher, email: referral.email }
}

// Vérifie un code saisi au paiement. Renvoie { ok, voucher } ou { ok:false, error }.
// voucher = { code, kind: 'voucher'|'referral', percent?, amount?, minSubtotal?, expiresAt? }
export async function findUsableVoucher(client, code, email, { now = new Date() } = {}) {
  const normalized = normalizeVoucherCode(code)
  const customer = normalizeEmail(email)

  if (isReferralCode(normalized)) {
    const { data, error } = await client.from('referral_codes').select('code, email').eq('code', normalized).maybeSingle()
    if (error) throw error
    if (!data) return { ok: false, error: 'Code de parrainage invalide.' }
    if (normalizeEmail(data.email) === customer) {
      return { ok: false, error: 'Votre propre code de parrainage est réservé à vos proches.' }
    }
    const paid = await client.from('orders').select('id').eq('customer_email', customer).eq('payment_status', 'paid').limit(1)
    if (paid.error) throw paid.error
    if ((paid.data || []).length) {
      return { ok: false, error: 'Le parrainage est réservé à une première commande.' }
    }
    return {
      ok: true,
      voucher: { code: data.code, kind: 'referral', amount: REFERRAL_AMOUNT, minSubtotal: REFERRAL_MIN_SUBTOTAL },
    }
  }

  if (!isVoucherCode(normalized)) return { ok: false, error: 'Code de réduction invalide.' }
  const { data, error } = await client
    .from('vouchers')
    .select('code, email, percent, amount, expires_at, used_at')
    .eq('code', normalized)
    .maybeSingle()
  if (error) throw error
  // Même message pour un code inconnu ou appartenant à un autre client.
  if (!data || normalizeEmail(data.email) !== customer) {
    return { ok: false, error: 'Code de réduction invalide pour cette adresse e-mail.' }
  }
  if (data.used_at) return { ok: false, error: 'Ce code de réduction a déjà été utilisé.' }
  if (new Date(data.expires_at).getTime() <= now.getTime()) {
    return { ok: false, error: 'Ce code de réduction a expiré.' }
  }
  return {
    ok: true,
    voucher: {
      code: data.code,
      kind: 'voucher',
      ...(data.amount != null ? { amount: Number(data.amount) } : { percent: Number(data.percent) }),
      expiresAt: data.expires_at,
    },
  }
}

// Consomme le bon utilisé par une commande payée (idempotent).
export async function consumeOrderVoucher(order, client, { now = new Date() } = {}) {
  const promo = order?.promo
  if (!client || promo?.kind !== 'voucher' || !isVoucherCode(promo.code)) return false
  const { error } = await client
    .from('vouchers')
    .update({ used_at: now.toISOString(), used_order_id: order.id })
    .eq('code', normalizeVoucherCode(promo.code))
    .is('used_at', null)
  if (error) throw error
  return true
}

const formatExpiry = (iso) => new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
}).format(new Date(iso))

const valueLabel = (voucher) => (voucher?.amount != null
  ? `${Number(voucher.amount)} € de réduction`
  : `${Number(voucher?.percent) || VOUCHER_PERCENT} % de réduction`)

const codeBox = (intro, code, details) => `
    <div style="margin:18px 0 4px;border:1px dashed #35FF8A66;border-radius:12px;padding:16px;text-align:center;background:#0f2119">
      <p style="margin:0 0 6px;font-size:13px;color:#cfcfcf">${intro}</p>
      <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:2px;color:#35FF8A">${escapeHtml(code)}</p>
      <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#9aa0a6">${details}</p>
    </div>`

export function voucherEmailHtml(voucher) {
  if (!voucher?.code) return ''
  return codeBox(
    'Pour votre prochaine commande sur theklope.com',
    voucher.code,
    `${valueLabel(voucher)}, valable une fois jusqu’au ${escapeHtml(formatExpiry(voucher.expires_at))},
        avec cette adresse e-mail. S’applique aux articles qui n’ont pas déjà le tarif quantité.`,
  )
}

// Bloc « fidélité + parrainage » de l'e-mail de confirmation.
export function loyaltyEmailHtml({ loyalty, referralCode } = {}) {
  const parts = []
  if (loyalty?.voucher?.code) {
    parts.push(codeBox(
      `Carte fidélité : ${LOYALTY_POINTS_PER_VOUCHER} points atteints !`,
      loyalty.voucher.code,
      `${valueLabel(loyalty.voucher)} valable une fois jusqu’au ${escapeHtml(formatExpiry(loyalty.voucher.expires_at))}, avec cette adresse e-mail.`,
    ))
  }
  if (loyalty && Number.isFinite(loyalty.balance)) {
    const missing = LOYALTY_POINTS_PER_VOUCHER - (loyalty.balance % LOYALTY_POINTS_PER_VOUCHER)
    parts.push(`<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#cfcfcf">
      <strong style="color:#fff">Carte fidélité :</strong> ${loyalty.balance} point${loyalty.balance > 1 ? 's' : ''}
      (1 € = 1 point). Encore ${missing} point${missing > 1 ? 's' : ''} pour un bon de ${LOYALTY_VOUCHER_AMOUNT} €.</p>`)
  }
  if (referralCode) {
    parts.push(`<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#cfcfcf">
      <strong style="color:#fff">Parrainage :</strong> donnez le code <strong style="color:#35FF8A;letter-spacing:1px">${escapeHtml(referralCode)}</strong>
      à un proche majeur. Il a ${REFERRAL_AMOUNT} € de réduction sur sa première commande (dès ${REFERRAL_MIN_SUBTOTAL} €),
      et vous recevez un bon de ${REFERRAL_AMOUNT} € dès qu’elle est payée.</p>`)
  }
  return parts.join('')
}

export function referralRewardEmailHtml(voucher) {
  return emailLayout({
    title: 'Merci pour votre parrainage !',
    bodyHtml: `<p style="font-size:14px;line-height:1.7;color:#cfcfcf;margin:0">
      Un proche vient de passer sa première commande avec votre code de parrainage. Voici votre bon :</p>
      ${codeBox('Votre récompense parrainage', voucher.code,
        `${valueLabel(voucher)}, valable une fois jusqu’au ${escapeHtml(formatExpiry(voucher.expires_at))}, avec cette adresse e-mail.`)}`,
  })
}

export const voucherPreviewHtml = (voucher) => emailLayout({ title: 'Votre code', bodyHtml: voucherEmailHtml(voucher) })
