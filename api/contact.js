// =============================================================================
// POST /api/contact — enregistre un message du formulaire de contact.
// Table attendue : contact_messages (name, email, subject, message, created_at).
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { sendEmail, emailLayout, escapeHtml, FROM_CONTACT, INBOX_CONTACT } from './_lib/email.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clip = (v, max) => String(v || '').trim().slice(0, max)

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
    const name = clip(body.name, 120)
    const email = clip(body.email, 180).toLowerCase()
    const subject = clip(body.subject, 200)
    const message = clip(body.message, 4000)

    if (!name || !subject || !message) {
      return res.status(400).json({ error: 'Merci de remplir tous les champs.' })
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' })
    }

    if (!hasSupabaseAdmin) {
      return res.status(503).json({ error: "Service de contact indisponible pour le moment." })
    }

    const rateLimit = await enforceRequestRateLimits(req, [
      { scope: 'contact_ip', limit: 15, windowSeconds: 3600 },
      { scope: 'contact_email', value: email, limit: 5, windowSeconds: 3600 },
    ])
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter))
      return res.status(429).json({ error: 'Trop de messages envoyés. Réessayez plus tard.' })
    }

    const { error } = await supabaseAdmin
      .from('contact_messages')
      .insert({ name, email, subject, message })

    if (error) throw error

    // Notification e-mail (non bloquante : le message est déjà enregistré).
    try {
      await sendEmail({
        from: FROM_CONTACT,
        to: INBOX_CONTACT,
        replyTo: email,
        subject: `Nouveau message de contact : ${subject}`,
        html: emailLayout({
          title: 'Nouveau message via le formulaire de contact',
          bodyHtml: `<p style="font-size:14px;color:#cfcfcf"><strong>De :</strong> ${escapeHtml(name)} — ${escapeHtml(email)}</p><p style="font-size:14px;color:#cfcfcf"><strong>Sujet :</strong> ${escapeHtml(subject)}</p><p style="font-size:14px;color:#cfcfcf;white-space:pre-wrap;border-top:1px solid #262626;padding-top:12px;margin-top:12px">${escapeHtml(message)}</p>`,
        }),
      })
    } catch (mailErr) {
      console.error('contact email error:', mailErr)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact error:', err)
    return res.status(500).json({ error: "Impossible d'envoyer le message." })
  }
}
