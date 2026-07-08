// =============================================================================
// TEMPORAIRE — envoie l'e-mail de confirmation d'une commande existante, sans
// paiement. À SUPPRIMER après usage.
// GET /api/preview-order-email?token=tkprev-7b2c&order=TK-XXXXXX
// =============================================================================
import { sendOrderConfirmationEmails } from './_lib/orders.js'
import { hasSupabaseAdmin } from './_lib/supabaseAdmin.js'

const TOKEN = 'tkprev-7b2c'

export default async function handler(req, res) {
  const params = req.query || new URL(req.url, 'http://x').searchParams
  const token = req.query?.token || new URL(req.url, 'http://x').searchParams.get('token')
  const order = req.query?.order || new URL(req.url, 'http://x').searchParams.get('order')
  if (token !== TOKEN) return res.status(403).json({ error: 'Interdit' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base non configurée.' })
  if (!order) return res.status(400).json({ error: 'Paramètre order manquant.' })

  try {
    await sendOrderConfirmationEmails(order)
    return res.status(200).json({ ok: true, order, note: 'E-mails de confirmation envoyés (client + checkout@).' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
