// =============================================================================
// POST /api/send-campaign — Envoi de campagne mailing / test depuis l'admin.
// =============================================================================
import { sendEmail, FROM_CONTACT } from './_lib/email.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'

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

    const { action, to, subject, html, emails } = body

    if (!subject || !html) {
      return res.status(400).json({ error: 'Sujet et contenu HTML requis.' })
    }

    if (action === 'send-test') {
      if (!to || !EMAIL_RE.test(to)) {
        return res.status(400).json({ error: 'Adresse e-mail destinataire de test invalide.' })
      }

      const result = await sendEmail({
        from: FROM_CONTACT,
        to: to.trim().toLowerCase(),
        subject: `[TEST] ${subject}`,
        html,
      })

      return res.status(200).json({ ok: true, result })
    }

    if (action === 'send-batch') {
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: 'Liste d’e-mails invalide.' })
      }

      const validEmails = emails.filter((e) => EMAIL_RE.test(String(e).trim()))
      if (validEmails.length === 0) {
        return res.status(400).json({ error: 'Aucun e-mail valide dans le lot.' })
      }

      // Traitement du lot via Resend API
      const results = []
      for (const email of validEmails.slice(0, 50)) {
        try {
          const resMail = await sendEmail({
            from: FROM_CONTACT,
            to: email,
            subject,
            html,
          })
          results.push({ email, success: true, id: resMail?.id })
        } catch (err) {
          results.push({ email, success: false, error: err.message })
        }
      }

      return res.status(200).json({ ok: true, sentCount: results.filter((r) => r.success).length, results })
    }

    return res.status(400).json({ error: 'Action non reconnue.' })
  } catch (err) {
    console.error('send-campaign error:', err)
    return res.status(500).json({ error: err.message || "Erreur lors de l'envoi de la campagne." })
  }
}
