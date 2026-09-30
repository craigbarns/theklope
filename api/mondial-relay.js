import { authenticateAdminRequest } from './_lib/adminAuth.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'
import {
  createMondialRelayLabel,
  diagnoseRelayPointSearch,
  getMondialRelayConfig,
  MondialRelayError,
  normalizeRelayId,
  publicMondialRelayStatus,
  searchRelayPoints,
  traceMondialRelayShipment,
} from './_lib/mondialRelay.js'
import {
  ColissimoError,
  createColissimoLabel,
  getColissimoConfig,
  publicColissimoStatus,
} from './_lib/colissimo.js'
import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'

const ACTION_METHODS = {
  status: 'GET',
  'relay-points': 'POST',
  'relay-points-debug': 'POST',
  tracking: 'POST',
  'create-label': 'POST',
  // Colissimo partage cette route d'expédition : le plan Vercel Hobby limite le
  // projet à 12 fonctions et elles sont toutes utilisées.
  'colissimo-label': 'POST',
}
// Bucket Supabase PRIVÉ : les étiquettes portent nom et adresse du client.
// Seul le service role y accède ; l'admin reçoit un lien signé d'une heure.
const LABEL_BUCKET = 'shipping-labels'
const SIGNED_URL_SECONDS = 3600
const LABEL_STATUSES = new Set(['processing'])

// La recherche de Points Relais est la seule action ouverte au public : le
// client doit pouvoir choisir son point relais au checkout, avant d'avoir la
// moindre commande. Elle ne lit que l'annuaire Mondial Relay — aucune donnée
// THEKLOPE — et reste limitée en débit. Tout le reste (étiquettes, suivi,
// statut) demeure réservé aux administrateurs.
const PUBLIC_ACTIONS = new Set(['relay-points'])

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res, 'GET, POST, OPTIONS')) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = String(req.query?.action || '').trim()
  const expectedMethod = ACTION_METHODS[action]
  if (!expectedMethod) return res.status(404).json({ error: 'Action Mondial Relay inconnue.' })
  if (req.method !== expectedMethod) return res.status(405).json({ error: 'Méthode non autorisée.' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  if (PUBLIC_ACTIONS.has(action)) {
    // La limitation de débit ne doit jamais tomber en 500 muet : sans ce
    // filet, une erreur du compteur ressortait chez le client comme un échec
    // inexplicable de la recherche de Points Relais.
    let rateLimit
    try {
      rateLimit = await enforceRequestRateLimits(req, [
        { scope: 'relay_points', limit: 60, windowSeconds: 3600 },
      ])
    } catch (error) {
      console.error('mondial relay rate limit error:', error?.message || error)
      return res.status(503).json({ error: 'Recherche de Point Relais momentanément indisponible.' })
    }
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Trop de recherches, réessayez dans quelques minutes.' })
    }
  } else {
    const adminAuth = await authenticateAdminRequest(req)
    if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })
    if (action === 'status') {
      return res.status(200).json({ ...publicMondialRelayStatus(), colissimo: publicColissimoStatus() })
    }
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Corps JSON invalide.' })
  }

  try {
    if (action === 'relay-points') {
      const points = await searchRelayPoints({
        postcode: body.postcode,
        weightGrams: body.weightGrams,
        limit: 10,
      })
      return res.status(200).json({ points })
    }

    // Diagnostic administrateur : une recherche sans résultat est silencieuse
    // par conception. Cette action rejoue la même requête et rend la réponse
    // brute de Mondial Relay pour distinguer une zone réellement sans Point
    // Relais d'un refus silencieux du service.
    if (action === 'relay-points-debug') {
      const diagnostic = await diagnoseRelayPointSearch({
        postcode: body.postcode,
        weightGrams: body.weightGrams,
        country: body.country,
        searchAction: body.searchAction,
        radiusKm: body.radiusKm,
      })
      return res.status(200).json(diagnostic)
    }

    if (action === 'tracking') {
      const tracking = await traceMondialRelayShipment(body.shipmentNumber)
      return res.status(200).json(tracking)
    }

    if (action === 'colissimo-label') return await createColissimoLabelForOrder(body, res)

    return await createLabel(body, res)
  } catch (error) {
    if (error instanceof ColissimoError) {
      const status = error.code === 'not_configured' ? 503 : error.retryable ? 502 : 400
      return res.status(status).json({ error: error.message, code: error.code })
    }
    if (error instanceof MondialRelayError) {
      const status = ['api1_not_configured', 'api2_not_configured'].includes(error.code)
        ? 503
        : error.retryable ? 502 : 400
      return res.status(status).json({
        error: error.message,
        code: error.code,
        ...(error.statuses?.length ? { statuses: error.statuses } : {}),
      })
    }
    console.error(`mondial relay ${action} error:`, error)
    const messages = {
      'relay-points': 'Recherche Point Relais impossible.',
      'relay-points-debug': 'Diagnostic Point Relais impossible.',
      tracking: 'Suivi Mondial Relay impossible.',
      'create-label': 'Création de l’étiquette Mondial Relay impossible.',
      'colissimo-label': 'Création de l’étiquette Colissimo impossible.',
    }
    return res.status(500).json({ error: messages[action] })
  }
}

