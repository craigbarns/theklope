// =============================================================================
// POST /api/newsletter — enregistre une adresse e-mail dans Supabase.
// Table attendue : newsletter_subscribers (email text unique, created_at timestamptz default now()).
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  try {
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide.' })
    }
    const email = String(body.email || '').trim().toLowerCase()

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' })
    }

    if (!hasSupabaseAdmin) {
      return res.status(503).json({ error: "Service d'inscription indisponible pour le moment." })
    }

    const rateLimit = await enforceRequestRateLimits(req, [
      { scope: 'newsletter_ip', limit: 20, windowSeconds: 3600 },
      { scope: 'newsletter_email', value: email, limit: 3, windowSeconds: 3600 },
    ])
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter))
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' })
    }

    // upsert pour éviter une erreur si l'e-mail est déjà inscrit (idempotent).
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email' })

    if (error) throw error

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('newsletter error:', err)
    return res.status(500).json({ error: "Impossible d'enregistrer l'inscription." })
  }
}
