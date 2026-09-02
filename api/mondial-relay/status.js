import { authenticateAdminRequest } from '../_lib/adminAuth.js'
import { hasSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { configureSameOriginCors, setNoStore } from '../_lib/httpSecurity.js'
import { publicMondialRelayStatus } from '../_lib/mondialRelay.js'

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res, 'GET, OPTIONS')) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  const adminAuth = await authenticateAdminRequest(req)
  if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })
  return res.status(200).json(publicMondialRelayStatus())
}
