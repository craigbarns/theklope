// Demande d'avis Google, envoyée une seule fois ~5 jours après une commande
// payée (lancée par le cron quotidien /api/cleanup-checkouts).
//
// Règles :
// - uniquement les commandes payées, ni annulées, ni remboursées, ni en revue ;
// - une seule demande par client (même adresse e-mail), quel que soit le
//   nombre de commandes : Google n'accepte qu'un avis par personne et relancer
//   un client fidèle à chaque commande serait du harcèlement ;
// - demande neutre, sans contrepartie ni filtre « seulement si satisfait »
//   (interdit par les règles Google) ; un client mécontent peut répondre à
//   l'e-mail pour être aidé ;
// - aucun contenu promotionnel sur les produits (art. L3513-4 CSP).
import { emailLayout, escapeHtml, FROM_CONTACT, INBOX_CONTACT, sendEmail } from './email.js'

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CWgopwUk40fiEAE/review'
export const GOOGLE_REVIEW_COLUMN = 'google_review_email_sent_at'
export const REVIEW_DELAY_DAYS = 5
// Fenêtre de rattrapage : si le cron a manqué quelques jours, la demande part
// quand même, mais jamais pour une commande trop ancienne.
export const REVIEW_WINDOW_DAYS = 12
const BATCH_LIMIT = 25
const DAY_MS = 24 * 60 * 60 * 1000

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

export function firstName(customer) {
  const raw = String(customer?.firstName || customer?.name || '').trim()
  const first = raw.split(/\s+/)[0] || ''
  return first.length > 40 ? '' : first
}

const formatOrderDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(date)
}

export function googleReviewEmailHtml({ customer, orderId, createdAt, reviewUrl = GOOGLE_REVIEW_URL }) {
  const name = firstName(customer)
  const orderDate = formatOrderDate(createdAt)
  const bodyHtml = `
    <p style="font-size:15px;line-height:1.6;color:#e5e5e5;margin:0 0 16px">
      Bonjour${name ? ` ${escapeHtml(name)}` : ''},
    </p>
    <p style="font-size:14px;line-height:1.7;color:#ccc;margin:0 0 16px">
      Merci pour votre commande <strong style="color:#fff">${escapeHtml(orderId)}</strong>${orderDate ? ` du ${escapeHtml(orderDate)}` : ''}.
      Nous espérons que tout s’est bien passé.
    </p>
    <p style="font-size:14px;line-height:1.7;color:#ccc;margin:0 0 24px">
      THEKLOPE est une boutique indépendante du 188 rue de Rome à Marseille. Votre avis sur Google,
      en quelques mots, aide d’autres personnes à nous trouver et nous aide à nous améliorer.
      Cela prend moins d’une minute.
    </p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;background:#35FF8A;color:#050505;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
        Donner mon avis sur Google
      </a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#aaa;margin:0 0 12px">
      Un souci avec votre commande ? Répondez simplement à cet e-mail : nous vous répondons rapidement.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#ccc;margin:0">Merci et à bientôt,<br>L’équipe THEKLOPE</p>
    <p style="font-size:11px;line-height:1.6;color:#777;margin:20px 0 0">
      Vous recevez cet e-mail unique à la suite de votre commande sur theklope.com. Aucune autre demande d’avis ne vous sera envoyée.
    </p>`
  return emailLayout({ title: 'Votre avis compte pour nous', bodyHtml })
}

// `now`, `send` et `client` sont injectables pour les tests.
export async function sendGoogleReviewRequests(client, { now = new Date(), send = sendEmail } = {}) {
  if (!client) return { count: 0, sent: 0 }

  const newest = new Date(now.getTime() - REVIEW_DELAY_DAYS * DAY_MS).toISOString()
  const oldest = new Date(now.getTime() - REVIEW_WINDOW_DAYS * DAY_MS).toISOString()

  const { data: orders, error } = await client
    .from('orders')
    .select(`id, created_at, customer, customer_email, status, payment_status, checkout_review_required_at, ${GOOGLE_REVIEW_COLUMN}`)
    .eq('payment_status', 'paid')
    .is(GOOGLE_REVIEW_COLUMN, null)
    .is('checkout_review_required_at', null)
    .not('status', 'in', '(cancelled,refunded)')
    .gte('created_at', oldest)
    .lte('created_at', newest)
    .order('created_at', { ascending: true })
    .limit(BATCH_LIMIT)
  if (error) return { count: 0, sent: 0, error: error.message }
  if (!orders?.length) return { count: 0, sent: 0 }

  const emails = [...new Set(orders.map((o) => normalizeEmail(o.customer_email || o.customer?.email)).filter(Boolean))]
  const alreadyAsked = new Set()
  if (emails.length) {
    const { data: previous, error: previousError } = await client
      .from('orders')
      .select('customer_email')
      .in('customer_email', emails)
      .not(GOOGLE_REVIEW_COLUMN, 'is', null)
    if (previousError) return { count: orders.length, sent: 0, error: previousError.message }
    for (const row of previous || []) alreadyAsked.add(normalizeEmail(row.customer_email))
  }

  let sent = 0
  let skipped = 0
  const failures = []
  for (const order of orders) {
    const email = normalizeEmail(order.customer_email || order.customer?.email)
    const stamp = new Date().toISOString()

    // Déjà sollicité (autre commande, ou doublon dans ce lot) : on marque la
    // commande comme traitée sans envoyer, pour ne plus la reconsidérer.
    if (!email || alreadyAsked.has(email)) {
      await client.from('orders').update({ [GOOGLE_REVIEW_COLUMN]: stamp }).eq('id', order.id).is(GOOGLE_REVIEW_COLUMN, null)
      skipped++
      continue
    }

    // Réservation avant l'envoi : deux exécutions simultanées ne peuvent pas
    // envoyer deux fois (seule celle qui passe la date de null à maintenant
    // obtient la ligne).
    const { data: claimed, error: claimError } = await client
      .from('orders')
      .update({ [GOOGLE_REVIEW_COLUMN]: stamp })
      .eq('id', order.id)
      .is(GOOGLE_REVIEW_COLUMN, null)
      .select('id')
    if (claimError || !claimed?.length) continue
    alreadyAsked.add(email)

    try {
      await send({
        from: FROM_CONTACT,
        to: email,
        replyTo: INBOX_CONTACT,
        subject: 'Votre avis compte pour THEKLOPE',
        html: googleReviewEmailHtml({ customer: order.customer, orderId: order.id, createdAt: order.created_at }),
        idempotencyKey: `google-review-${order.id}`,
      })
      sent++
    } catch (err) {
      // Échec d'envoi : on libère la commande pour réessayer au prochain cron.
      alreadyAsked.delete(email)
      await client.from('orders').update({ [GOOGLE_REVIEW_COLUMN]: null }).eq('id', order.id)
      failures.push({ id: order.id, error: String(err?.message || err).slice(0, 200) })
    }
  }

  return { count: orders.length, sent, skipped, ...(failures.length ? { failures } : {}) }
}