async function createLabel(body, res) {
  const orderId = String(body.orderId || '').trim()
  const weightGrams = Math.round(Number(body.weightGrams))
  const deliveryMode = String(body.deliveryMode || '24R').trim().toUpperCase()
  const requestedRelayId = normalizeRelayId(body.relayId)
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

  // Le Point Relais choisi par le client au checkout fait foi. L'admin n'a plus
  // à en désigner un : il n'en fournit que si la commande n'en porte aucun
  // (commandes antérieures à la sélection côté client, ou autre mode).
  const relayId = normalizeRelayId(previous.relayId) || requestedRelayId
  if (deliveryMode === '24R' && !relayId) {
    return res.status(400).json({
      error: 'Aucun Point Relais sur cette commande. Sélectionnez-en un pour créer l’étiquette.',
      code: 'relay_point_missing',
    })
  }
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
}

async function signedLabelUrl(path) {
  const { data, error } = await supabaseAdmin.storage.from(LABEL_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS)
  if (error) throw error
  return data?.signedUrl || ''
}

async function createColissimoLabelForOrder(body, res) {
  const orderId = String(body.orderId || '').trim()
  const weightGrams = Math.round(Number(body.weightGrams))
  if (!orderId) return res.status(400).json({ error: 'orderId manquant.' })

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
  if (['pickup', 'relais'].includes(order.shipping?.id)) {
    return res.status(409).json({ error: 'Cette commande n’est pas expédiée en Colissimo.' })
  }

  // Étiquette déjà créée : on renvoie un nouveau lien, sans recréer de colis.
  const previous = order.shipping?.colissimo || {}
  if (previous.parcelNumber) {
    const labelUrl = previous.labelPath ? await signedLabelUrl(previous.labelPath).catch(() => '') : ''
    return res.status(200).json({ ok: true, reused: true, parcelNumber: previous.parcelNumber, labelUrl })
  }
  if (!LABEL_STATUSES.has(order.status)) {
    return res.status(409).json({
      error: `L’étiquette doit être créée pendant la préparation, pas depuis le statut ${order.status}.`,
    })
  }

  const label = await createColissimoLabel({ order, weightGrams }, { config: getColissimoConfig() })

  // Le colis existe désormais chez Colissimo : chaque étape suivante doit
  // préserver le numéro et le PDF, même si le stockage échoue.
  const labelPath = `colissimo/${order.id}-${label.parcelNumber}.pdf`
  let storedPath = ''
  const { error: uploadError } = await supabaseAdmin.storage
    .from(LABEL_BUCKET)
    .upload(labelPath, label.pdf, { contentType: 'application/pdf', upsert: true })
  if (uploadError) console.error('colissimo label upload error:', uploadError.message || uploadError)
  else storedPath = labelPath

  const shipping = {
    ...(order.shipping || {}),
    tracking: label.parcelNumber,
    carrier: 'Colissimo',
    colissimo: {
      parcelNumber: label.parcelNumber,
      labelPath: storedPath,
      weightGrams,
      productCode: label.productCode,
      createdAt: new Date().toISOString(),
    },
  }
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ shipping })
    .eq('id', order.id)
    .eq('status', order.status)
    .eq('payment_status', 'paid')
    .select('id')
    .maybeSingle()

  const labelUrl = storedPath ? await signedLabelUrl(storedPath).catch(() => '') : ''
  // Sans lien de stockage, le PDF part directement dans la réponse.
  const pdfBase64 = labelUrl ? undefined : label.pdf.toString('base64')
  if (updateError || !updated) {
    return res.status(409).json({
      error: 'Étiquette créée, mais la commande n’a pas pu être mise à jour. Notez le numéro affiché et rechargez l’admin.',
      recoveryRequired: true,
      parcelNumber: label.parcelNumber,
      labelUrl,
      pdfBase64,
    })
  }
  return res.status(200).json({ ok: true, parcelNumber: label.parcelNumber, labelUrl, pdfBase64, shipping })
}
