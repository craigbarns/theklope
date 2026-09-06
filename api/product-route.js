import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { verifyReviewToken, validateReviewInput } from './_lib/productReviews.js'
import { configureSameOriginCors, setNoStore } from './_lib/httpSecurity.js'
import { enforceRequestRateLimits } from './_lib/rateLimit.js'

const PRODUCT_ID_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,158}[A-Za-z0-9])?$/

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const errorPage = (title, message) => `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${escapeHtml(title)} | THEKLOPE</title>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="/boutique">Voir la boutique</a></p>
    </main>
  </body>
</html>`

const sendHtml = (req, res, status, title, message) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  return res.status(status).end(req.method === 'HEAD' ? undefined : errorPage(title, message))
}

export default async function handler(req, res) {
  setNoStore(res)

  if (req.method === 'POST' || (req.method === 'OPTIONS' && req.headers?.origin)) {
    if (!configureSameOriginCors(req, res, 'POST, GET, OPTIONS')) {
      return res.status(403).json({ ok: false, error: 'Forbidden' })
    }
    if (req.method === 'OPTIONS') return res.status(200).end()
  }

  // 1. Dépôt d'un avis produit vérifié (POST)
  if (req.method === 'POST') {
    const { orderId, productId, token, rating, authorName, comment, title } = req.body || {}
    
    // Validation de la signature cryptographique (token HMAC)
    const isTokenValid = verifyReviewToken({ orderId, productId, token })
    if (!isTokenValid) {
      return res.status(403).json({
        ok: false,
        error: "Lien d’avis invalide ou expiré. Seuls les acheteurs ayant reçu un lien officiel peuvent déposer un avis vérifié.",
      })
    }

    // Validation des champs
    const validation = validateReviewInput({ rating, authorName, comment, title })
    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error })
    }

    if (!hasSupabaseAdmin) {
      return res.status(503).json({ ok: false, error: "Service temporairement indisponible." })
    }

    const rateLimit = await enforceRequestRateLimits(req, [
      { scope: 'submit-review', limit: 10, windowSeconds: 3600 }
    ])
    if (!rateLimit.allowed) {
      return res.status(429).json({ ok: false, error: 'Trop de tentatives, réessayez plus tard.' })
    }

    // Vérification de la commande dans Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, customer, customer_email, order_items(product_id)')
      .eq('id', String(orderId).trim())
      .maybeSingle()

    if (orderError) {
      console.error('submit-review order query error:', orderError.message)
      return res.status(500).json({ ok: false, error: 'Erreur lors de la vérification de la commande.' })
    }

    if (!order || order.payment_status !== 'paid') {
      return res.status(403).json({ ok: false, error: 'Cette commande n’est pas éligible au dépôt d’avis.' })
    }

    // Vérifier que la commande contient bien ce produit
    const items = order.order_items || []
    const containsProduct = items.some((it) => it.product_id === productId)
    if (!containsProduct) {
      return res.status(403).json({ ok: false, error: 'Ce produit ne figure pas dans votre commande.' })
    }

    // Insertion de l'avis vérifié (statut published, verified_purchase = true)
    const customerEmail = order.customer_email || order.customer?.email || null
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('product_reviews')
      .insert({
        order_id: String(orderId).trim(),
        product_id: String(productId).trim(),
        customer_email: customerEmail,
        rating: validation.data.rating,
        author_name: validation.data.authorName,
        title: validation.data.title,
        comment: validation.data.comment,
        verified_purchase: true,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({ ok: false, error: 'Vous avez déjà déposé un avis pour ce produit sur cette commande.' })
      }
      console.error('submit-review insert error:', insertError.message)
      return res.status(500).json({ ok: false, error: 'Erreur lors de l’enregistrement de l’avis.' })
    }

    return res.status(200).json({ ok: true, id: inserted.id })
  }

  // 2. Récupération des avis publiés d'un produit (GET ?action=reviews)
  if (req.method === 'GET' && req.query?.action === 'reviews') {
    const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
    const productId = String(rawId || '').trim()
    if (!productId) return res.status(400).json({ ok: false, error: 'ID produit manquant' })

    if (!hasSupabaseAdmin) {
      return res.status(200).json({ ok: true, reviews: [], stats: null })
    }

    const [{ data: reviews }, { data: stats }] = await Promise.all([
      supabaseAdmin
        .from('product_reviews')
        .select('id, rating, author_name, title, comment, verified_purchase, created_at')
        .eq('product_id', productId)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('product_review_stats')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle(),
    ])

    return res.status(200).json({
      ok: true,
      reviews: reviews || [],
      stats: stats || null,
    })
  }

  // 3. Routage dynamique des fiches produits (GET / HEAD par défaut)
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD, POST')
    return res.status(405).end('Method Not Allowed')
  }

  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
  const id = String(rawId || '').trim()
  if (!PRODUCT_ID_RE.test(id)) {
    return sendHtml(req, res, 404, 'Produit introuvable', "Cette référence n'existe pas ou n'est plus disponible.")
  }
  if (!hasSupabaseAdmin) {
    return sendHtml(req, res, 503, 'Catalogue temporairement indisponible', 'Veuillez réessayer dans quelques instants.')
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return sendHtml(req, res, 404, 'Produit introuvable', "Cette référence n'existe pas ou n'est plus disponible.")
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.redirect(307, `/produit/${encodeURIComponent(data.id)}?catalogue_live=1`)
  } catch (error) {
    console.error('product-route error:', error.message)
    return sendHtml(req, res, 503, 'Catalogue temporairement indisponible', 'Veuillez réessayer dans quelques instants.')
  }
}
