// =============================================================================
// POST /api/create-payment
// -----------------------------------------------------------------------------
// SÉCURITÉ : le montant n'est JAMAIS reçu du client. On reçoit seulement les
// identifiants produits + quantités, on relit les prix côté serveur (Supabase
// ou catalogue statique) et on recalcule le total avec la tarification partagée.
// On crée un paiement Mollie (checkout hébergé) + une commande « en attente »
// que le webhook Mollie confirmera. Renvoie l'URL de checkout pour la redirection.
// =============================================================================
import { randomBytes } from 'node:crypto'
import { computeTotals } from '../src/lib/pricing.js'
import { getProductsByIds } from './_lib/catalog.js'
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import {
  mollie,
  hasMollie,
  mollieConfigurationError,
  baseUrlFromRequest,
} from './_lib/mollie.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits, getClientIp } from './_lib/rateLimit.js'
import {
  buildCheckoutIdempotencyHash,
  buildMolliePaymentRequest,
  checkoutPayloadHash,
  findMolliePaymentsForOrder,
  hasUnexpectedMolliePaymentExposure,
  molliePaymentHasChargeback,
  normalizeAcquisition,
  readCheckoutIdempotencyKey,
} from './_lib/checkout.js'
import {
  MAX_CART_LINES,
  normalizeVariant,
  normalizeVariantIntent,
  parseQuantity,
  validateFulfillment,
} from './_lib/orderValidation.js'

// Identifiant lisible (TK-XXXXXX) + suffixe aléatoire pour empêcher l'énumération
// de l'endpoint public /api/payment-status.
const newOrderId = () => `TK-${randomBytes(8).toString('hex').toUpperCase()}`
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max)
const EXISTING_CHECKOUT_FIELDS = [
  'id',
  'created_at',
  'checkout_payload_hash',
  'checkout_url',
  'payment_id',
  'payment_create_status',
  'payment_create_started_at',
  'checkout_review_required_at',
  'checkout_review_reason',
  'status',
  'payment_status',
  'stock_reservation_status',
  'subtotal',
  'discount',
  'shipping_cost',
  'total',
].join(', ')

const money = (value, fallback = 0) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : fallback
}

export function checkoutSnapshot(source, fallback = {}) {
  return {
    orderId: source.orderId || source.id,
    createdAt: source.createdAt ?? source.created_at ?? null,
    checkoutUrl: source.checkoutUrl ?? source.checkout_url ?? null,
    paymentId: source.paymentId ?? source.payment_id ?? null,
    paymentCreateStatus: source.paymentCreateStatus ?? source.payment_create_status ?? 'creating',
    paymentCreateStartedAt: source.paymentCreateStartedAt
      ?? source.payment_create_started_at
      ?? null,
    checkoutReviewRequiredAt: source.checkoutReviewRequiredAt
      ?? source.checkout_review_required_at
      ?? null,
    checkoutReviewReason: source.checkoutReviewReason
      ?? source.checkout_review_reason
      ?? null,
    orderStatus: source.orderStatus ?? source.status ?? 'pending_payment',
    paymentStatus: source.paymentStatus ?? source.payment_status ?? 'unpaid',
    stockReservationStatus: source.stockReservationStatus
      ?? source.stock_reservation_status
      ?? 'reserved',
    subtotal: money(source.subtotal, money(fallback.subtotal)),
    discount: money(source.discount, money(fallback.discount)),
    shipping: money(source.shippingCost ?? source.shipping_cost, money(fallback.shipping)),
    total: money(source.total, money(fallback.total)),
    created: source.created !== false,
  }
}

export function canSafelyCreateMolliePayment(snapshot, now = Date.now()) {
  if (snapshot.checkoutReviewRequiredAt || snapshot.checkoutReviewReason) return false
  if (snapshot.created !== false) return true
  const startedAt = Date.parse(snapshot.paymentCreateStartedAt || snapshot.createdAt || '')
  return Number.isFinite(startedAt) && now - startedAt < 50 * 60 * 1000
}

