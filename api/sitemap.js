import { createClient } from '@supabase/supabase-js'
import { buildSitemapEntries, renderSitemapXml } from '../scripts/sitemap-data.mjs'

const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://www.theklope.com').replace(/\/$/, '')

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).end('Method Not Allowed')
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return serveStaticFallback(res, 'Configuration Supabase absente')
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await supabase
      .from('products')
      .select('id, created_at, updated_at')
      .order('id', { ascending: true })

    if (error) throw error
    if (!data?.length) throw new Error('Le catalogue Supabase est vide')

    const entries = buildSitemapEntries(data || [])
    const xml = renderSitemapXml(entries, BASE_URL)

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    return res.status(200).end(req.method === 'HEAD' ? undefined : xml)
  } catch (error) {
    console.error('Sitemap live indisponible:', error.message)
    return serveStaticFallback(res, 'Catalogue Supabase indisponible')
  }
}

function serveStaticFallback(res, reason) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Sitemap-Fallback', reason)
  return res.redirect(307, '/sitemap-static.xml')
}
