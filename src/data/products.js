// =============================================================================
// Catalogue THEKLOPE — Catalogue vierge pour mise en production des vrais produits.
// =============================================================================

export const CATEGORIES = [
  { slug: 'cigarettes-electroniques', key: 'ecig', name: 'Cigarettes électroniques', tagline: 'Kits & mods nouvelle génération' },
  { slug: 'pods', key: 'pod', name: 'Pods', tagline: 'Systèmes rechargeables compacts' },
  { slug: 'e-liquides', key: 'eliquide', name: 'E-liquides', tagline: 'Saveurs sélectionnées, dosage maîtrisé' },
  { slug: 'accessoires', key: 'accessoire', name: 'Accessoires', tagline: 'Résistances, batteries, chargeurs & étuis' },
  { slug: 'packs-debutants', key: 'pack', name: 'Packs débutants', tagline: 'Tout pour bien démarrer' },
  { slug: 'nouveautes', key: 'new', name: 'Nouveautés', tagline: 'Les dernières arrivées' },
  { slug: 'meilleures-ventes', key: 'best', name: 'Meilleures ventes', tagline: 'Les préférés de la communauté' },
]

export const PRODUCTS = []

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].sort()
export const TYPES = [...new Set(PRODUCTS.map((p) => p.type).filter(Boolean))].sort()
export const FLAVORS = [...new Set(PRODUCTS.flatMap((p) => p.flavors || []))].sort()
export const NICOTINE_LEVELS = [...new Set(PRODUCTS.flatMap((p) => p.nicotine || []))].sort((a, b) => a - b)
export const MAX_PRICE = PRODUCTS.length > 0 ? Math.ceil(Math.max(1, ...PRODUCTS.map((p) => Number(p.price) || 0))) : 100

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)

export const categoryName = (key) => {
  const c = CATEGORIES.find((c) => c.key === key)
  return c ? c.name : key
}

export function productsByCategorySlug(slug) {
  if (slug === 'nouveautes') return NEW_ARRIVALS
  if (slug === 'meilleures-ventes') return BEST_SELLERS
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return []
  return PRODUCTS.filter((p) => p.category === cat.key)
}

export const BADGES = {
  nouveau: { label: 'Nouveau', className: 'bg-electric text-white' },
  'best-seller': { label: 'Best-seller', className: 'bg-neon text-noir' },
  promo: { label: 'Promo', className: 'bg-rose-500 text-white' },
  'stock-limite': { label: 'Stock limité', className: 'bg-amber-400 text-noir' },
}

// Listes mises en avant — complétées si trop courtes pour un rendu homogène
function padList(base, extra, n) {
  const out = [...base]
  for (const p of extra) {
    if (out.length >= n) break
    if (!out.includes(p)) out.push(p)
  }
  return out
}

export const getProductFrom = (products, id) => products.find((p) => p.id === id)

export const getCatalogMeta = (products = PRODUCTS) => ({
  brands: [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
  types: [...new Set(products.map((p) => p.type).filter(Boolean))].sort(),
  flavors: [...new Set(products.flatMap((p) => p.flavors || []))].sort(),
  nicotineLevels: [...new Set(products.flatMap((p) => p.nicotine || []))].sort((a, b) => a - b),
  maxPrice: Math.ceil(Math.max(1, ...products.map((p) => Number(p.price) || 0))),
})

export const featuredProducts = (products = PRODUCTS) => {
  const byReviews = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
  return {
    bestSellers: padList(
      products.filter((p) => p.badge === 'best-seller'),
      byReviews,
      8,
    ),
    newArrivals: padList(
      products.filter((p) => p.badge === 'nouveau'),
      byReviews.filter((p) => p.oldPrice == null),
      8,
    ),
    starterPacks: padList(
      products.filter((p) => p.category === 'pack'),
      products.filter((p) => p.category === 'ecig'),
      6,
    ),
  }
}

export function productsByCategorySlugFrom(products = PRODUCTS, slug) {
  const featured = featuredProducts(products)
  if (slug === 'nouveautes') return featured.newArrivals
  if (slug === 'meilleures-ventes') return featured.bestSellers
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return []
  return products.filter((p) => p.category === cat.key)
}

const byReviews = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews)

export const BEST_SELLERS = padList(
  PRODUCTS.filter((p) => p.badge === 'best-seller'),
  byReviews,
  8,
)
export const NEW_ARRIVALS = padList(
  PRODUCTS.filter((p) => p.badge === 'nouveau'),
  byReviews.filter((p) => p.oldPrice == null),
  8,
)
export const STARTER_PACKS = padList(
  PRODUCTS.filter((p) => p.category === 'pack'),
  PRODUCTS.filter((p) => p.category === 'ecig'),
  6,
)
