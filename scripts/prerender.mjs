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
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://www.theklope.com').replace(/\/$/, '')
const DEFAULT_OG = `${BASE_URL}/og-image.jpg`

const { enrichProductCopy } = await import(resolve(root, 'src/data/productCopy.js'))
const { CATEGORIES, categoryName, getProductCategoryKey, productMatchesCategory } = await import(resolve(root, 'src/data/catalog.js'))
const PRODUCTS = (await loadProducts()).map((product) => enrichProductCopy({
  ...product,
  category: getProductCategoryKey(product),
}))
const { CATEGORY_SEO } = await import(resolve(root, 'src/data/categorySeo.js'))
const { BLOG_POSTS } = await import(resolve(root, 'src/data/blog.js'))
const { STATIC_SEO_PAGES } = await import(resolve(root, 'src/data/staticSeoPages.js'))
const { STORE_REVIEW_SUMMARY } = await import(resolve(root, 'src/data/reviews.js'))

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

function buildPage({ title, description, canonicalPath, ogImage, ogType = 'website', jsonLd, content = '', noindex = false }) {
  const fullTitle = title
  const canonical = canonicalPath ? abs(canonicalPath) : null
  const image = ogImage || DEFAULT_OG
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
  html = replaceAttr(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, fullTitle)
  html = replaceAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta\s+property="og:type"\s+content=")[^"]*(")/, ogType)
  if (canonical) {
    html = replaceAttr(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, canonical)
  } else {
    html = html.replace(/\s*<meta\s+property="og:url"[^>]*>/, '')
  }
  html = replaceAttr(html, /(<meta\s+property="og:image"\s+content=")[^"]*(")/, image)
  html = replaceAttr(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, fullTitle)
  html = replaceAttr(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, description)
  html = replaceAttr(html, /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, image)
  if (canonical) {
    html = replaceAttr(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, canonical)
  } else {
    html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/, '')
  }
  html = replaceAttr(
    html,
    /(<meta\s+name="robots"\s+content=")[^"]*(")/,
    noindex ? 'noindex, nofollow' : 'index, follow',
  )

  if (jsonLd) {
    const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
    html = html.replace(
      '</head>',
      () => `    <script id="jsonld-schema" type="application/ld+json">${json}</script>\n  </head>`,
    )
  }
  if (content) {
    // Contenu injecté dans #root : lu par les crawlers, remplacé par React au chargement.
    html = html.replace(
      '<div id="root"></div>',
      () => `<div id="root"><div data-prerender="seo">${content}</div></div>`,
    )
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
  const catLabel = categoryName(getProductCategoryKey(p))
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
      seller: { '@type': 'Organization', name: 'THEKLOPE' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'FR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
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
  const seo = CATEGORY_SEO[c.slug]
  const inCat = PRODUCTS.filter((p) => productMatchesCategory(p, c.key)).slice(0, 40)
  const title = `${seo?.seoTitle || c.name} | THEKLOPE`
  const description = (seo?.metaDescription || `${c.name} : ${c.tagline}. Sélection THEKLOPE, livraison France, paiement sécurisé. Vente réservée aux +18.`).slice(0, 160)
  const path = `/categorie/${c.slug}`
  const links = inCat.map((p) => `<li><a href="/produit/${esc(p.id)}">${esc(p.name)} — ${esc(fmtPrice(p.price))}</a></li>`).join('')
  const sections = (seo?.sections || []).map((s) => `<h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>`).join('')
  const faq = (seo?.faq || []).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': abs(path),
        url: abs(path),
        name: seo?.h1 || c.name,
        description,
      },
      ...(seo?.faq?.length
        ? [{
            '@type': 'FAQPage',
            mainEntity: seo.faq.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }]
        : []),
    ],
  }
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/categories">Catégories</a> › <span>${esc(c.name)}</span></nav>
    <h1>${esc(seo?.h1 || c.name)}</h1>
    <p>${esc(seo?.intro || c.tagline)}</p>
    ${sections}
    <ul>${links}</ul>`
    + faq
  writePage(path, buildPage({ title, description, canonicalPath: path, jsonLd, content }))
  count++
}

// ---- Articles de blog ----
for (const b of BLOG_POSTS) {
  const title = `${b.title} | THEKLOPE`
  const description = (b.description || b.title).slice(0, 160)
  const path = `/guides/${b.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: b.title,
    description: b.description || b.title,
    image: absImg(b.image),
    datePublished: b.isoDate,
    dateModified: b.isoDate,
    author: { '@type': 'Organization', name: 'THEKLOPE' },
    publisher: { '@type': 'Organization', name: 'THEKLOPE' },
    mainEntityOfPage: abs(path),
  }
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/guides">Guides</a> › <span>${esc(b.title)}</span></nav>
    <h1>${esc(b.title)}</h1>
    <p>${esc(b.description || '')}</p>
    ${b.content}`
  writePage(path, buildPage({ title, description, canonicalPath: path, ogImage: absImg(b.image), ogType: 'article', jsonLd, content }))
  count++
}

// ---- Pages statiques clés ----
const STATIC_PAGES = [
  { path: '/boutique', title: 'Boutique vape en ligne | THEKLOPE', description: 'Boutique vape THEKLOPE : cigarettes électroniques, pods rechargeables, e-liquides, produits DIY, résistances et accessoires pour adultes. Livraison France.' },
  { path: '/categories', title: 'Catégories | THEKLOPE', description: 'Parcourez les catégories THEKLOPE : cigarettes électroniques, pods, e-liquides, produits DIY, accessoires et packs débutants.' },
  { path: '/configurateur', title: 'Configurateur de pack sur mesure (-15%) | THEKLOPE', description: 'Composez un pack cigarette électronique compatible (batterie + réservoir + e-liquide) et profitez de -15% sur le pack complet.' },
  { path: '/calculette-diy', title: 'Calculette DIY & booster de nicotine | THEKLOPE', description: 'Calculez facilement vos dosages pour fabriquer votre e-liquide maison (base, boosters, arômes) avec la calculette DIY THEKLOPE.' },
  { path: '/guides', title: 'Guides vape responsables | THEKLOPE', description: 'Guides THEKLOPE pour choisir une cigarette électronique, un e-liquide, une résistance ou un pod avec des conseils responsables pour adultes.' },
  { path: '/a-propos', title: 'À propos | THEKLOPE', description: 'THEKLOPE, boutique de vape née à Marseille (188 rue de Rome). Une sélection premium, un conseil d’expert et une expérience simple et élégante.' },
  { path: '/contact', title: 'Contact | THEKLOPE', description: 'Contactez l’équipe THEKLOPE : formulaire, e-mail et boutique à Marseille. Service client réactif.' },
  { path: '/faq', title: 'FAQ vape, livraison, nicotine et conformité | THEKLOPE', description: 'Questions fréquentes THEKLOPE : livraison, retours, paiement Mollie, produits vape réservés aux adultes, nicotine, résistances et e-liquides.' },
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

for (const [slug, page] of Object.entries(STATIC_SEO_PAGES)) {
  const path = `/${slug}`
  const title = `${page.title} | THEKLOPE`
  const description = page.metaDescription
  const sections = page.sections.map((s) => `<h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>`).join('')
  const faq = page.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')
  const links = page.links.map((l) => `<li><a href="${esc(l.to)}">${esc(l.label)}</a></li>`).join('')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': abs(path),
        url: abs(path),
        name: page.h1,
        description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      ...(page.localBusiness
        ? [{
            '@type': 'LocalBusiness',
            '@id': 'https://www.theklope.com/#store',
            name: 'THEKLOPE',
            url: 'https://www.theklope.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '188 rue de Rome',
              addressLocality: 'Marseille',
              postalCode: '13006',
              addressCountry: 'FR',
            },
            priceRange: '$$',
          }]
        : []),
    ],
  }
  const content = `
    <nav aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>${esc(page.h1)}</span></nav>
    <h1>${esc(page.h1)}</h1>
    <p>${esc(page.intro)}</p>
    ${sections}
    <ul>${links}</ul>
    ${faq}`
  writePage(path, buildPage({ title, description, canonicalPath: path, jsonLd, content }))
  count++
}

// ---- Page d'accueil (/) ----
const homeTitle = 'THEKLOPE — Boutique vape en ligne pour adultes'
const homeDescription = 'THEKLOPE — boutique vape en ligne : cigarettes électroniques, e-liquides, produits DIY, résistances et accessoires pour adultes. Livraison France, paiement Mollie sécurisé.'
const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      name: 'THEKLOPE',
      image: `${BASE_URL}/og-image.jpg`,
      '@id': 'https://www.theklope.com/#store',
      url: 'https://www.theklope.com',
      telephone: '+33491555555',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '188 rue de Rome',
        addressLocality: 'Marseille',
        postalCode: '13006',
        addressCountry: 'FR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.2905,
        longitude: 5.3801,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: STORE_REVIEW_SUMMARY.rating.toFixed(1),
        reviewCount: STORE_REVIEW_SUMMARY.count,
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.theklope.com/#website',
      url: 'https://www.theklope.com',
      name: 'THEKLOPE',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.theklope.com/boutique?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.theklope.com/#organization',
      name: 'THEKLOPE',
      url: 'https://www.theklope.com',
      logo: `${BASE_URL}/logo.png`,
    },
  ],
}

const homeContent = `
  <h1>THEKLOPE — Boutique vape en ligne pour adultes</h1>
  <p>Cigarettes électroniques, e-liquides, produits DIY, résistances et accessoires pour adultes. Livraison France, paiement Mollie sécurisé.</p>
  
  <h2>Nos Catégories de Produits Vape</h2>
  <ul>
    ${CATEGORIES.map(c => `<li><a href="/categorie/${esc(c.slug)}">${esc(c.name)} — ${esc(c.tagline)}</a></li>`).join('\n')}
  </ul>
  
  <h2>Nos Engagements & Services</h2>
  <ul>
    <li><strong>Produits testés et sélectionnés :</strong> Chaque référence est choisie pour sa fiabilité et sa qualité.</li>
    <li><strong>Livraison rapide en France :</strong> Expédition sous 24/48h, livraison offerte dès 49€.</li>
    <li><strong>Paiement 100% sécurisé :</strong> Transactions chiffrées avec Mollie, vos données sont protégées.</li>
    <li><strong>Service client réactif :</strong> Une équipe disponible pour vous accompagner.</li>
  </ul>
  
  <h2>Boutique de vape physique à Marseille</h2>
  <p>Retrouvez-nous également dans notre boutique physique au 188 rue de Rome, 13006 Marseille.</p>
  <p><a href="/boutique-vape-marseille">En savoir plus sur notre boutique de Marseille</a></p>
  
  <h2>Guides & Conseils Vape</h2>
  <ul>
    <li><a href="/guides/quelle-cigarette-electronique-choisir">Comment choisir sa cigarette électronique</a></li>
    <li><a href="/guides/choisir-taux-nicotine-e-liquide">Comprendre les taux de nicotine</a></li>
    <li><a href="/guides/quand-changer-resistance">Quand changer sa résistance de cigarette électronique</a></li>
  </ul>
`

writePage('/', buildPage({ title: homeTitle, description: homeDescription, canonicalPath: '/', jsonLd: homeSchema, content: homeContent }))
count++

// Vercel sert automatiquement 404.html avec un vrai statut HTTP 404 lorsque
// aucune route pré-rendue ou réécriture applicative ne correspond.
const notFoundHtml = buildPage({
  title: 'Page introuvable | THEKLOPE',
  description: "La page demandée n'existe pas ou n'est plus disponible.",
  canonicalPath: null,
  noindex: true,
  content: `
    <h1>Page introuvable</h1>
    <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
    <p><a href="/">Retour à l'accueil</a> · <a href="/boutique">Voir la boutique</a></p>`,
})
writeFileSync(resolve(dist, '404.html'), notFoundHtml)

console.log(`✓ Pré-rendu SEO : ${count} pages générées (${PRODUCTS.length} produits, ${CATEGORIES.length} catégories, ${BLOG_POSTS.length} articles, ${STATIC_PAGES.length + Object.keys(STATIC_SEO_PAGES).length + 1} pages statiques).`)
