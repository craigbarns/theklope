// =============================================================================
// POST /api/mark-shipped — marque une commande « expédiée », enregistre le
// numéro de suivi et envoie l'e-mail « Votre commande a été expédiée » au client.
// -----------------------------------------------------------------------------
// SÉCURITÉ : réservé aux admins. On exige le jeton d'accès Supabase de l'admin
// (Authorization: Bearer <access_token>) et on le valide côté serveur.
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { sendEmail, emailLayout, escapeHtml, euro, FROM_CHECKOUT } from './_lib/email.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  // 1. Auth admin : valider le jeton Supabase
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Authentification requise.' })
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData?.user) return res.status(401).json({ error: 'Session admin invalide.' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const orderId = String(body.orderId || '').trim()
    const tracking = String(body.tracking || '').trim().slice(0, 120)
    const carrier = String(body.carrier || '').trim().slice(0, 60)
    if (!orderId) return res.status(400).json({ error: 'orderId manquant.' })

    // 2. Récupérer la commande
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, customer, address, shipping, total, order_items(name, qty, line_total)')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })

    // 3. Mettre à jour statut + suivi (fusionné dans la colonne shipping jsonb)
    const shipping = { ...(order.shipping || {}), tracking, carrier }
    const { error: updErr } = await supabaseAdmin
      .from('orders')
      .update({ status: 'shipped', shipping })
      .eq('id', orderId)
    if (updErr) throw updErr

    // 4. E-mail client (non bloquant)
    const customer = order.customer || {}
    const address = order.address || {}
    if (customer.email) {
      const items = (order.order_items || [])
        .map((it) => `<tr><td style="padding:6px 0;color:#e5e5e5">${escapeHtml(it.name)} × ${Number(it.qty)}</td><td style="padding:6px 0;text-align:right;color:#e5e5e5">${euro(it.line_total)}</td></tr>`)
        .join('')
      const trackingBlock = tracking
        ? `<div style="background:#0f2119;border:1px solid #35FF8A33;border-radius:12px;padding:16px;margin:16px 0">
             <p style="margin:0 0 4px;font-size:12px;color:#9aa0a6">Numéro de suivi${carrier ? ` (${escapeHtml(carrier)})` : ''}</p>
             <p style="margin:0;font-size:18px;font-weight:700;color:#35FF8A;letter-spacing:0.5px">${escapeHtml(tracking)}</p>
           </div>`
        : ''
      try {
        await sendEmail({
          from: FROM_CHECKOUT,
          to: customer.email,
          subject: `Votre commande ${order.id} a été expédiée — THEKLOPE`,
          html: emailLayout({
            title: 'Votre commande est en route ! 📦',
            bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">Bonjour ${escapeHtml(customer.name || '')},<br>Bonne nouvelle : votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong> vient d'être expédiée.</p>
              ${trackingBlock}
              <table style="width:100%;font-size:14px">${items}</table>
              <p style="font-size:13px;color:#9aa0a6;margin-top:20px">Livraison à :<br>${escapeHtml(customer.name || '')}<br>${escapeHtml(address.street || '')} ${escapeHtml(address.extra || '')}<br>${escapeHtml(address.zip || '')} ${escapeHtml(address.city || '')}</p>`,
          }),
        })
      } catch (mailErr) {
        console.error('shipping email error:', mailErr)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('mark-shipped error:', err)
    return res.status(500).json({ error: err.message || 'Erreur serveur.' })
  }
}
