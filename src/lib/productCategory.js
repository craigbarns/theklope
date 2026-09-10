const normalizeCategory = (category) => String(category || '').trim().toLowerCase()

// Supabase contient encore quelques catégories éditoriales historiques
// (eliquide-fruite, eliquide-menthe, etc.). Elles décrivent toutes la même
// famille commerciale et doivent donc partager variantes, remises et parcours.
export const isEliquidCategory = (category) => {
  const normalized = normalizeCategory(category)
  return normalized === 'eliquide' || normalized.startsWith('eliquide-')
}

export const isDiyCategory = (category) => {
  const normalized = normalizeCategory(category)
  return normalized === 'diy' || normalized.startsWith('diy-')
}

// Consommables pré-remplis (cartouches de pod, puffs rechargeables). Comme les
// e-liquides, ils se déclinent en saveurs et en taux de nicotine : ce sont des
// dimensions commerciales réelles, pas des données parasites de matériel.
export const isCartoucheCategory = (category) => {
  const normalized = normalizeCategory(category)
  return normalized === 'cartouches' || normalized.startsWith('cartouches-')
}

export const isPuffCategory = (category) => normalizeCategory(category) === 'alternative-puff'

// Catégories autorisées à porter une saveur et un taux de nicotine. Le matériel
// (kits, box, pods vides) en reste exclu : ses valeurs héritées sont parasites.
export const supportsFlavorVariants = (category) => (
  isEliquidCategory(category)
  || isDiyCategory(category)
  || isCartoucheCategory(category)
  || isPuffCategory(category)
)

export const isEliquidProduct = (product = {}) => isEliquidCategory(product?.category)

export const categoryMatches = (category, expectedCategory) => {
  if (expectedCategory === 'eliquide') return isEliquidCategory(category)
  if (expectedCategory === 'diy') return isDiyCategory(category)
  return normalizeCategory(category) === normalizeCategory(expectedCategory)
}
