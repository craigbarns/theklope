import { authenticateAdminRequest } from '../_lib/adminAuth.js'
import { hasSupabaseAdmin, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { configureSameOriginCors, setNoStore } from '../_lib/httpSecurity.js'
import {
  createMondialRelayLabel,
  getMondialRelayConfig,
  MondialRelayError,
  normalizeRelayId,
} from '../_lib/mondialRelay.js'

const LABEL_STATUSES = new Set(['processing'])

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  const adminAuth = await authenticateAdminRequest(req)
  if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })

  try {
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide.' })
    }
    const orderId = String(body.orderId || '').trim()
    const weightGrams = Math.round(Number(body.weightGrams))
    const deliveryMode = String(body.deliveryMode || '24R').trim().toUpperCase()
    const relayId = normalizeRelayId(body.relayId)
    if (!orderId) return res.status(400).json({ error: 'orderId manquant.' })

    const config = getMondialRelayConfig()
    if (!config.api2.configured) {
      return res.status(503).json({
        error: 'Générez puis configurez les identifiants Mondial Relay API 2 pour créer une étiquette.',
        code: 'api2_not_configured',
      })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, checkout_review_required_at, checkout_review_reason, customer, address, shipping')
      .eq('id', orderId)
      .maybeSingle()
    if (orderError) throw orderError
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })
    if (order.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Seule une commande payée peut recevoir une étiquette.' })
    }
    if (order.checkout_review_required_at || order.checkout_review_reason) {
      return res.status(409).json({ error: 'Cette commande exige une vérification Mollie avant expédition.' })
    }
    if (order.shipping?.id === 'pickup') {
      return res.status(409).json({ error: 'Le retrait boutique ne nécessite pas d’étiquette.' })
    }
    const previous = order.shipping?.mondialRelay || {}
    if (previous.shipmentNumber && previous.labelUrl) {
      return res.status(200).json({
        ok: true,
        reused: true,
        shipmentNumber: previous.shipmentNumber,
        labelUrl: previous.labelUrl,
        shipping: order.shipping,
      })
    }
    if (!LABEL_STATUSES.has(order.status)) {
      return res.status(409).json({
        error: `L’étiquette doit être créée pendant la préparation, pas depuis le statut ${order.status}.`,
      })
    }

    const label = await createMondialRelayLabel({
      orderId: order.id,
      weightGrams,
      deliveryMode,
      relayId,
      customer: order.customer || {},
      address: order.address || {},
      instructions: order.address?.deliveryInstructions || '',
    }, { config })

    const createdAt = new Date().toISOString()
    const shipping = {
      ...(order.shipping || {}),
      tracking: label.shipmentNumber,
      carrier: 'Mondial Relay',
      mondialRelay: {
        shipmentNumber: label.shipmentNumber,
        labelUrl: label.labelUrl,
        barcode: label.barcode,
        weightGrams,
        deliveryMode,
        relayId: deliveryMode === '24R' ? relayId : '',
        environment: label.environment,
        warnings: label.statuses.filter((status) => /warning/i.test(status.level)),
        createdAt,
      },
    }
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ shipping })
      .eq('id', order.id)
      .eq('status', order.status)
      .eq('payment_status', 'paid')
      .is('checkout_review_required_at', null)
      .is('checkout_review_reason', null)
      .select('id')
      .maybeSingle()
    if (updateError) throw updateError
    if (!updated) {
      return res.status(409).json({
        error: 'Étiquette créée, mais la commande a changé entre-temps. Conservez le numéro affiché et rechargez l’admin.',
        recoveryRequired: true,
        shipmentNumber: label.shipmentNumber,
        labelUrl: label.labelUrl,
      })
    }

    return res.status(200).json({
      ok: true,
      shipmentNumber: label.shipmentNumber,
      labelUrl: label.labelUrl,
      shipping,
    })
  } catch (error) {
    if (error instanceof MondialRelayError) {
      const status = error.code === 'api2_not_configured' ? 503 : error.retryable ? 502 : 400
      return res.status(status).json({
        error: error.message,
        code: error.code,
        ...(error.statuses?.length ? { statuses: error.statuses } : {}),
      })
    }
    console.error('mondial relay label error:', error)
    return res.status(500).json({ error: 'Création de l’étiquette Mondial Relay impossible.' })
  }
}
