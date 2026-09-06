// =============================================================================
// Catalogue THEKLOPE — métadonnées légères et helpers (sans le tableau produits)
// -----------------------------------------------------------------------------
// Ce fichier ne contient AUCUNE donnée produit afin de rester minuscule et
// d'être chargé dans le bundle initial. Le gros tableau `PRODUCTS` vit dans
// `products.js`, importé dynamiquement uniquement quand on en a besoin.
// =============================================================================

import { isEliquidProduct } from '../lib/productCategory.js'

export const CATEGORIES = [
  { slug: 'cigarettes-electroniques', key: 'ecig', name: 'Cigarettes électroniques', tagline: 'Kits & mods nouvelle génération' },
  { slug: 'pods', key: 'pod', name: 'Pods', tagline: 'Systèmes rechargeables compacts' },
  { slug: 'e-liquides', key: 'eliquide', name: 'E-liquides', tagline: 'Saveurs sélectionnées, dosage maîtrisé' },
  { slug: 'e-liquides-sels-de-nicotine', key: 'sels-nicotine', name: 'E-liquides Sels de nicotine', tagline: 'Douceur en gorge et sevrage efficace' },
  { slug: 'e-liquides-50ml', key: 'eliquide-50ml', name: 'E-liquides 50 ml', tagline: 'Grands formats économiques à booster' },
  { slug: 'e-liquides-100ml', key: 'eliquide-100ml', name: 'E-liquides 100 ml', tagline: 'Très grands formats XL' },
  { slug: 'e-liquides-tabac', key: 'eliquide-tabac', name: 'E-liquides Tabac & Classic', tagline: 'Saveurs blondes et riches' },
  { slug: 'e-liquides-fruites', key: 'eliquide-fruite', name: 'E-liquides Fruités', tagline: 'Fruits rouges, mangue, fraise' },
  { slug: 'e-liquides-menthe', key: 'eliquide-menthe', name: 'E-liquides Menthe & Frais', tagline: 'Sensations intenses et fraîches' },
  { slug: 'e-liquides-gourmands', key: 'eliquide-gourmand', name: 'E-liquides Gourmands', tagline: 'Vanille, caramel, dessert' },
  { slug: 'diy', key: 'diy', name: 'DIY', tagline: 'Bases, boosters, arômes & flacons' },
  { slug: 'diy-bases', key: 'diy-bases', name: 'Bases e-liquide DIY', tagline: 'Bases neutres 50/50 et PG/VG' },
  { slug: 'diy-aromes', key: 'diy-aromes', name: 'Arômes Concentrés DIY', tagline: 'Concentrés de saveurs à diluer' },
  { slug: 'diy-boosters', key: 'diy-boosters', name: 'Boosters de Nicotine', tagline: 'Boosters 20mg et sel de nicotine' },
  { slug: 'resistances', key: 'resistance', name: 'Résistances', tagline: 'Consommables compatibles pour entretenir votre matériel' },
  { slug: 'cartouches', key: 'cartouches', name: 'Cartouches', tagline: 'Cartouches et réservoirs pods (toutes marques)' },
  { slug: 'resistances-geekvape-z', key: 'resistances-geekvape-z', name: 'Résistances Z Coil Geekvape', tagline: 'Résistances pour clearomiseurs Z Subohm' },
  { slug: 'resistances-pnp-voopoo', key: 'resistances-pnp-voopoo', name: 'Résistances PnP Voopoo', tagline: 'Résistances PnP et PnP-X pour Drag et Argus' },
  { slug: 'resistances-zenith-innokin', key: 'resistances-zenith-innokin', name: 'Résistances Zenith Innokin', tagline: 'Résistances Z-Coil pour Zenith et Zlide' },
  { slug: 'accessoires', key: 'accessoire', name: 'Accessoires', tagline: 'Résistances, batteries, chargeurs & étuis' },
  { slug: 'accessoires-accus', key: 'accessoires-accus', name: 'Accus', tagline: 'Batteries et accus 18650, 21700' },
  { slug: 'accessoires-chargeurs', key: 'accessoires-chargeurs', name: 'Chargeurs', tagline: 'Chargeurs d’accus et câbles USB-C' },
  { slug: 'accessoires-clearo-tanks', key: 'accessoires-clearo-tanks', name: 'Clearo / Tanks', tagline: 'Clearomiseurs et réservoirs vape' },
  { slug: 'accessoires-pyrex', key: 'accessoires-pyrex', name: 'Pyrex', tagline: 'Tubes en verre Pyrex de remplacement' },
  { slug: 'puffs-rechargeables', key: 'alternative-puff', name: 'Puffs rechargeables & alternatives', tagline: 'Systèmes légaux, économiques et écologiques' },
  { slug: 'packs-debutants', key: 'pack', name: 'Packs débutants', tagline: 'Tout pour bien démarrer' },
  
  // Pages Marques
  { slug: 'marque-vaporesso', key: 'brand-vaporesso', name: 'Vaporesso', tagline: 'Kits, pods XROS et résistances Vaporesso' },
  { slug: 'marque-geekvape', key: 'brand-geekvape', name: 'Geekvape', tagline: 'Box Aegis, pods Wenax et résistances Z-Coil' },
  { slug: 'marque-voopoo', key: 'brand-voopoo', name: 'Voopoo', tagline: 'Pods Drag, Argus et résistances PnP' },
  { slug: 'marque-oxva', key: 'brand-oxva', name: 'OXVA', tagline: 'Pods Xlim et cartouches de précision' },
  { slug: 'marque-aspire', key: 'brand-aspire', name: 'Aspire', tagline: 'Clearomiseurs Nautilus et kits légendaires' },
  { slug: 'marque-innokin', key: 'brand-innokin', name: 'Innokin', tagline: 'Kits Zenith, Zlide et consommables d’excellence' },
  { slug: 'marque-justfog', key: 'brand-justfog', name: 'Justfog', tagline: 'Kits Q16 et consommables compacts' },
  { slug: 'marque-liquideo', key: 'brand-liquideo', name: 'Liquideo', tagline: 'E-liquides Freeze, Wpuff et séries cultes' },
  { slug: 'marque-freaks', key: 'brand-freaks', name: 'Freaks', tagline: 'E-liquides originaux et recettes intenses' },
  { slug: 'marque-liquidarom', key: 'brand-liquidarom', name: 'Liquidarom', tagline: 'Saveurs françaises et classiques incontournables' },
  { slug: 'marque-alfaliquid', key: 'brand-alfaliquid', name: 'Alfaliquid', tagline: 'Le leader français des e-liquides (FR-M, FR-4)' },
  { slug: 'marque-tjuice', key: 'brand-tjuice', name: 'T-Juice', tagline: 'Red Astaire et recettes mythiques britanniques' },
  { slug: 'marque-vampire-vape', key: 'brand-vampirevape', name: 'Vampire Vape', tagline: 'Heisenberg, Pinkman et concentrés iconiques' },
  { slug: 'marque-pulp', key: 'brand-pulp', name: 'Pulp', tagline: 'E-liquides authentiques et réalistes' },
  { slug: 'marque-petit-nuage', key: 'brand-petitnuage', name: 'Petit Nuage', tagline: 'Saveurs douces et gourmandes en 60ml' },
  { slug: 'marque-fruizee', key: 'brand-fruizee', name: 'Fruizee', tagline: 'E-liquides ultra-frais et fruités de Eliquid France' },
  { slug: 'marque-jnr', key: 'brand-jnr', name: 'JNR Vape', tagline: 'E-liquides et rechargeables au goût de puff' },

  { slug: 'nouveautes', key: 'new', name: 'Nouveautés', tagline: 'Les dernières arrivées' },
  { slug: 'meilleures-ventes', key: 'best', name: 'Sélection du catalogue', tagline: 'Références disponibles sélectionnées par la boutique' },
]