export const paymentRecoveryRequiresReview = (payments) => (
  hasUnexpectedMolliePaymentExposure(payments)
)

function checkoutResult(snapshot, checkoutUrl) {
  return {
    checkoutUrl,
    orderId: snapshot.orderId,
    breakdown: {
      subtotal: snapshot.subtotal,
      discount: snapshot.discount,
      shipping: snapshot.shipping,
      total: snapshot.total,
    },
  }
}

const isPayableSnapshot = (snapshot) => (
  snapshot.orderStatus === 'pending_payment'
  && snapshot.paymentStatus === 'unpaid'
  && snapshot.stockReservationStatus === 'reserved'
)

async function materializeCheckout(snapshot, { baseUrl, checkoutHash }) {
  if (!snapshot.orderId || snapshot.total <= 0) {
    throw new Error('Snapshot de commande invalide.')
  }
  const returnUrl = `${baseUrl}/checkout/retour?order=${snapshot.orderId}`

  // A terminal order must never mint a new payable Mollie checkout. Sending
  // the browser to the return page exposes the durable final state instead.
  if (!isPayableSnapshot(snapshot)) {
    return checkoutResult(snapshot, returnUrl)
  }
  // Once an ambiguous creation has crossed Mollie's short idempotency safety
  // window, only an explicit admin reconciliation may unblock it. In
  // particular, never refresh the first-start timestamp on later replays.
  if (snapshot.checkoutReviewRequiredAt || snapshot.checkoutReviewReason) {
    return checkoutResult(snapshot, returnUrl)
  }
  if (snapshot.checkoutUrl) {
    return checkoutResult(snapshot, snapshot.checkoutUrl)
  }

  let payment
  if (snapshot.paymentId) {
    payment = await mollie.payments.get(snapshot.paymentId)
  } else {
    // Advertise the active creation before contacting Mollie. Admin
    // cancellation treats this short lease conservatively, while Mollie's
    // deterministic idempotency key protects concurrent replays.
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from('orders')
      .update({ payment_create_status: 'creating' })
      .eq('id', snapshot.orderId)
      .is('payment_id', null)
      .is('checkout_review_required_at', null)
      .is('checkout_review_reason', null)
      .eq('status', 'pending_payment')
      .eq('payment_status', 'unpaid')
      .eq('stock_reservation_status', 'reserved')
      .select('id')
      .maybeSingle()
    if (claimError) throw claimError
    if (!claimed) return checkoutResult(snapshot, returnUrl)

    if (snapshot.created === false) {
      const recentPayments = await mollie.payments.page({ limit: 250 })
      const recoveredPayments = findMolliePaymentsForOrder(recentPayments, {
        id: snapshot.orderId,
        total: snapshot.total,
      })
      if (recoveredPayments.some(molliePaymentHasChargeback)) {
        const { error: reviewError } = await supabaseAdmin
          .from('orders')
          .update({
            checkout_review_required_at: new Date().toISOString(),
            checkout_review_reason: 'payment_chargeback_detected',
          })
          .eq('id', snapshot.orderId)
        if (reviewError) throw reviewError
        return checkoutResult(snapshot, returnUrl)
      }
      if (paymentRecoveryRequiresReview(recoveredPayments)) {
        // Never choose one ledger entry when more than one payment can settle.
        // Linking, cancellation and refunds remain frozen until an operator
        // reconciles every Mollie payment ID explicitly.
        const { error: reviewError } = await supabaseAdmin
          .from('orders')
          .update({
            checkout_review_required_at: new Date().toISOString(),
            checkout_review_reason: 'multiple_payments_for_order',
          })
          .eq('id', snapshot.orderId)
          .or('checkout_review_reason.is.null,checkout_review_reason.neq.payment_chargeback_detected')
        if (reviewError) throw reviewError
        return checkoutResult(snapshot, returnUrl)
      }
      payment = recoveredPayments[0]
      if (!payment && !canSafelyCreateMolliePayment(snapshot)) {
        const { error: reviewError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_create_status: 'failed',
            checkout_review_required_at: new Date().toISOString(),
            checkout_review_reason: 'payment_not_recoverable_safely',
          })
          .eq('id', snapshot.orderId)
          .is('payment_id', null)
          .or('checkout_review_reason.is.null,checkout_review_reason.not.in.(multiple_payments_for_order,payment_chargeback_detected)')
        if (reviewError) throw reviewError
        return checkoutResult(snapshot, returnUrl)
      }
    }
    if (!payment) {
      payment = await mollie.payments.create(buildMolliePaymentRequest({
        orderId: snapshot.orderId,
        total: snapshot.total,
        baseUrl,
        checkoutHash,
      }))
    }
  }

  const checkoutUrl = typeof payment.getCheckoutUrl === 'function'
    ? payment.getCheckoutUrl()
    : payment._links?.checkout?.href
  const safeCheckoutUrl = checkoutUrl || returnUrl

  if (!snapshot.paymentId) {
    const { data: linked, error: paymentError } = await supabaseAdmin.rpc('link_order_payment', {
      p_order_id: snapshot.orderId,
      p_payment_id: payment.id,
      p_checkout_url: safeCheckoutUrl,
      p_expires_at: payment.expiresAt || null,
    })
    if (paymentError) throw paymentError
    if (!linked?.ok) {
      // A cancellation may have won after the external payment was created.
      // Never expose that checkout URL; best-effort cancellation is safe for
      // an open Mollie payment and late paid webhooks are refunded separately.
      if (payment.isCancelable) {
        try {
          await mollie.payments.cancel(payment.id, { idempotencyKey: `tk-cancel-${snapshot.orderId}` })
        } catch (cancelError) {
          console.error('orphan checkout cancellation error:', cancelError)
        }
      }
      return checkoutResult(snapshot, returnUrl)
    }
  }

  return checkoutResult(snapshot, safeCheckoutUrl)
}

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  if (!hasMollie) {
    return res.status(500).json({ error: `Paiement non configuré côté serveur (${mollieConfigurationError})` })
  }
  if (!hasSupabaseAdmin) {
    return res.status(500).json({ error: 'Base de données non configurée (SUPABASE_SERVICE_ROLE_KEY manquante).' })
  }

  let createdOrderId = null
  try {
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide.' })
    }
    const {
      items,
      shippingMethodId,
      promoCode,
      customer = {},
      address = {},
      acquisition,
      ageConfirmed,
    } = body

    if (ageConfirmed !== true) {
      return res.status(400).json({ error: 'La confirmation de majorité (+18 ans) est obligatoire.' })
    }

    const requestIdempotency = readCheckoutIdempotencyKey(req)
    if (!requestIdempotency.ok) {
      return res.status(400).json({ error: requestIdempotency.error })
    }
    const normalizedAcquisition = normalizeAcquisition(acquisition)
    if (!normalizedAcquisition.ok) {
      return res.status(400).json({ error: normalizedAcquisition.error })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide ou invalide.' })
    }
    if (items.length > MAX_CART_LINES) {
      return res.status(400).json({ error: 'Le panier contient trop de lignes.' })
    }

    if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
      return res.status(400).json({ error: 'Coordonnées client invalides.' })
    }
    const normalizedCustomer = {
      name: clean(customer.name, 160),
      email: clean(customer.email, 180).toLowerCase(),
      phone: clean(customer.phone, 40),
    }
    if (!normalizedCustomer.name || !EMAIL_RE.test(normalizedCustomer.email)) {
      return res.status(400).json({ error: 'Coordonnées client invalides.' })
    }

    const fulfillment = validateFulfillment(shippingMethodId, address)
    if (!fulfillment.ok) {
      return res.status(400).json({ error: fulfillment.error })
    }
    const normalizedAddress = fulfillment.address

    // Canonicalize the immutable client intent before touching the live
    // catalog. A replay remains valid if stock, product copy, options, prices
    // or promotion rules changed after the original order was reserved.
    const ids = []
    const intentLines = []
    for (const item of items) {
      const id = typeof item?.id === 'string' ? item.id.trim() : ''
      if (!/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,158}[A-Za-z0-9])?$/.test(id)) {
        return res.status(400).json({ error: 'Identifiant produit invalide.' })
      }
      const qty = parseQuantity(item?.qty)
      if (!qty) return res.status(400).json({ error: `Quantité invalide pour ${id}.` })
      const variantIntent = normalizeVariantIntent(item?.variant)
      if (!variantIntent.ok) return res.status(400).json({ error: variantIntent.error })
      ids.push(id)
      intentLines.push({ productId: id, qty, variant: variantIntent.variant })
    }
    intentLines.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))

    const normalizedPromo = String(promoCode || '').trim().toUpperCase()
    const payloadHash = checkoutPayloadHash({
      version: 2,
      ageConfirmed: true,
      customer: normalizedCustomer,
      address: normalizedAddress,
      shippingMethodId,
      promoCode: normalizedPromo,
      lines: intentLines,
    })
    const idempotencySecret = process.env.CHECKOUT_IDEMPOTENCY_SECRET
      || process.env.RATE_LIMIT_SECRET
      || process.env.SUPABASE_SERVICE_ROLE_KEY
    const checkoutHash = buildCheckoutIdempotencyHash({
      requestKey: requestIdempotency.value,
      payloadHash,
      clientIp: getClientIp(req),
      secret: idempotencySecret,
    })
    const baseUrl = baseUrlFromRequest(req)

    // Replays use only the persisted financial snapshot. This branch runs
    // before catalog reads and stock checks by design.
    const { data: existingAttempt, error: attemptError } = await supabaseAdmin
      .from('orders')
      .select(EXISTING_CHECKOUT_FIELDS)
      .eq('checkout_idempotency_key', checkoutHash)
      .maybeSingle()
    if (attemptError) throw attemptError
    if (existingAttempt) {
      if (existingAttempt.checkout_payload_hash !== payloadHash) {
        return res.status(409).json({
          error: 'Cette tentative de paiement ne correspond plus au panier. Relancez le paiement.',
        })
      }
      createdOrderId = existingAttempt.id
      const result = await materializeCheckout(checkoutSnapshot({
        ...existingAttempt,
        created: false,
      }), { baseUrl, checkoutHash })
      return res.status(200).json(result)
    }

    // New attempts consume both durable limits; a known durable replay above
    // remains recoverable even after the generic IP/e-mail limit is reached.
    {
      const rateLimit = await enforceRequestRateLimits(req, [
        { scope: 'create_payment_ip', limit: 20, windowSeconds: 900 },
        { scope: 'create_payment_email', value: normalizedCustomer.email, limit: 8, windowSeconds: 900 },
      ])
      if (!rateLimit.allowed) {
        res.setHeader('Retry-After', String(rateLimit.retryAfter))
        return res.status(429).json({ error: 'Trop de tentatives de paiement. Réessayez dans quelques minutes.' })
      }
    }

    // 1. Relire les prix côté serveur (jamais ceux du client)
    const productMap = await getProductsByIds(ids)

    const lines = []
    for (const [index, it] of items.entries()) {
      const product = productMap.get(ids[index])
      if (!product) return res.status(400).json({ error: `Produit introuvable : ${ids[index]}` })
      const qty = parseQuantity(it?.qty)
      if (!qty) return res.status(400).json({ error: `Quantité invalide pour ${product.name}.` })
      const normalizedVariant = normalizeVariant(product, it?.variant)
      if (!normalizedVariant.ok) return res.status(400).json({ error: normalizedVariant.error })

      lines.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: Number(product.price) || 0,
        qty,
        brand: product.brand,
        volume: product.volume,
        category: product.category,
        expectedBrand: product.brand,
        expectedCategory: product.category,
        expectedVolume: product.catalogVolume ?? null,
        expectedSpecs: product.specs || {},
        expectedNicotine: product.nicotine || [],
        expectedFlavors: product.flavors || [],
        expectedColors: product.colors || [],
        expectedOhmOptions: product.ohmOptions || [],
        variant: normalizedVariant.variant,
        lineTotal: Math.round((Number(product.price) || 0) * qty * 100) / 100,
      })
    }

    // 2. Recalculer les totaux de façon déterministe. BIENVENUE est réservé
    // plus bas dans la même transaction SQL que le stock et la commande.
    const totals = computeTotals({
      lines: lines.map((l) => ({ price: l.price, qty: l.qty, brand: l.brand, volume: l.volume, category: l.category })),
      shippingMethodId,
      promoCode,
    })
    if (normalizedPromo && !totals.promo) {
      const error = normalizedPromo === 'PACK15'
        ? 'Le code PACK15 nécessite un appareil, un accessoire et un e-liquide.'
        : 'Code promo invalide.'
      return res.status(400).json({ error })
    }
    if (totals.total <= 0) return res.status(400).json({ error: 'Montant de commande invalide.' })

    const requestedOrderId = newOrderId()

    // 3. Une seule transaction crée la commande, réserve le code première
    // commande et décrémente le stock. Un replay récupère la commande existante.
    const { data: checkout, error: checkoutError } = await supabaseAdmin.rpc('create_checkout_order', {
      p_order_id: requestedOrderId,
      p_idempotency_key: checkoutHash,
      p_payload_hash: payloadHash,
      p_customer: normalizedCustomer,
      p_address: normalizedAddress,
      p_shipping: totals.shippingMethod || {},
      p_subtotal: totals.subtotal,
      p_discount: totals.discount,
      p_shipping_cost: totals.shipping,
      p_total: totals.total,
      p_promo: totals.promo,
      p_acquisition: normalizedAcquisition.value,
      p_items: lines.map((line) => ({
        product_id: line.productId,
        name: line.name,
        image: line.image,
        price: line.price,
        qty: line.qty,
        variant: line.variant,
        line_total: line.lineTotal,
        expected_brand: line.expectedBrand,
        expected_category: line.expectedCategory,
        expected_volume: line.expectedVolume,
        expected_specs: line.expectedSpecs,
        expected_nicotine: line.expectedNicotine,
        expected_flavors: line.expectedFlavors,
        expected_colors: line.expectedColors,
        expected_ohm_options: line.expectedOhmOptions,
      })),
    })
    if (checkoutError) throw checkoutError
    if (!checkout?.ok) {
      if (checkout?.status === 'welcome_unavailable') {
        return res.status(400).json({ error: 'Le code BIENVENUE est réservé à la première commande.' })
      }
      if (checkout?.status === 'insufficient_stock') {
        return res.status(409).json({ error: 'Le stock vient de changer. Vérifiez votre panier puis réessayez.' })
      }
      if (checkout?.status === 'catalog_changed') {
        return res.status(409).json({ error: 'Le prix ou les options d’un produit viennent de changer. Vérifiez votre panier puis réessayez.' })
      }
      if (checkout?.status === 'idempotency_conflict') {
        return res.status(409).json({ error: 'Cette tentative de paiement ne correspond plus au panier. Relancez le paiement.' })
      }
      throw new Error(`Création de commande refusée (${checkout?.status || 'unknown'}).`)
    }

    const orderId = checkout.orderId
    createdOrderId = orderId
    const result = await materializeCheckout(checkoutSnapshot(checkout, totals), {
      baseUrl,
      checkoutHash,
    })
    return res.status(200).json(result)
  } catch (err) {
    if (createdOrderId) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ payment_create_status: 'failed' })
          .eq('id', createdOrderId)
      } catch {
        // Preserve the primary payment error. Stock remains reserved because a
        // network failure can be ambiguous; retrying the same key is safe and
        // an admin can explicitly cancel the order to release it.
      }
    }
    console.error('create-payment error:', err)
    return res.status(500).json({ error: err.message || 'Erreur serveur paiement.' })
  }
}
