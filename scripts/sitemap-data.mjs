import { CATEGORIES } from '../src/data/catalog.js'
import { BLOG_POSTS } from '../src/data/blog.js'
import { STATIC_SEO_PAGES } from '../src/data/staticSeoPages.js'

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/boutique', changefreq: 'weekly', priority: '0.9' },
  { loc: '/categories', changefreq: 'monthly', priority: '0.8' },
  { loc: '/configurateur', changefreq: 'monthly', priority: '0.6' },
  { loc: '/calculette-diy', changefreq: 'monthly', priority: '0.5' },
  { loc: '/guides', changefreq: 'weekly', priority: '0.7' },
  { loc: '/a-propos', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/legal/mentions-legales', changefreq: 'monthly', priority: '0.4' },
  { loc: '/legal/cgv', changefreq: 'monthly', priority: '0.4' },
  { loc: '/legal/confidentialite', changefreq: 'monthly', priority: '0.4' },
  { loc: '/legal/retour', changefreq: 'monthly', priority: '0.4' },
  ...Object.keys(STATIC_SEO_PAGES).map((slug) => ({ loc: `/${slug}`, changefreq: 'monthly', priority: '0.7' })),
]

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const asDate = (value, fallback) => {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new Error(`Date de sitemap invalide : ${value}`)
  return parsed.toISOString().slice(0, 10)
}

export function buildSitemapEntries(products, today = new Date().toISOString().slice(0, 10)) {
  const candidateUrls = [
    ...STATIC_ROUTES,
    ...CATEGORIES.map((category) => ({
      loc: `/categorie/${category.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...products.map((product) => ({
      loc: `/produit/${encodeURIComponent(product.id)}`,
      lastmod: asDate(product.updatedAt || product.updated_at || product.createdAt || product.created_at, today),
      changefreq: 'weekly',
      priority: '0.6',
    })),
    ...BLOG_POSTS.map((post) => ({
      loc: `/guides/${post.slug}`,
      lastmod: asDate(post.isoDate, today),
      changefreq: 'monthly',
      priority: '0.5',
    })),
  ]

  const urlsByLocation = new Map()
  for (const url of candidateUrls) {
    if (!url.loc || url.loc.includes('undefined') || url.loc.includes('null')) {
      throw new Error(`URL de sitemap invalide : ${url.loc}`)
    }
    urlsByLocation.set(url.loc, { ...url, lastmod: url.lastmod || today })
  }
  return [...urlsByLocation.values()]
}

export function renderSitemapXml(entries, baseUrl) {
  const base = baseUrl.replace(/\/$/, '')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${xmlEscape(`${base}${entry.loc}`)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
}
