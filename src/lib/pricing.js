// =============================================================================
// Tarification THEKLOPE — source de vérité PARTAGÉE entre le client (Vite) et
// les fonctions serverless (api/). Le serveur recalcule toujours le montant à
// partir d'ici ; le client s'en sert pour afficher des totaux identiques.
// Ne jamais faire confiance à un montant envoyé par le navigateur.
// =============================================================================

export const FREE_SHIPPING_THRESHOLD = 49
export const DEFAULT_SHIPPING_COST = 4.9

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', detail: '2–3 jours ouvrés', price: 4.9 },
  { id: 'express', label: 'Express', detail: '24h en France', price: 8.9 },
  { id: 'pickup', label: 'Point relais', detail: '2–4 jours ouvrés', price: 2.9 },
]

export const PROMO_CODES = {
  THEKLOPE10: { type: 'percent', value: 10, label: '-10%' },
  BIENVENUE: { type: 'percent', value: 15, label: '-15% première commande' },
  LIVRAISON: { type: 'shipping', value: 0, label: 'Livraison offerte' },
  PACK15: { type: 'percent', value: 15, label: '-15% Pack Sur Mesure' },
}

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

export const getShippingMethod = (id) =>
  SHIPPING_METHODS.find((m) => m.id === id) || SHIPPING_METHODS[0]

export const normalizePromo = (code) => {
  const clean = String(code || '').trim().toUpperCase()
  return PROMO_CODES[clean] ? { code: clean, ...PROMO_CODES[clean] } : null
}

// Calcule les totaux de façon déterministe.
//   lines: [{ price, qty }]
//   shippingMethodId: 'standard' | 'express' | 'pickup' (optionnel)
//   promoCode: chaîne (optionnel)
export function computeTotals({ lines = [], shippingMethodId, promoCode } = {}) {
  const subtotal = round2(
    lines.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.qty) || 0), 0),
  )

  const promo = normalizePromo(promoCode)
  const method = getShippingMethod(shippingMethodId)

  const freeByThreshold = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
  let shipping = freeByThreshold ? 0 : method.price
  if (promo?.type === 'shipping') shipping = 0

  let discount = 0
  if (promo?.type === 'percent') discount = round2((subtotal * promo.value) / 100)

  const total = round2(Math.max(0, subtotal - discount) + shipping)

  return {
    subtotal,
    discount,
    shipping: round2(shipping),
    total,
    freeShipping: shipping === 0,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    promo,
    shippingMethod: method,
  }
}
