// Taux de nicotine en rupture — source de vérité PARTAGÉE entre le navigateur
// (fiche produit, panier) et le serveur (api/_lib/orderValidation.js).
//
// Le stock chiffré reste unique par produit. L'admin coche simplement les taux
// épuisés : ils restent visibles sur la fiche (grisés, « rupture ») mais ne
// peuvent plus être commandés, ni depuis le site ni par un appel direct à l'API.

const sameValue = (a, b) => {
  const left = String(a ?? '').trim().replace(',', '.')
  const right = String(b ?? '').trim().replace(',', '.')
  if (left === '' || right === '') return false
  const leftNumber = Number(left)
  const rightNumber = Number(right)
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber === rightNumber
  return left.toLocaleLowerCase('fr-FR') === right.toLocaleLowerCase('fr-FR')
}

// Ne garde que les taux réellement proposés par le produit, dans leur ordre.
// Un taux retiré de la liste ne peut donc pas rester « en rupture » fantôme.
export function normalizeNicotineOutOfStock(outOfStock, nicotine) {
  const flagged = Array.isArray(outOfStock) ? outOfStock : []
  const offered = Array.isArray(nicotine) ? nicotine : []
  return offered.filter((value) => flagged.some((entry) => sameValue(entry, value)))
}

export function isNicotineOutOfStock(product, value) {
  const flagged = Array.isArray(product?.nicotineOutOfStock) ? product.nicotineOutOfStock : []
  return flagged.some((entry) => sameValue(entry, value))
}

// Seule la nicotine porte une rupture par option aujourd'hui.
export const isVariantOptionOutOfStock = (product, key, value) => (
  key === 'nicotine' && isNicotineOutOfStock(product, value)
)

export const nicotineOutOfStockError = (product, value) => (
  `Le taux ${value} mg de ${product?.name || 'ce produit'} est en rupture. Choisissez un autre taux.`
)

export const NICOTINE_OUT_OF_STOCK_COLUMN = 'nicotine_out_of_stock'

// Colonne ajoutée par supabase/migrations/202609290001_nicotine_out_of_stock.sql.
// Tant que la migration n'a pas été exécutée, PostgREST refuse toute requête qui
// la nomme. Les appelants s'en servent pour relire / réécrire sans elle.
export const isMissingColumnError = (error, column = NICOTINE_OUT_OF_STOCK_COLUMN) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return text.includes(column)
    && (['42703', 'PGRST204'].includes(error?.code) || /does not exist|could not find/i.test(text))
}

// Tous les taux proposés sont en rupture : le produit n'est plus commandable,
// même si son stock global reste positif. Sert à l'afficher « Rupture de
// stock » partout (fiche, cartes, données structurées Google).
export function isEveryNicotineOutOfStock(product) {
  const offered = Array.isArray(product?.nicotine) ? product.nicotine.filter((v) => v !== '' && v != null) : []
  return offered.length > 0 && offered.every((value) => isNicotineOutOfStock(product, value))
}

export const isProductOrderable = (product) => (
  Number(product?.stock) > 0 && !isEveryNicotineOutOfStock(product)
)
