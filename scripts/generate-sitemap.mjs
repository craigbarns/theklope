// Génère public/sitemap.xml à partir du catalogue réel (produits, catégories,
// articles de blog) + pages statiques. Exécuté avant `vite build`.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const { loadProducts } = await import(resolve(root, 'scripts/load-catalog.mjs'))
const PRODUCTS = await loadProducts()
const { CATEGORIES } = await import(resolve(root, 'src/data/catalog.js'))
const { BLOG_POSTS } = await import(resolve(root, 'src/data/blog.js'))
const { STATIC_SEO_PAGES } = await import(resolve(root, 'src/data/staticSeoPages.js'))

const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://theklope.com').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

const staticRoutes = [
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

const urls = [
  ...staticRoutes,
  ...CATEGORIES.map((c) => ({ loc: `/categorie/${c.slug}`, changefreq: 'weekly', priority: '0.7' })),
  ...PRODUCTS.map((p) => ({ loc: `/produit/${p.id}`, changefreq: 'weekly', priority: '0.6' })),
  ...BLOG_POSTS.map((b) => ({ loc: `/guides/${b.slug}`, changefreq: 'monthly', priority: '0.5' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
console.log(`✓ sitemap.xml généré : ${urls.length} URLs (${PRODUCTS.length} produits, ${CATEGORIES.length} catégories, ${BLOG_POSTS.length} articles)`)
