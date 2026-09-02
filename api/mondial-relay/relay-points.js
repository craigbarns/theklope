import { authenticateAdminRequest } from '../_lib/adminAuth.js'
import { hasSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { configureSameOriginCors, setNoStore } from '../_lib/httpSecurity.js'
import { MondialRelayError, searchRelayPoints } from '../_lib/mondialRelay.js'

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const points = await searchRelayPoints({
      postcode: body.postcode,
      weightGrams: body.weightGrams,
      limit: 10,
    })
    return res.status(200).json({ points })
  } catch (error) {
    if (error instanceof SyntaxError) return res.status(400).json({ error: 'Corps JSON invalide.' })
    if (error instanceof MondialRelayError) {
      const status = error.code === 'api1_not_configured' ? 503 : error.retryable ? 502 : 400
      return res.status(status).json({ error: error.message, code: error.code })
    }
    console.error('mondial relay points error:', error)
    return res.status(500).json({ error: 'Recherche Point Relais impossible.' })
  }
}
