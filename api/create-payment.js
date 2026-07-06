// =============================================================================
// POST /api/create-payment
// -----------------------------------------------------------------------------
// SÉCURITÉ : le montant n'est JAMAIS reçu du client. On reçoit seulement les
// identifiants produits + quantités, on relit les prix côté serveur (Supabase
// ou catalogue statique) et on recalcule le total avec la tarification partagée.
// On crée un paiement Mollie (checkout hébergé) + une commande « en attente »
// que le webhook Mollie confirmera. Renvoie l'URL de checkout pour la redirection.
// =============================================================================
import { computeTotals } from '../src/lib/pricing.js'
import { getProductsByIds } from './_lib/catalog.js'
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { mollie, hasMollie, baseUrlFromRequest } from './_lib/mollie.js'

const newOrderId = () => 'TK-' + Math.floor(100000 + Math.random() * 899999)
const toMollieAmount = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  if (!hasMollie) {
    return res.status(500).json({ error: 'Paiement non configuré côté serveur (MOLLIE_API_KEY manquante).' })
  }
  if (!hasSupabaseAdmin) {
    return res.status(500).json({ error: 'Base de données non configurée (SUPABASE_SERVICE_ROLE_KEY manquante).' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const { items, shippingMethodId, promoCode, customer, address } = body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide ou invalide.' })
    }

    // 1. Relire les prix côté serveur (jamais ceux du client)
    const ids = items.map((it) => it?.id).filter(Boolean)
    const productMap = await getProductsByIds(ids)

    const lines = []
    for (const it of items) {
      const product = productMap.get(it?.id)
      if (!product) return res.status(400).json({ error: `Produit introuvable : ${it?.id}` })
      const qty = Math.max(1, Math.floor(Number(it?.qty) || 0))
      if (Number.isFinite(product.stock) && product.stock <= 0) {
        return res.status(409).json({ error: `Produit en rupture : ${product.name}` })
      }
      lines.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: Number(product.price) || 0,
        qty,
        variant: it?.variant || {},
        lineTotal: Math.round((Number(product.price) || 0) * qty * 100) / 100,
      })
    }

    // 2. Recalculer les totaux de façon déterministe
    const totals = computeTotals({
      lines: lines.map((l) => ({ price: l.price, qty: l.qty })),
      shippingMethodId,
      promoCode,
    })
    if (totals.total <= 0) return res.status(400).json({ error: 'Montant de commande invalide.' })

    const orderId = newOrderId()
    const baseUrl = baseUrlFromRequest(req)

    // 3. Créer le paiement Mollie (checkout hébergé)
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: toMollieAmount(totals.total) },
      description: `THEKLOPE ${orderId}`,
      redirectUrl: `${baseUrl}/checkout/retour?order=${orderId}`,
      webhookUrl: `${baseUrl}/api/mollie-webhook`,
      metadata: { orderId },
    })

    // 4. Enregistrer la commande « en attente » (le webhook la confirmera)
    const { error: orderErr } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      status: 'pending_payment',
      payment_status: 'unpaid',
      payment_id: payment.id,
      customer: customer || {},
      address: address || {},
      shipping: totals.shippingMethod || {},
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping_cost: totals.shipping,
      total: totals.total,
      promo: totals.promo,
    })
    if (orderErr) throw orderErr

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

    const checkoutUrl = typeof payment.getCheckoutUrl === 'function'
      ? payment.getCheckoutUrl()
      : payment._links?.checkout?.href

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
    console.error('create-payment error:', err)
    return res.status(500).json({ error: err.message || 'Erreur serveur paiement.' })
  }
}
