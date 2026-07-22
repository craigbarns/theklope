// =============================================================================
// POST /api/mark-shipped — marque une commande « expédiée », enregistre le
// numéro de suivi et envoie l'e-mail « Votre commande a été expédiée » au client.
// -----------------------------------------------------------------------------
// SÉCURITÉ : réservé aux admins. On valide le jeton d'accès Supabase côté
// serveur, puis son appartenance à l'allowlist public.admin_users.
// =============================================================================
import { supabaseAdmin, hasSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { authenticateAdminRequest } from './_lib/adminAuth.js'
import { sendEmail, emailLayout, escapeHtml, escapeHtmlWithLineBreaks, euro, FROM_CHECKOUT } from './_lib/email.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { formatOrderItemLabel } from './_lib/orderPresentation.js'

export default async function handler(req, res) {
  setNoStore(res)
  if (!configureSameOriginCors(req, res)) {
    return res.status(403).json({ error: 'Origine de requête refusée.' })
  }

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!hasSupabaseAdmin) return res.status(500).json({ error: 'Base de données non configurée.' })

  // 1. Auth admin : le jeton doit appartenir a un membre de l'allowlist.
  const adminAuth = await authenticateAdminRequest(req)
  if (!adminAuth.ok) return res.status(adminAuth.status).json({ error: adminAuth.error })

  try {
    let body
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide.' })
    }
    const orderId = String(body.orderId || '').trim()
    const tracking = String(body.tracking || '').trim().slice(0, 120)
    const carrier = String(body.carrier || '').trim().slice(0, 60)
    if (!orderId) return res.status(400).json({ error: 'orderId manquant.' })

    // 2. Récupérer la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, checkout_review_required_at, checkout_review_reason, shipping_email_sent_at, customer, address, shipping, total, order_items(name, qty, variant, line_total)')
      .eq('id', orderId)
      .maybeSingle()
    if (orderError) throw orderError
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' })
    if (order.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Seule une commande payee peut etre expediee.' })
    }
    if (order.checkout_review_required_at || order.checkout_review_reason) {
      return res.status(409).json({ error: 'Cette commande exige une vérification Mollie avant toute préparation.' })
    }
    const isPickup = order.shipping?.id === 'pickup'
    const allowedStatuses = isPickup ? ['processing', 'ready_for_pickup'] : ['processing', 'shipped']
    const nextStatus = isPickup ? 'ready_for_pickup' : 'shipped'
    if (!allowedStatuses.includes(order.status)) {
      return res.status(409).json({ error: `Cette commande ne peut pas etre expediee depuis le statut ${order.status}.` })
    }

    // 3. Mettre à jour statut + suivi (fusionné dans la colonne shipping jsonb)
    const shipping = isPickup
      ? { ...(order.shipping || {}), tracking: '', carrier: '' }
      : { ...(order.shipping || {}), tracking, carrier }
    const { data: transitioned, error: updErr } = await supabaseAdmin
      .from('orders')
      .update({ status: nextStatus, shipping })
      .eq('id', orderId)
      .eq('status', order.status)
      .eq('payment_status', 'paid')
      .is('checkout_review_required_at', null)
      .is('checkout_review_reason', null)
      .select('id')
      .maybeSingle()
    if (updErr) throw updErr
    if (!transitioned) {
      return res.status(409).json({
        error: 'Le statut de la commande a changé. Expédition annulée, rechargez la commande.',
      })
    }

    // 4. E-mail client. Replays on an already-shipped order are allowed when a
    // previous send failed; the durable timestamp and provider idempotency key
    // prevent duplicate delivery after success.
    const customer = order.customer || {}
    const address = order.address || {}
    let emailSent = false
    const emailAlreadySent = Boolean(order.shipping_email_sent_at)
    let emailError = null
    if (customer.email && !emailAlreadySent) {
      const items = (order.order_items || [])
        .map((it) => `<tr><td style="padding:6px 0;color:#e5e5e5">${escapeHtml(formatOrderItemLabel(it))} × ${Number(it.qty)}</td><td style="padding:6px 0;text-align:right;color:#e5e5e5">${euro(it.line_total)}</td></tr>`)
        .join('')
      const trackingBlock = tracking
        && !isPickup
        ? `<div style="background:#0f2119;border:1px solid #35FF8A33;border-radius:12px;padding:16px;margin:16px 0">
             <p style="margin:0 0 4px;font-size:12px;color:#9aa0a6">Numéro de suivi${carrier ? ` (${escapeHtml(carrier)})` : ''}</p>
             <p style="margin:0;font-size:18px;font-weight:700;color:#35FF8A;letter-spacing:0.5px">${escapeHtml(tracking)}</p>
           </div>`
        : ''
      const deliveryInstructions = typeof address.deliveryInstructions === 'string' ? address.deliveryInstructions.trim() : ''
      const deliveryInstructionsBlock = deliveryInstructions && !isPickup
        ? `<p style="font-size:13px;line-height:1.6;color:#e5e5e5;margin-top:16px"><strong style="color:#fff">Instructions de livraison :</strong><br>${escapeHtmlWithLineBreaks(deliveryInstructions)}</p>`
        : ''
      try {
        const result = await sendEmail({
          from: FROM_CHECKOUT,
          to: customer.email,
          idempotencyKey: isPickup
            ? `order-ready-pickup-customer/${order.id}`
            : `order-shipped-customer/${order.id}`,
          subject: isPickup
            ? `Votre commande ${order.id} est prête au retrait — THEKLOPE`
            : `Votre commande ${order.id} a été expédiée — THEKLOPE`,
          html: emailLayout({
            title: isPickup ? 'Votre commande est prête !' : 'Votre commande est en route ! 📦',
            bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">Bonjour ${escapeHtml(customer.name || '')},<br>${isPickup
              ? `Bonne nouvelle : votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong> vous attend au 188 rue de Rome, 13006 Marseille.`
              : `Bonne nouvelle : votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong> vient d'être expédiée.`}</p>
              ${trackingBlock}
              <table style="width:100%;font-size:14px">${items}</table>
              ${isPickup ? '' : `<p style="font-size:13px;color:#9aa0a6;margin-top:20px">Livraison à :<br>${escapeHtml(customer.name || '')}<br>${escapeHtml(address.street || '')} ${escapeHtml(address.extra || '')}<br>${escapeHtml(address.zip || '')} ${escapeHtml(address.city || '')}</p>`}
              ${deliveryInstructionsBlock}`,
          }),
        })
        if (!result?.skipped) {
          const { error: sentError } = await supabaseAdmin
            .from('orders')
            .update({ shipping_email_sent_at: new Date().toISOString() })
            .eq('id', order.id)
            .is('shipping_email_sent_at', null)
          if (sentError) throw sentError
          emailSent = true
        }
      } catch (mailErr) {
        console.error('shipping email error:', mailErr)
        emailError = 'La commande est expédiée, mais l’e-mail n’a pas pu être envoyé. Vous pouvez réessayer.'
      }
    }

    return res.status(200).json({
      ok: true,
      status: nextStatus,
      emailSent,
      emailAlreadySent,
      ...(emailError ? { emailError } : {}),
    })
  } catch (err) {
    console.error('mark-shipped error:', err)
    return res.status(500).json({ error: err.message || 'Erreur serveur.' })
  }
}
