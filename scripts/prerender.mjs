// =============================================================================
// Pré-rendu SEO (postbuild) — SANS navigateur headless.
// -----------------------------------------------------------------------------
// Le site est un SPA : le HTML servi ne contient que <div id="root">. Les
// crawlers qui n'exécutent pas JS (bots sociaux, une partie de Bing/GPTBot…)
// voient donc une page vide. Ce script génère, à partir du catalogue statique,
// un fichier HTML par route (produit, catégorie, blog, pages clés) avec :
//   - un <title>, une meta description, un canonical et des balises OpenGraph
//     /Twitter spécifiques à la page ;
//   - un JSON-LD structuré (Product, BreadcrumbList…) ;
//   - un bloc de contenu réel (titre, prix, description, liens internes) injecté
//     dans #root pour que les crawlers aient du texte à indexer.
// Au chargement, React (createRoot) remplace #root par l'app : les visiteurs
// voient le SPA normal, les robots voient le contenu pré-rendu.
// =============================================================================
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadProducts } from './load-catalog.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dist = resolve(root, 'dist')
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://theklope.com').replace(/\/$/, '')
const DEFAULT_OG = `${BASE_URL}/og-image.jpg`

const PRODUCTS = await loadProducts()
const { CATEGORIES, categoryName } = await import(resolve(root, 'src/data/catalog.js'))
const { BLOG_POSTS } = await import(resolve(root, 'src/data/blog.js'))

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fmtPrice = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)
const abs = (path) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
const absImg = (img) => (!img ? DEFAULT_OG : /^https?:/.test(img) ? img : abs(img))

// Remplace le contenu d'une balise meta/link/title dans le template HTML.
const replaceAttr = (html, re, value) => html.replace(re, (_m, p1, p2) => `${p1}${esc(value)}${p2}`)

