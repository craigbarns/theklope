// =============================================================================
// POST /api/mollie-webhook  (URL à renseigner comme webhookUrl des paiements)
// -----------------------------------------------------------------------------
// Mollie envoie l'id du paiement (form-encoded : id=tr_xxx). On NE fait jamais
// confiance au corps : on refait un appel API Mollie pour lire le vrai statut,
// puis on met la commande à jour. C'est la source de vérité du paiement.
// =============================================================================
import { syncOrderFromMolliePayment } from './_lib/orders.js'
import { setNoStore } from './_lib/httpSecurity.js'

export const config = { api: { bodyParser: false } }

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    size += buffer.length
    if (size > 4096) {
      const error = new Error('Corps de webhook trop volumineux.')
      error.statusCode = 413
      throw error
    }
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
  setNoStore(res)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  try {
    const raw = await readBody(req)
    const paymentId = new URLSearchParams(raw).get('id')
    if (!paymentId) return res.status(400).json({ error: 'id de paiement manquant' })
    if (!/^tr_[A-Za-z0-9]+$/.test(paymentId)) {
      return res.status(400).json({ error: 'id de paiement invalide' })
    }

    const result = await syncOrderFromMolliePayment(paymentId)
    if (!['paid', 'pending', 'failed'].includes(result.status)) {
      throw new Error('Paiement Mollie non rattache a une commande.')
    }
    // Mollie attend un 200 ; sinon il réessaie plus tard.
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('mollie-webhook error:', err)
    return res.status(err.statusCode || 500).json({ error: err.message })
  }
}
