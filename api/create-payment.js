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
import { mollie, hasMollie, baseUrlFromRequest } from './_lib/mollie.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'
import {
  MAX_CART_LINES,
  aggregateQuantities,
  normalizeVariant,
  parseQuantity,
  validateFulfillment,
} from './_lib/orderValidation.js'

// Identifiant lisible (TK-XXXXXX) + suffixe aléatoire pour empêcher l'énumération
// de l'endpoint public /api/payment-status.
const newOrderId = () => `TK-${randomBytes(8).toString('hex').toUpperCase()}`
const toMollieAmount = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max)

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  if (!hasMollie) {
    return res.status(500).json({ error: 'Paiement non configuré côté serveur (MOLLIE_API_KEY manquante).' })
  }
  if (!hasSupabaseAdmin) {
    return res.status(500).json({ error: 'Base de données non configurée (SUPABASE_SERVICE_ROLE_KEY manquante).' })
  }

  let createdOrderId = null
  let paymentCreated = false

  try {
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide.' })
    }
    const { items, shippingMethodId, promoCode, customer = {}, address = {} } = body

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

    const rateLimit = await enforceRequestRateLimits(req, [
      { scope: 'create_payment_ip', limit: 20, windowSeconds: 900 },
      { scope: 'create_payment_email', value: normalizedCustomer.email, limit: 8, windowSeconds: 900 },
    ])
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter))
      return res.status(429).json({ error: 'Trop de tentatives de paiement. Réessayez dans quelques minutes.' })
    }

    // 1. Relire les prix côté serveur (jamais ceux du client)
    const ids = []
    for (const item of items) {
      const id = typeof item?.id === 'string' ? item.id.trim() : ''
      if (!/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,158}[A-Za-z0-9])?$/.test(id)) {
        return res.status(400).json({ error: 'Identifiant produit invalide.' })
      }
      ids.push(id)
    }
    const productMap = await getProductsByIds(ids)

    const lines = []
    for (const [index, it] of items.entries()) {
      const product = productMap.get(ids[index])
      if (!product) return res.status(400).json({ error: `Produit introuvable : ${ids[index]}` })
      const qty = parseQuantity(it?.qty)
      if (!qty) return res.status(400).json({ error: `Quantité invalide pour ${product.name}.` })
      if (Number.isFinite(product.stock) && product.stock <= 0) {
        return res.status(409).json({ error: `Produit en rupture : ${product.name}` })
      }

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
        variant: normalizedVariant.variant,
        lineTotal: Math.round((Number(product.price) || 0) * qty * 100) / 100,
      })
    }

    // Un meme produit peut apparaitre sur plusieurs lignes de variantes. Le
    // stock doit etre controle sur la somme, pas ligne par ligne.
    for (const [productId, requested] of aggregateQuantities(lines)) {
      const product = productMap.get(productId)
      if (Number.isFinite(product?.stock) && requested > product.stock) {
        return res.status(409).json({
          error: `Stock insuffisant pour ${product.name}. Quantité disponible : ${product.stock}.`,
        })
      }
    }

    // 1bis. Le code BIENVENUE est réservé à la première commande : on vérifie
    // qu'aucune commande payée n'existe déjà pour cet e-mail.
    const email = normalizedCustomer.email
    const normalizedPromo = String(promoCode || '').trim().toUpperCase()
    if (normalizedPromo === 'BIENVENUE' && email) {
      const { data: prior, error: priorErr } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_status', 'paid')
        .eq('customer->>email', email)
        .limit(1)
      if (priorErr) throw priorErr
      if (prior && prior.length) {
        return res.status(400).json({ error: 'Le code BIENVENUE est réservé à la première commande.' })
      }
    }

    // 2. Recalculer les totaux de façon déterministe
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

    const orderId = newOrderId()
    const baseUrl = baseUrlFromRequest(req)

    // 3. Enregistrer la commande « en attente » avant Mollie. Si Mollie échoue,
    // aucune commande payée ne sera créée et le paiement ne sera pas orphelin.
    const { error: orderErr } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      status: 'pending_payment',
      payment_status: 'unpaid',
      payment_id: null,
      customer: normalizedCustomer,
      address: normalizedAddress,
      shipping: totals.shippingMethod || {},
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping_cost: totals.shipping,
      total: totals.total,
      promo: totals.promo,
    })
    if (orderErr) throw orderErr
    createdOrderId = orderId

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(
      lines.map((l) => ({
        order_id: orderId,
        product_id: l.productId,
        name: l.name,
        image: l.image,
        price: l.price,
        qty: l.qty,
        variant: l.variant,
        line_total: l.lineTotal,
      })),
    )
    if (itemsErr) throw itemsErr

    // 4. Créer le paiement Mollie (checkout hébergé)
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: toMollieAmount(totals.total) },
      description: `THEKLOPE ${orderId}`,
      redirectUrl: `${baseUrl}/checkout/retour?order=${orderId}`,
      webhookUrl: `${baseUrl}/api/mollie-webhook`,
      metadata: { orderId },
    })
    paymentCreated = true

    const { error: paymentErr } = await supabaseAdmin
      .from('orders')
      .update({ payment_id: payment.id })
      .eq('id', orderId)
    if (paymentErr) {
      // Le webhook pourra rattacher le paiement via metadata.orderId. On ne
      // bloque pas le client si Mollie a bien créé le checkout.
      console.error('create-payment payment_id update error:', paymentErr)
    }

    const checkoutUrl = typeof payment.getCheckoutUrl === 'function'
      ? payment.getCheckoutUrl()
      : payment._links?.checkout?.href
    if (!checkoutUrl) throw new Error('URL de paiement Mollie indisponible.')

    return res.status(200).json({
      checkoutUrl,
      orderId,
      breakdown: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
      },
    })
  } catch (err) {
    if (createdOrderId && !paymentCreated) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', createdOrderId)
      } catch {
        // La réponse d'erreur principale reste celle du paiement.
      }
    }
    console.error('create-payment error:', err)
    return res.status(500).json({ error: err.message || 'Erreur serveur paiement.' })
  }
}
