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

export const isEliquidProduct = (product = {}) => isEliquidCategory(product?.category)

export const categoryMatches = (category, expectedCategory) => {
  if (expectedCategory === 'eliquide') return isEliquidCategory(category)
  if (expectedCategory === 'diy') return isDiyCategory(category)
  return normalizeCategory(category) === normalizeCategory(expectedCategory)
}