export const BADGES = {
  nouveau: { label: 'Nouveau', className: 'bg-electric text-white' },
  'best-seller': { label: 'Best-seller', className: 'bg-neon text-noir' },
  promo: { label: 'PRIX ROUGE', className: 'bg-rose-500 text-white' },
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
  if (p.category === 'resistance' || p.type === 'Résistance') return true
  if (['cartouches', 'cartouches-xros'].includes(p.category) || p.type === 'Cartouche') return false
  if (p.category !== 'accessoire') return false
  const resistanceText = [normalizedProductText(p), p.image, ...(p.images || [])].filter(Boolean).join(' ')
  return /\b(r[eé]sistances?|cartouches?|mesh|coils?|bvc|nautilus|ito|gti|pnp|tpp|gt\s*core)\b/i.test(resistanceText)
}

export const isCartoucheProduct = (p = {}) => {
  if (['cartouches', 'cartouches-xros'].includes(p.category) || p.type === 'Cartouche') return true
  const text = normalizedProductText(p)
  return /\b(cartouches?)\b/i.test(text)
}
export const isCartouchesXros = isCartoucheProduct

export const isAccusProduct = (p = {}) => p.category === 'accessoires-accus' || p.type === 'Accu' || ((p.category === 'accessoire' || p.type === 'Accu') && /\b(accus?|18650|21700|20700|battery|batterie|pile)\b/i.test(normalizedProductText(p)))
export const isChargeursProduct = (p = {}) => p.category === 'accessoires-chargeurs' || p.type === 'Chargeur' || ((p.category === 'accessoire' || p.type === 'Chargeur') && /\b(chargeurs?|c[aâ]ble|secteur|usb|usb-c|fast\s+charge)\b/i.test(normalizedProductText(p)))
export const isClearoTanksProduct = (p = {}) => p.category === 'accessoires-clearo-tanks' || p.type === 'Clearomiseur' || ((p.category === 'accessoire' || p.category === 'resistance' || p.type === 'Clearomiseur') && /\b(clearomiseurs?|tanks?|atomiseurs?|drip|reconstructible)\b/i.test(normalizedProductText(p)))
export const isPyrexProduct = (p = {}) => p.category === 'accessoires-pyrex' || p.type === 'Pyrex' || ((p.category === 'accessoire' || p.type === 'Pyrex') && /\b(pyrex|verre|tube|bulb|remplacement)\b/i.test(normalizedProductText(p)))