function buildPage({ title, description, canonicalPath, ogImage, ogType = 'website', jsonLd, content = '' }) {
  const fullTitle = title
  const canonical = abs(canonicalPath)
  const image = ogImage || DEFAULT_OG
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
  html = replaceAttr(html, /(<meta name="description" content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta property="og:title" content=")[^"]*(")/, fullTitle)
  html = replaceAttr(html, /(<meta property="og:description" content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta property="og:type" content=")[^"]*(")/, ogType)
  html = replaceAttr(html, /(<meta property="og:url" content=")[^"]*(")/, canonical)
  html = replaceAttr(html, /(<meta property="og:image" content=")[^"]*(")/, image)
  html = replaceAttr(html, /(<meta name="twitter:title" content=")[^"]*(")/, fullTitle)
  html = replaceAttr(html, /(<meta name="twitter:description" content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta name="twitter:image" content=")[^"]*(")/, image)
  html = replaceAttr(html, /(<link rel="canonical" href=")[^"]*(")/, canonical)

  if (jsonLd) {
    const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
    html = html.replace('</head>', `    <script type="application/ld+json">${json}</script>\n  </head>`)
  }
  if (content) {
    // Contenu injecté dans #root : lu par les crawlers, remplacé par React au chargement.
    html = html.replace('<div id="root"></div>', `<div id="root"><div data-prerender="seo">${content}</div></div>`)
  }
  return html
}

function writePage(routePath, html) {
  const clean = routePath.replace(/^\/+|\/+$/g, '')
  const dir = clean ? resolve(dist, clean) : dist
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), html)
}

let count = 0

// ---- Produits ----
for (const p of PRODUCTS) {
  const catLabel = categoryName(p.category)
  const title = `${p.name} — ${catLabel} | THEKLOPE`
  const description = (p.short || p.long || `${p.name} disponible chez THEKLOPE.`).slice(0, 160)
  const path = `/produit/${p.id}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: [absImg(p.image)],
    description: p.long || p.short || p.name,
    sku: p.id,
    brand: { '@type': 'Brand', name: p.brand || 'THEKLOPE' },
    offers: {
      '@type': 'Offer',
      url: abs(path),
      priceCurrency: 'EUR',
      price: (Number(p.price) || 0).toFixed(2),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      itemCondition: 'https://schema.org/NewCondition',
      availability: (p.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(p.reviews > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: (Number(p.rating) || 0).toFixed(1), reviewCount: p.reviews } }
      : {}),
  }
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/boutique">Boutique</a> › <span>${esc(catLabel)}</span></nav>
    <h1>${esc(p.name)}</h1>
    <p>${esc(p.brand || 'THEKLOPE')} · ${esc(p.type || catLabel)}</p>
    <p><strong>${esc(fmtPrice(p.price))}</strong>${p.oldPrice ? ` <s>${esc(fmtPrice(p.oldPrice))}</s>` : ''}</p>
    <p>${esc(p.long || p.short || '')}</p>
    <p><a href="/boutique">Voir toute la boutique THEKLOPE</a></p>`
  writePage(path, buildPage({ title, description, canonicalPath: path, ogImage: absImg(p.image), ogType: 'product', jsonLd, content }))
  count++
}

// ---- Catégories ----
for (const c of CATEGORIES) {
  const inCat = PRODUCTS.filter((p) => p.category === c.key).slice(0, 40)
  const title = `${c.name} — ${c.tagline} | THEKLOPE`
  const description = `${c.name} : ${c.tagline}. Sélection THEKLOPE, livraison 24/48h en France, paiement sécurisé. Vente réservée aux +18.`.slice(0, 160)
  const path = `/categorie/${c.slug}`
  const links = inCat.map((p) => `<li><a href="/produit/${esc(p.id)}">${esc(p.name)} — ${esc(fmtPrice(p.price))}</a></li>`).join('')
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/categories">Catégories</a> › <span>${esc(c.name)}</span></nav>
    <h1>${esc(c.name)}</h1>
    <p>${esc(c.tagline)}</p>
    <ul>${links}</ul>`
  writePage(path, buildPage({ title, description, canonicalPath: path, jsonLd: null, content }))
  count++
}

// ---- Articles de blog ----
for (const b of BLOG_POSTS) {
  const title = `${b.title} | THEKLOPE`
  const description = (b.description || b.title).slice(0, 160)
  const path = `/blog/${b.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: b.title,
    description: b.description || b.title,
    image: DEFAULT_OG,
    author: { '@type': 'Organization', name: 'THEKLOPE' },
    publisher: { '@type': 'Organization', name: 'THEKLOPE' },
    mainEntityOfPage: abs(path),
  }
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/blog">Blog</a> › <span>${esc(b.title)}</span></nav>
    <h1>${esc(b.title)}</h1>
    <p>${esc(b.description || '')}</p>`
  writePage(path, buildPage({ title, description, canonicalPath: path, ogType: 'article', jsonLd, content }))
  count++
}

// ---- Pages statiques clés ----
const STATIC_PAGES = [
  { path: '/boutique', title: 'Boutique — Cigarettes électroniques, e-liquides & accessoires | THEKLOPE', description: 'Toute la boutique THEKLOPE : cigarettes électroniques, pods, e-liquides et accessoires sélectionnés. Livraison 24/48h, paiement sécurisé, +18.' },
  { path: '/categories', title: 'Catégories | THEKLOPE', description: 'Parcourez les catégories THEKLOPE : cigarettes électroniques, pods, e-liquides, accessoires et packs débutants.' },
  { path: '/configurateur', title: 'Configurateur de pack sur mesure (-15%) | THEKLOPE', description: 'Composez votre cigarette électronique idéale (batterie + réservoir + e-liquide) et profitez de -15% sur le pack complet.' },
  { path: '/calculette-diy', title: 'Calculette DIY & booster de nicotine | THEKLOPE', description: 'Calculez facilement vos dosages pour fabriquer votre e-liquide maison (base, boosters, arômes) avec la calculette DIY THEKLOPE.' },
  { path: '/blog', title: 'Blog & guides vape | THEKLOPE', description: 'Conseils, guides et actualités sur la vape : choix du taux de nicotine, DIY, entretien du matériel et plus encore.' },
  { path: '/a-propos', title: 'À propos | THEKLOPE', description: 'THEKLOPE, boutique de vape née à Marseille (188 rue de Rome). Une sélection premium, un conseil d’expert et une expérience simple et élégante.' },
  { path: '/contact', title: 'Contact | THEKLOPE', description: 'Contactez l’équipe THEKLOPE : formulaire, e-mail et boutique à Marseille. Service client réactif.' },
  { path: '/faq', title: 'FAQ — Livraison, retours, paiement | THEKLOPE', description: 'Questions fréquentes THEKLOPE : délais de livraison, retours, paiement sécurisé, taux de nicotine et matériel.' },
  { path: '/legal/mentions-legales', title: 'Mentions légales | THEKLOPE', description: 'Mentions légales du site THEKLOPE, édité par SEVEN SEVENTY (SASU).' },
  { path: '/legal/cgv', title: 'Conditions générales de vente | THEKLOPE', description: 'Conditions générales de vente du site THEKLOPE.' },
  { path: '/legal/confidentialite', title: 'Politique de confidentialité | THEKLOPE', description: 'Politique de confidentialité et gestion des données personnelles (RGPD) de THEKLOPE.' },
  { path: '/legal/retour', title: 'Politique de retour | THEKLOPE', description: 'Modalités de retour et de remboursement des produits THEKLOPE.' },
]
for (const s of STATIC_PAGES) {
  const content = `<h1>${esc(s.title.split(' | ')[0].split(' — ')[0])}</h1><p>${esc(s.description)}</p>`
  writePage(s.path, buildPage({ title: s.title, description: s.description, canonicalPath: s.path, content }))
  count++
}

console.log(`✓ Pré-rendu SEO : ${count} pages générées (${PRODUCTS.length} produits, ${CATEGORIES.length} catégories, ${BLOG_POSTS.length} articles, ${STATIC_PAGES.length} pages statiques).`)
