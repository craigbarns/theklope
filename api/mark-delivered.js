// POST /api/mark-delivered — authenticated CAS transition after shipment or
// store pickup. Financial-review flags freeze fulfillment until resolved.
import { authenticateAdminRequest } from './_lib/adminAuth.js'
import { CHECKOUT_ORDER_ID_RE } from './_lib/checkout.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  const adminAuth = await authenticateAdminRequest(req)
  if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Corps JSON invalide.' })
  }
  const orderId = String(body.orderId || '').trim()
  if (!CHECKOUT_ORDER_ID_RE.test(orderId)) {
    return res.status(400).json({ error: 'Identifiant de commande invalide.' })
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, checkout_review_required_at, checkout_review_reason')
      .eq('id', orderId)
      .maybeSingle()
    if (error) throw error
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })
    if (order.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Seule une commande payée peut être livrée.' })
    }
    if (order.checkout_review_required_at || order.checkout_review_reason) {
      return res.status(409).json({ error: 'Cette commande exige une vérification Mollie.' })
    }
    if (order.status === 'delivered') {
      return res.status(200).json({ ok: true, status: 'delivered', alreadyDelivered: true })
    }
    if (!['shipped', 'ready_for_pickup'].includes(order.status)) {
      return res.status(409).json({ error: `Transition impossible depuis le statut ${order.status}.` })
    }

    const { data: transitioned, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
      .eq('status', order.status)
      .eq('payment_status', 'paid')
      .is('checkout_review_required_at', null)
      .is('checkout_review_reason', null)
      .select('id')
      .maybeSingle()
    if (updateError) throw updateError
    if (!transitioned) {
      return res.status(409).json({ error: 'Le statut a changé. Rechargez la commande.' })
    }
    return res.status(200).json({ ok: true, status: 'delivered', alreadyDelivered: false })
  } catch (error) {
    console.error('mark-delivered error:', error)
    return res.status(500).json({ error: error.message || 'Erreur serveur.' })
  }
}
