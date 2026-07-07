// =============================================================================
// TEMPORAIRE — diagnostic d'envoi Resend. À SUPPRIMER après vérification.
// GET /api/email-check?token=tkdiag-9f3a[&to=email]
// Renvoie si la clé est présente au runtime et le résultat réel d'un envoi test.
// =============================================================================
import { sendEmail, hasResend, FROM_CONTACT } from './_lib/email.js'

const TOKEN = 'tkdiag-9f3a'

export default async function handler(req, res) {
  const token = req.query?.token || new URL(req.url, 'http://x').searchParams.get('token')
  if (token !== TOKEN) return res.status(403).json({ error: 'Interdit' })

  const to = req.query?.to || 'contact@theklope.com'
  const out = { hasResendKey: hasResend, from: FROM_CONTACT, to }

  if (!hasResend) {
    out.result = 'AUCUNE clé RESEND_API_KEY détectée au runtime (variable absente ou pas redéployée).'
    return res.status(200).json(out)
  }

  try {
    const r = await sendEmail({
      from: FROM_CONTACT,
      to,
      subject: '[DIAG] Test Resend THEKLOPE',
      html: '<p>Diagnostic Resend : si vous recevez ceci, l’envoi fonctionne.</p>',
    })
    out.result = 'OK'
    out.resend = r
  } catch (err) {
    out.result = 'ERREUR'
    out.error = err.message
  }
  return res.status(200).json(out)
}
