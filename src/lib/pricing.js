// =============================================================================
// Tarification THEKLOPE — source de vérité PARTAGÉE entre le client (Vite) et
// les fonctions serverless (api/). Le serveur recalcule toujours le montant à
// partir d'ici ; le client s'en sert pour afficher des totaux identiques.
// Ne jamais faire confiance à un montant envoyé par le navigateur.
// =============================================================================

export const FREE_SHIPPING_THRESHOLD = 49
export const DEFAULT_SHIPPING_COST = 7.5

// Modes de livraison. Click & Collect (retrait boutique) = gratuit ; La Poste et
// Coursier Marseille = 7,50 € (offerts dès 49 € via le seuil ci-dessus).
export const SHIPPING_METHODS = [
  { id: 'poste', label: 'La Poste', detail: 'Livraison à domicile, 2–4 j', price: 7.5 },
  { id: 'coursier', label: 'Coursier Marseille', detail: 'Livraison le jour même sur Marseille', price: 7.5 },
  { id: 'pickup', label: 'Click & Collect', detail: 'Retrait en boutique — 188 rue de Rome', price: 0 },
]

export const PROMO_CODES = {
  THEKLOPE10: { type: 'percent', value: 10, label: '-10%' },
  BIENVENUE: { type: 'percent', value: 15, label: '-15% première commande' },
  LIVRAISON: { type: 'shipping', value: 0, label: 'Livraison offerte' },
  PACK15: { type: 'percent', value: 15, label: '-15% Pack Sur Mesure' },
}

// -----------------------------------------------------------------------------
// Remises automatiques par marque / volume (e-liquides uniquement).
//   - Paliers « 10ml » : X e-liquides 10ml de certaines marques → prix de lot fixe.
//   - Palier « 50ml »  : à partir de N e-liquides 50ml de ces marques → % de remise.
// Les marques sont comparées en minuscules/sans espaces superflus.
// -----------------------------------------------------------------------------
export const BUNDLE_TIERS_10ML = [
  { key: 'A', brands: ['liquidarom', 'freaks'], packSize: 20, packPrice: 59, label: '20 e-liquides Liquidarom / Freaks' },
  { key: 'B', brands: ['alfaliquid', 'pulp'], packSize: 20, packPrice: 88.5, label: '20 e-liquides Alfaliquid / Pulp' },
]
export const BUNDLE_50ML = {
  brands: ['liquidarom', 'freaks', 'alfaliquid', 'pulp'],
  minQty: 4,
  rate: 0.25,
  label: '4 e-liquides 50ml ou +',
}

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const normBrand = (b) => String(b || '').trim().toLowerCase()
const normVolume = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '')
const is10ml = (l) => normVolume(l.volume) === '10ml'
const is50ml = (l) => normVolume(l.volume) === '50ml'
const isEliquid = (l) => (l.category || 'eliquide') === 'eliquide'

export const getShippingMethod = (id) =>
  SHIPPING_METHODS.find((m) => m.id === id) || SHIPPING_METHODS[0]

export const normalizePromo = (code) => {
  const clean = String(code || '').trim().toUpperCase()
  return PROMO_CODES[clean] ? { code: clean, ...PROMO_CODES[clean] } : null
}

// Calcule la remise automatique (paliers marque/volume). Renvoie le détail pour
// pouvoir l'afficher au client.
export function computeAutoDiscount(lines = []) {
  let total = 0
  const details = []

  // Paliers 10ml (prix de lot fixe par tranche de packSize)
  for (const tier of BUNDLE_TIERS_10ML) {
    const eligible = lines.filter((l) => isEliquid(l) && is10ml(l) && tier.brands.includes(normBrand(l.brand)))
    const units = eligible.reduce((s, l) => s + (Number(l.qty) || 0), 0)
    if (units < tier.packSize) continue
    const sumNormal = round2(eligible.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0))
    const avg = sumNormal / units
    const packs = Math.floor(units / tier.packSize)
    const remainder = units - packs * tier.packSize
    const newTotal = round2(packs * tier.packPrice + remainder * avg)
    const saved = round2(Math.max(0, sumNormal - newTotal))
    if (saved > 0) {
      total += saved
      details.push({ key: tier.key, label: tier.label, packs, amount: saved })
    }
  }

  // Palier 50ml (% de remise à partir de minQty)
  const fifty = lines.filter((l) => isEliquid(l) && is50ml(l) && BUNDLE_50ML.brands.includes(normBrand(l.brand)))
  const units50 = fifty.reduce((s, l) => s + (Number(l.qty) || 0), 0)
  if (units50 >= BUNDLE_50ML.minQty) {
    const sum50 = round2(fifty.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0))
    const saved = round2(sum50 * BUNDLE_50ML.rate)
    if (saved > 0) {
      total += saved
      details.push({ key: '50ml', label: BUNDLE_50ML.label, amount: saved })
    }
  }

  return { total: round2(total), details }
}

// Calcule les totaux de façon déterministe.
//   lines: [{ price, qty, brand, volume, category }]
//   shippingMethodId: 'poste' | 'coursier' | 'pickup' (optionnel)
//   promoCode: chaîne (optionnel)
export function computeTotals({ lines = [], shippingMethodId, promoCode } = {}) {
  const subtotal = round2(
    lines.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.qty) || 0), 0),
  )

  const promo = normalizePromo(promoCode)
  const method = getShippingMethod(shippingMethodId)

  // Livraison : gratuite dès le seuil (sauf Click & Collect déjà à 0) ou via un
  // code promo « livraison offerte ».
  const freeByThreshold = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
  let shipping = method.price
  if (freeByThreshold) shipping = 0
  if (promo?.type === 'shipping') shipping = 0

  // Remises : automatique (marque/volume) vs code promo % — on applique la plus
  // avantageuse pour le client (elles ne se cumulent PAS).
  const auto = computeAutoDiscount(lines)
  const promoPercent = promo?.type === 'percent' ? round2((subtotal * promo.value) / 100) : 0
  const discount = round2(Math.max(auto.total, promoPercent))
  const discountSource = discount > 0 ? (auto.total >= promoPercent ? 'auto' : 'promo') : null

  const total = round2(Math.max(0, subtotal - discount) + shipping)

  return {
    subtotal,
    discount,
    discountSource, // 'auto' | 'promo' | null
    autoDiscount: auto,
    shipping: round2(shipping),
    total,
    freeShipping: shipping === 0,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    promo,
    shippingMethod: method,
  }
}
