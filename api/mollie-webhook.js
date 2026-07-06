// =============================================================================
// POST /api/mollie-webhook  (URL à renseigner comme webhookUrl des paiements)
// -----------------------------------------------------------------------------
// Mollie envoie l'id du paiement (form-encoded : id=tr_xxx). On NE fait jamais
// confiance au corps : on refait un appel API Mollie pour lire le vrai statut,
// puis on met la commande à jour. C'est la source de vérité du paiement.
// =============================================================================
import { syncOrderFromMolliePayment } from './_lib/orders.js'

export const config = { api: { bodyParser: false } }

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  try {
    const raw = await readBody(req)
    const paymentId = new URLSearchParams(raw).get('id')
    if (!paymentId) return res.status(400).json({ error: 'id de paiement manquant' })

    await syncOrderFromMolliePayment(paymentId)
    // Mollie attend un 200 ; sinon il réessaie plus tard.
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('mollie-webhook error:', err)
    return res.status(500).json({ error: err.message })
  }
}
