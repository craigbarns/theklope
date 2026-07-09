// =============================================================================
// GET /api/payment-status?order=TK-123456
// -----------------------------------------------------------------------------
// Utilisé par la page de retour après redirection Mollie. Relit le statut réel
// du paiement auprès de Mollie (et finalise la commande si payée), afin que la
// confirmation fonctionne même si le webhook n'est pas encore arrivé.
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { syncOrderFromMolliePayment } from './_lib/orders.js'
import { hasMollie } from './_lib/mollie.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin || !hasMollie) {
    return res.status(500).json({ error: 'Paiement non configuré côté serveur.' })
  }

  const orderId = req.query?.order || new URL(req.url, 'http://x').searchParams.get('order')
  if (!orderId) return res.status(400).json({ error: 'Paramètre order manquant.' })

  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, payment_id, payment_status, status, total, shipping')
      .eq('id', orderId)
      .maybeSingle()

    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })

    let status = order.payment_status === 'paid' ? 'paid' : order.payment_status === 'failed' ? 'failed' : 'pending'

    // Si pas encore payée, on interroge Mollie pour rafraîchir (et finaliser).
    let orderStatus = order.status
    if (status === 'pending' && order.payment_id) {
      const synced = await syncOrderFromMolliePayment(order.payment_id)
      if (synced.status !== 'unknown') status = synced.status
      if (synced.orderStatus) orderStatus = synced.orderStatus
    }

    return res.status(200).json({
      status,
      order: { id: order.id, total: order.total, shipping: order.shipping, status: orderStatus },
    })
  } catch (err) {
    console.error('payment-status error:', err)
    return res.status(500).json({ error: err.message })
  }
}