export const isAlternativePuffProduct = (p = {}) => {
  if (!['pod', 'ecig', 'pack'].includes(p.category)) return false
  return /\b(pod|rechargeable|kit|starter|xros|wenax|drag|target|dojo|jnr|tornado)\b/i.test(normalizedProductText(p))
}

export const isDiyProduct = (p = {}) => {
  if (p.category === 'diy') return true
  if (p.category !== 'accessoire') return false
  const text = normalizedProductText(p)
  return /\b(diy|boosters?|bases?\s+(?:neutres?|pg|vg|\d+\s*\/\s*\d+)|bouteilles?\s+vides?|flacons?\s+vides?|fioles?\s+gradu[eé]es?|ar[oô]mes?\s+concentr[eé]s?)\b/i.test(text)
}

export const isPackProduct = (p = {}) => {
  if (p.category === 'pack') return true
  if (p.category === 'ecig' || p.category === 'pod') return true
  return false
}

export const isSelsNicotine = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  return /\b(sel|sels)\s+de\s+nicotine\b/i.test(normalizedProductText(p)) || p.nicotine?.includes(20)
}

export const isEliquide50ml = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  return /\b50\s*ml\b/i.test(normalizedProductText(p)) || p.volume === 50
}

export const isEliquide100ml = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  return /\b100\s*ml\b/i.test(normalizedProductText(p)) || p.volume === 100
}

export const isEliquideTabac = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  if (p.category === 'eliquide-tabac') return true
  const text = normalizedProductText(p)
  return /\b(tabac|classic|blond|brun|virginia)\b/i.test(text)
}

export const isEliquideFruite = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  if (p.category === 'eliquide-fruite') return true
  const text = normalizedProductText(p)
  return /\b(fruit[eé]s?|fraise|framboise|mangue|p[eê]che|abricot|pomme|melon|pasteque|fruits?\s+rouges?|citron|cassis|fruits?\s+des\s+bois)\b/i.test(text)
}

export const isEliquideMenthe = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  if (p.category === 'eliquide-menthe') return true
  const text = normalizedProductText(p)
  return /\b(menthe|frais|glaciale|eucalyptus|freeze|ice)\b/i.test(text)
}

export const isEliquideGourmand = (p = {}) => {
  if (!isEliquidProduct(p)) return false
  if (p.category === 'eliquide-gourmand') return true
  const text = normalizedProductText(p)
  return /\b(gourmands?|vanille|caramel|caf[eé]|biscuit|tarte|noisette|chocolat|pop-corn)\b/i.test(text)
}

export const isDiyBases = (p = {}) => isDiyProduct(p) && /\b(base|neutre|1l|1000ml|liter)\b/i.test(normalizedProductText(p))
export const isDiyAromes = (p = {}) => isDiyProduct(p) && /\b(ar[oô]me|concentr[eé])\b/i.test(normalizedProductText(p))
export const isDiyBoosters = (p = {}) => isDiyProduct(p) && /\b(booster|nicotine)\b/i.test(normalizedProductText(p))

export const isGeekvapeZCoil = (p = {}) => (p.category === 'resistance' || p.category === 'accessoire') && /\b(z\s*coils?|z\s*subohm|geekvape\s+z)\b/i.test(normalizedProductText(p))
export const isVoopooPnP = (p = {}) => (p.category === 'resistance' || p.category === 'accessoire') && /\b(pnp|pnp-x|voopoo)\b/i.test(normalizedProductText(p))
export const isInnokinZenith = (p = {}) => (p.category === 'resistance' || p.category === 'accessoire') && /\b(zenith|zlide|z-coil)\b/i.test(normalizedProductText(p))


