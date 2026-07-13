import { hasSupabaseAdmin, supabaseAdmin } from './_lib/supabaseAdmin.js'

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
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
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
