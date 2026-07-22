import { createHash, createHmac } from 'node:crypto'

const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9._:-]{16,128}$/
const ACQUISITION_TOUCH_LIMITS = Object.freeze({
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  utm_id: 200,
  utm_term: 200,
  utm_content: 200,
  gclid: 500,
  dclid: 500,
  gbraid: 500,
  wbraid: 500,
  fbclid: 500,
  msclkid: 500,
  landing_path: 1000,
  referrer: 1000,
})

const sha256 = (value) => createHash('sha256').update(String(value)).digest('hex')

function stableJsonValue(value) {
  if (Array.isArray(value)) return value.map(stableJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableJsonValue(value[key])]),
    )
  }
  return value
}

function normalizeIsoTimestamp(value, field) {
  if (value === undefined || value === null || value === '') return { ok: true, value: '' }
  if (typeof value !== 'string' || value.length > 50) {
    return { ok: false, error: `Horodatage d’acquisition invalide : ${field}.` }
  }
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return { ok: false, error: `Horodatage d’acquisition invalide : ${field}.` }
  }
  return { ok: true, value: date.toISOString() }
}

function normalizeAcquisitionTouch(input, field) {
  if (input === undefined || input === null) return { ok: true, value: {} }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: `Point de contact d’acquisition invalide : ${field}.` }
  }

  const value = {}
  for (const [key, maxLength] of Object.entries(ACQUISITION_TOUCH_LIMITS)) {
    const raw = input[key]
    if (raw === undefined || raw === null || raw === '') continue
    if (typeof raw !== 'string') {
      return { ok: false, error: `Champ d’acquisition invalide : ${field}.${key}.` }
    }
    const normalized = raw.replace(/\u0000/g, '').trim().slice(0, maxLength)
    if (normalized) value[key] = normalized
  }

  const capturedAt = normalizeIsoTimestamp(input.captured_at, `${field}.captured_at`)
  if (!capturedAt.ok) return capturedAt
  if (capturedAt.value) value.captured_at = capturedAt.value
  return { ok: true, value }
}

export function normalizeAcquisition(input) {
  if (input === undefined || input === null) return { ok: true, value: {} }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Données d’acquisition invalides.' }
  }

  // Compatibility with the brief flat camelCase contract used during rollout;
  // all persisted data is converted to the canonical nested/snake_case shape.
  let firstTouchInput = input.firstTouch
  let lastTouchInput = input.lastTouch
  if (!firstTouchInput && !lastTouchInput) {
    const legacyMap = {
      utmSource: 'utm_source',
      utmMedium: 'utm_medium',
      utmCampaign: 'utm_campaign',
      utmTerm: 'utm_term',
      utmContent: 'utm_content',
      gclid: 'gclid',
      fbclid: 'fbclid',
      landingPage: 'landing_path',
      referrer: 'referrer',
    }
    lastTouchInput = Object.fromEntries(
      Object.entries(legacyMap)
        .filter(([legacyKey]) => input[legacyKey] !== undefined)
        .map(([legacyKey, canonicalKey]) => [canonicalKey, input[legacyKey]]),
    )
  }

  const firstTouch = normalizeAcquisitionTouch(firstTouchInput, 'firstTouch')
  if (!firstTouch.ok) return firstTouch
  const lastTouch = normalizeAcquisitionTouch(lastTouchInput, 'lastTouch')
  if (!lastTouch.ok) return lastTouch
  const consentRecordedAt = normalizeIsoTimestamp(input.consentRecordedAt, 'consentRecordedAt')
  if (!consentRecordedAt.ok) return consentRecordedAt

  // Attribution is optional and is stored only with an explicit analytics
  // consent timestamp. Checkout itself must remain usable without consent.
  const hasTouch = Object.keys(firstTouch.value).length || Object.keys(lastTouch.value).length
  if (hasTouch && !consentRecordedAt.value) return { ok: true, value: {} }

  const value = {}
  if (Object.keys(firstTouch.value).length) value.firstTouch = firstTouch.value
  if (Object.keys(lastTouch.value).length) value.lastTouch = lastTouch.value
  if (consentRecordedAt.value) value.consentRecordedAt = consentRecordedAt.value
  return { ok: true, value }
}

export function checkoutPayloadHash(payload) {
  return sha256(JSON.stringify(stableJsonValue(payload)))
}

export function readCheckoutIdempotencyKey(req) {
  const raw = req?.headers?.['idempotency-key']
  if (Array.isArray(raw)) return { ok: false, error: 'Clé d’idempotence invalide.' }
  const value = String(raw || '').trim()
  if (!value) return { ok: true, value: '' }
  if (!IDEMPOTENCY_KEY_RE.test(value)) {
    return {
      ok: false,
      error: 'La clé d’idempotence doit contenir 16 à 128 caractères alphanumériques, point, tiret, deux-points ou underscore.',
    }
  }
  return { ok: true, value }
}

