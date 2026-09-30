// =============================================================================
// Bons de réduction « prochaine commande » — décision du gérant (2026-09-30),
// prise en connaissance du risque juridique signalé (art. L3513-4 CSP).
// -----------------------------------------------------------------------------
// - Chaque commande payée génère UN bon (idempotent : clé source_order_id).
// - Le bon est nominatif : utilisable uniquement avec l'e-mail du client.
// - 5 % sur la commande suivante, une seule fois, valable 60 jours.
// - Comme tout code, il ne se cumule pas avec le tarif quantité : le panier
//   applique la remise la plus avantageuse (voir computeTotals).
// - Le bon est consommé quand la commande qui l'utilise est payée.
// =============================================================================
import { randomInt } from 'node:crypto'
import { emailLayout, escapeHtml } from './email.js'

export const VOUCHER_PERCENT = 5
export const VOUCHER_VALID_DAYS = 60
export const VOUCHER_PREFIX = 'MERCI-'
// Sans 0/O ni 1/I/L : le code se recopie sans ambiguïté.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_RE = /^MERCI-[A-HJ-KM-NP-Z2-9]{6}$/
const DAY_MS = 24 * 60 * 60 * 1000

export const normalizeVoucherCode = (code) => String(code || '').trim().toUpperCase().replace(/\s+/g, '')
export const isVoucherCode = (code) => CODE_RE.test(normalizeVoucherCode(code))
const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export function generateVoucherCode(random = randomInt) {
  let suffix = ''
  for (let index = 0; index < 6; index += 1) suffix += ALPHABET[random(ALPHABET.length)]
  return `${VOUCHER_PREFIX}${suffix}`
}

const isUniqueViolation = (error, needle = '') => error?.code === '23505'
  && (!needle || `${error?.message || ''} ${error?.details || ''}`.includes(needle))

// Crée (ou relit) le bon généré par une commande payée.
export async function ensureOrderVoucher(order, client, { now = new Date(), random = randomInt } = {}) {
  const email = normalizeEmail(order?.customer_email || order?.customer?.email)
  if (!client || !order?.id || !email) return null

  const existing = await client.from('vouchers').select('code, percent, expires_at').eq('source_order_id', order.id).maybeSingle()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const row = {
      code: generateVoucherCode(random),
      email,
      percent: VOUCHER_PERCENT,
      source_order_id: order.id,
      expires_at: new Date(now.getTime() + VOUCHER_VALID_DAYS * DAY_MS).toISOString(),
    }
    const inserted = await client.from('vouchers').insert(row).select('code, percent, expires_at').single()
    if (!inserted.error) return inserted.data
    // Course avec une autre exécution pour la même commande : on relit son bon.
    if (isUniqueViolation(inserted.error, 'source_order_id')) {
      const again = await client.from('vouchers').select('code, percent, expires_at').eq('source_order_id', order.id).maybeSingle()
      if (again.error) throw again.error
      return again.data
    }
    if (!isUniqueViolation(inserted.error)) throw inserted.error
    // Collision de code (très improbable) : on en tire un autre.
  }
  throw new Error('Impossible de générer un code de réduction unique.')
}

// Vérifie un bon pour un client. Renvoie { ok, voucher } ou { ok:false, error }.
export async function findUsableVoucher(client, code, email, { now = new Date() } = {}) {
  const normalized = normalizeVoucherCode(code)
  if (!isVoucherCode(normalized)) return { ok: false, error: 'Code de réduction invalide.' }
  const { data, error } = await client
    .from('vouchers')
    .select('code, email, percent, expires_at, used_at')
    .eq('code', normalized)
    .maybeSingle()
  if (error) throw error
  // Même message pour un code inconnu ou appartenant à un autre client : on ne
  // révèle pas l'existence d'un code.
  if (!data || normalizeEmail(data.email) !== normalizeEmail(email)) {
    return { ok: false, error: 'Code de réduction invalide pour cette adresse e-mail.' }
  }
  if (data.used_at) return { ok: false, error: 'Ce code de réduction a déjà été utilisé.' }
  if (new Date(data.expires_at).getTime() <= now.getTime()) {
    return { ok: false, error: 'Ce code de réduction a expiré.' }
  }
  return { ok: true, voucher: { code: data.code, percent: Number(data.percent), expiresAt: data.expires_at } }
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

export function voucherEmailHtml(voucher) {
  if (!voucher?.code) return ''
  return `
    <div style="margin:22px 0 4px;border:1px dashed #35FF8A66;border-radius:12px;padding:16px;text-align:center;background:#0f2119">
      <p style="margin:0 0 6px;font-size:13px;color:#cfcfcf">Pour votre prochaine commande sur theklope.com</p>
      <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:2px;color:#35FF8A">${escapeHtml(voucher.code)}</p>
      <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#9aa0a6">
        ${Number(voucher.percent) || VOUCHER_PERCENT} % de réduction, valable une fois jusqu’au ${escapeHtml(formatExpiry(voucher.expires_at))},
        avec cette adresse e-mail. Non cumulable avec le tarif quantité : la remise la plus avantageuse s’applique.
      </p>
    </div>`
}

// Aperçu autonome (tests / prévisualisation).
export const voucherPreviewHtml = (voucher) => emailLayout({ title: 'Votre code', bodyHtml: voucherEmailHtml(voucher) })