export const getProductCategoryKey = (product = {}) => (isDiyProduct(product) ? 'diy' : product.category)

export const productMatchesCategory = (product, categoryKey) => {
  if (categoryKey.startsWith('brand-')) {
    const brandName = categoryKey.replace('brand-', '').toLowerCase()
    const pBrand = (product.brand || '').toLowerCase()
    const pText = normalizedProductText(product)
    return pBrand.includes(brandName) || pText.includes(brandName)
  }
  if (categoryKey === 'resistance') return isResistanceProduct(product)
  if (categoryKey === 'eliquide') return isEliquidProduct(product)
  if (categoryKey === 'alternative-puff') return isAlternativePuffProduct(product)
  if (categoryKey === 'pack') return isPackProduct(product)
  if (categoryKey === 'sels-nicotine') return isSelsNicotine(product)
  if (categoryKey === 'eliquide-50ml') return isEliquide50ml(product)
  if (categoryKey === 'eliquide-100ml') return isEliquide100ml(product)
  if (categoryKey === 'eliquide-tabac') return isEliquideTabac(product)
  if (categoryKey === 'eliquide-fruite') return isEliquideFruite(product)
  if (categoryKey === 'eliquide-menthe') return isEliquideMenthe(product)
  if (categoryKey === 'eliquide-gourmand') return isEliquideGourmand(product)
  if (categoryKey === 'diy-bases') return isDiyBases(product)
  if (categoryKey === 'diy-aromes') return isDiyAromes(product)
  if (categoryKey === 'diy-boosters') return isDiyBoosters(product)
  if (['cartouches', 'cartouches-xros'].includes(categoryKey)) return isCartoucheProduct(product)
  if (categoryKey === 'resistances-geekvape-z') return isGeekvapeZCoil(product)
  if (categoryKey === 'resistances-pnp-voopoo') return isVoopooPnP(product)
  if (categoryKey === 'resistances-zenith-innokin') return isInnokinZenith(product)
  if (categoryKey === 'accessoires-accus') return isAccusProduct(product)
  if (categoryKey === 'accessoires-chargeurs') return isChargeursProduct(product)
  if (categoryKey === 'accessoires-clearo-tanks') return isClearoTanksProduct(product)
  if (categoryKey === 'accessoires-pyrex') return isPyrexProduct(product)
  return getProductCategoryKey(product) === categoryKey
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

const MERCHANDISING_BADGE_RANK = Object.freeze({
  'best-seller': 4,
  nouveau: 3,
  promo: 2,
  'stock-limite': 1,
})

// Le catalogue ne contient pas de ventes/avis produit vérifiés. L'ordre par
// défaut repose donc uniquement sur les sélections éditoriales explicites et
// conserve l'ordre source à égalité, sans fabriquer une notion de popularité.
export const sortProductsByMerchandising = (products = []) => products
  .map((product, index) => ({ product, index }))
  .sort((a, b) => {
    const stockDelta = Number(b.product.stock > 0) - Number(a.product.stock > 0)
    if (stockDelta) return stockDelta
    const badgeDelta = (MERCHANDISING_BADGE_RANK[b.product.badge] || 0)
      - (MERCHANDISING_BADGE_RANK[a.product.badge] || 0)
    return badgeDelta || a.index - b.index
  })
  .map(({ product }) => product)

export const featuredProducts = (products = []) => {
  const merchandising = sortProductsByMerchandising(products)
  return {
    bestSellers: padList(products.filter((p) => p.badge === 'best-seller'), merchandising, 8),
    newArrivals: padList(products.filter((p) => p.badge === 'nouveau'), merchandising.filter((p) => p.oldPrice == null), 8),
    starterPacks: padList(products.filter((p) => p.category === 'pack'), products.filter((p) => p.category === 'ecig'), 6),
  }
}

const createdAtTime = (product = {}) => {
  const timestamp = Date.parse(product.createdAt || product.created_at || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const selectHomeHeroProduct = (products = []) => {
  const newProducts = products.filter((product) => product.badge === 'nouveau')
  const latestNewProduct = newProducts.reduce((selected, product) => {
    if (!selected) return product
    return createdAtTime(product) > createdAtTime(selected) ? product : selected
  }, null)

  return latestNewProduct
    || products.find((product) => product.badge === 'best-seller')
    || products[0]
}

export function productsByCategorySlugFrom(products = [], slug) {
  const featured = featuredProducts(products)
  if (slug === 'nouveautes') return featured.newArrivals
  if (slug === 'meilleures-ventes') return featured.bestSellers
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return []
  return products.filter((p) => productMatchesCategory(p, cat.key))
}