export function buildCheckoutIdempotencyHash({
  requestKey,
  payloadHash,
  clientIp = 'unknown',
  secret,
  now = Date.now(),
}) {
  if (requestKey) return sha256(`client:${requestKey}`)
  if (!secret) throw new Error('Secret serveur requis pour l’idempotence du paiement.')

  // Compatibility for older clients: identical submissions from one client in
  // the same ten-minute window reuse the same order. The explicit header is the
  // durable contract and does not expire.
  const bucket = Math.floor(Number(now) / 600_000)
  return createHmac('sha256', secret)
    .update(`fallback:${clientIp}:${payloadHash}:${bucket}`)
    .digest('hex')
}

export function molliePaymentIdempotencyKey(checkoutHash) {
  return `tk-payment-${checkoutHash}`
}

export function mollieRefundIdempotencyKey(orderId, attempt = 1) {
  return `tk-refund-${sha256(`${orderId}:${attempt}`).slice(0, 48)}`
}

export function mollieMetadataObject(metadata) {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata
  }
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

export function mollieOrderIdFromMetadata(metadata) {
  const parsed = mollieMetadataObject(metadata)
  return typeof parsed.orderId === 'string' ? parsed.orderId : ''
}

const molliePaymentRecoveryPriority = (payment) => {
  if (payment?.status === 'paid' && molliePaymentMaySettle(payment)) return 0
  if (['authorized', 'open', 'pending'].includes(payment?.status)) return 1
  if (payment?.status === 'paid') return 2
  return 3
}

export function molliePaymentMaySettle(payment) {
  if (!payment) return false
  const isPaid = (typeof payment.isPaid === 'function' && payment.isPaid())
    || payment.status === 'paid'
  if (isPaid) {
    const amountCents = payment.amount?.currency === 'EUR'
      ? Math.round(Number(payment.amount.value) * 100)
      : NaN
    const refundedCents = payment.amountRefunded == null
      ? 0
      : payment.amountRefunded.currency === 'EUR'
        ? Math.round(Number(payment.amountRefunded.value) * 100)
        : NaN
    const chargedBackCents = payment.amountChargedBack?.currency === 'EUR'
      ? Math.round(Number(payment.amountChargedBack.value) * 100)
      : 0
    const remainingCents = payment.amountRemaining?.currency === 'EUR'
      ? Math.round(Number(payment.amountRemaining.value) * 100)
      : NaN
    if (Number.isFinite(remainingCents) && remainingCents <= 0) return false
    if (Number.isFinite(amountCents)
      && Number.isFinite(refundedCents)
      && Number.isFinite(chargedBackCents)
      && refundedCents + chargedBackCents >= amountCents) return false
    return true
  }
  return ['authorized', 'open', 'pending'].includes(payment.status)
}

export function molliePaymentHasChargeback(payment) {
  return payment?.amountChargedBack?.currency === 'EUR'
    && Number.isFinite(Number(payment.amountChargedBack.value))
    && Math.round(Number(payment.amountChargedBack.value) * 100) > 0
}

export function hasMultipleSettleableMolliePayments(payments) {
  return hasUnexpectedMolliePaymentExposure(payments)
}

export function hasUnexpectedMolliePaymentExposure(payments, linkedPaymentId = null) {
  const exposed = [...(payments || [])].filter(molliePaymentMaySettle)
  if (linkedPaymentId) {
    return exposed.some(({ id }) => id !== linkedPaymentId)
  }
  return exposed.length > 1
}

export function findMolliePaymentsForOrder(payments, order) {
  const expectedCents = Math.round(Number(order?.total) * 100)
  if (!order?.id || !Number.isFinite(expectedCents)) return []
  return [...(payments || [])]
    .filter((candidate) => (
      mollieOrderIdFromMetadata(candidate?.metadata) === order.id
      && candidate?.amount?.currency === 'EUR'
      && Math.round(Number(candidate?.amount?.value) * 100) === expectedCents
    ))
    .sort((left, right) => molliePaymentRecoveryPriority(left) - molliePaymentRecoveryPriority(right))
}

export function findMolliePaymentForOrder(payments, order) {
  return findMolliePaymentsForOrder(payments, order)[0] || null
}

export function buildMolliePaymentRequest({ orderId, total, baseUrl, checkoutHash }) {
  const value = (Math.round(Number(total) * 100) / 100).toFixed(2)
  return {
    amount: { currency: 'EUR', value },
    description: `THEKLOPE ${orderId}`,
    redirectUrl: `${baseUrl}/checkout/retour?order=${orderId}`,
    cancelUrl: `${baseUrl}/checkout/retour?order=${orderId}`,
    webhookUrl: `${baseUrl}/api/mollie-webhook`,
    metadata: { orderId },
    idempotencyKey: molliePaymentIdempotencyKey(checkoutHash),
  }
}

export function buildMollieRefundRequest(order, reason = '', attempt = 1, amount = order.total) {
  return {
    paymentId: order.payment_id,
    amount: {
      currency: 'EUR',
      value: (Math.round(Number(amount) * 100) / 100).toFixed(2),
    },
    description: `Remboursement THEKLOPE ${order.id}`,
    metadata: {
      orderId: order.id,
      refundAttempt: Number(attempt) || 1,
    },
    idempotencyKey: mollieRefundIdempotencyKey(order.id, attempt),
  }
}

export const CHECKOUT_ORDER_ID_RE = /^TK-(?:[A-F0-9]{16}|\d{6}-[A-Z0-9]{5})$/
