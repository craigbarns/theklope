// =============================================================================
// Envoi d'e-mails transactionnels via Resend (API REST, sans dépendance).
// -----------------------------------------------------------------------------
// Nécessite la variable d'env RESEND_API_KEY (Vercel) et un domaine theklope.com
// vérifié dans Resend. Si la clé est absente, les envois sont ignorés
// silencieusement (les fonctions appelantes ne doivent jamais échouer à cause
// de l'e-mail : la commande / le message sont déjà enregistrés).
// =============================================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY

export const hasResend = Boolean(RESEND_API_KEY)

// Adresses d'expédition (domaine theklope.com à vérifier dans Resend).
export const FROM_CONTACT = 'THEKLOPE <contact@theklope.com>'
export const FROM_CHECKOUT = 'THEKLOPE <checkout@theklope.com>'
export const INBOX_CONTACT = 'contact@theklope.com'
export const INBOX_CHECKOUT = 'checkout@theklope.com'

export async function sendEmail({ from, to, subject, html, replyTo, idempotencyKey }) {
  if (!hasResend) return { skipped: true }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': String(idempotencyKey).slice(0, 256) } : {}),
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${detail}`)
  }
  return res.json()
}

export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// À utiliser uniquement dans du contenu HTML : on échappe d'abord le texte
// client, puis on réintroduit des sauts de ligne maîtrisés.
export const escapeHtmlWithLineBreaks = (s) => escapeHtml(s).replace(/\r\n?|\n/g, '<br>')

export const euro = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)

// Gabarit HTML sobre et compatible clients mail (styles inline).
export function emailLayout({ title, bodyHtml }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#e5e5e5">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:24px">THE<span style="color:#35FF8A">KLOPE</span></div>
    <div style="background:#151515;border:1px solid #262626;border-radius:16px;padding:28px">
      <h1 style="margin:0 0 16px;font-size:19px;color:#fff">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <p style="margin:20px 0 0;font-size:11px;color:#777;line-height:1.6">THEKLOPE — édité par SEVEN SEVENTY (SASU) · 188 rue de Rome, 13006 Marseille · Vente réservée aux +18 ans. Les produits contenant de la nicotine créent une forte dépendance.</p>
  </div></body></html>`
}
