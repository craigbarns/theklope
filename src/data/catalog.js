// =============================================================================
// Catalogue THEKLOPE — métadonnées légères et helpers (sans le tableau produits)
// -----------------------------------------------------------------------------
// Ce fichier ne contient AUCUNE donnée produit afin de rester minuscule et
// d'être chargé dans le bundle initial. Le gros tableau `PRODUCTS` vit dans
// `products.js`, importé dynamiquement uniquement quand on en a besoin.
// =============================================================================

export const CATEGORIES = [
  { slug: 'cigarettes-electroniques', key: 'ecig', name: 'Cigarettes électroniques', tagline: 'Kits & mods nouvelle génération' },
  { slug: 'pods', key: 'pod', name: 'Pods', tagline: 'Systèmes rechargeables compacts' },
  { slug: 'e-liquides', key: 'eliquide', name: 'E-liquides', tagline: 'Saveurs sélectionnées, dosage maîtrisé' },
  { slug: 'resistances', key: 'resistance', name: 'Résistances', tagline: 'Consommables compatibles pour entretenir votre matériel' },
  { slug: 'accessoires', key: 'accessoire', name: 'Accessoires', tagline: 'Résistances, batteries, chargeurs & étuis' },
  { slug: 'alternatives-puffs', key: 'alternative-puff', name: 'Alternatives aux puffs jetables', tagline: 'Pods et modèles rechargeables conformes pour adultes' },
  { slug: 'packs-debutants', key: 'pack', name: 'Packs débutants', tagline: 'Tout pour bien démarrer' },
  { slug: 'nouveautes', key: 'new', name: 'Nouveautés', tagline: 'Les dernières arrivées' },
  { slug: 'meilleures-ventes', key: 'best', name: 'Meilleures ventes', tagline: 'Les préférés de la communauté' },
]

export const BADGES = {
  nouveau: { label: 'Nouveau', className: 'bg-electric text-white' },
  'best-seller': { label: 'Best-seller', className: 'bg-neon text-noir' },
  promo: { label: 'Promo', className: 'bg-rose-500 text-white' },
  'stock-limite': { label: 'Stock limité', className: 'bg-amber-400 text-noir' },
}

export const categoryName = (key) => {
  const c = CATEGORIES.find((c) => c.key === key)
  return c ? c.name : key
}

export const getProductFrom = (products, id) => (products || []).find((p) => p.id === id)

const normalizedProductText = (p = {}) =>
  [p.name, p.brand, p.type, p.description, ...(p.flavors || [])].filter(Boolean).join(' ').toLowerCase()

export const isResistanceProduct = (p = {}) => {
  if (p.category !== 'accessoire') return false
  return /\b(r[eé]sistance|mesh|coil|bvc|nautilus|ito|gti)\b/i.test(normalizedProductText(p))
}

export const isAlternativePuffProduct = (p = {}) => {
  if (!['pod', 'ecig', 'pack'].includes(p.category)) return false
  return /\b(pod|rechargeable|kit|starter|xros|wenax|drag|target)\b/i.test(normalizedProductText(p))
}

export const productMatchesCategory = (product, categoryKey) => {
  if (categoryKey === 'resistance') return isResistanceProduct(product)
  if (categoryKey === 'alternative-puff') return isAlternativePuffProduct(product)
  return product?.category === categoryKey
}

export const getCatalogMeta = (products = []) => ({
  brands: [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
  types: [...new Set(products.map((p) => p.type).filter(Boolean))].sort(),
  flavors: [...new Set(products.flatMap((p) => p.flavors || []))].sort(),
  nicotineLevels: [...new Set(products.flatMap((p) => p.nicotine || []))].sort((a, b) => a - b),
  maxPrice: products.length ? Math.ceil(Math.max(1, ...products.map((p) => Number(p.price) || 0))) : 100,
})

// Complète une liste mise en avant si elle est trop courte, pour un rendu homogène.
function padList(base, extra, n) {
  const out = [...base]
  for (const p of extra) {
    if (out.length >= n) break
    if (!out.includes(p)) out.push(p)
  }
  return out
}

export const featuredProducts = (products = []) => {
  const byReviews = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
  return {
    bestSellers: padList(products.filter((p) => p.badge === 'best-seller'), byReviews, 8),
    newArrivals: padList(products.filter((p) => p.badge === 'nouveau'), byReviews.filter((p) => p.oldPrice == null), 8),
    starterPacks: padList(products.filter((p) => p.category === 'pack'), products.filter((p) => p.category === 'ecig'), 6),
  }
}

export function productsByCategorySlugFrom(products = [], slug) {
  const featured = featuredProducts(products)
  if (slug === 'nouveautes') return featured.newArrivals
  if (slug === 'meilleures-ventes') return featured.bestSellers
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return []
  return products.filter((p) => productMatchesCategory(p, cat.key))
}
