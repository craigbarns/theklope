// =============================================================================
// POST /api/newsletter — enregistre une adresse e-mail dans Supabase.
// Table attendue : newsletter_subscribers (email text unique, created_at timestamptz default now()).
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const email = String(body.email || '').trim().toLowerCase()

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' })
    }

    if (!hasSupabaseAdmin) {
      return res.status(503).json({ error: "Service d'inscription indisponible pour le moment." })
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
