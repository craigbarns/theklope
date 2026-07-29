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
  PACK15: { type: 'percent', value: 15, label: '-15% Pack Sur Mesure', eligibility: 'complete-pack' },
}

const PACK_CONSUMABLE_CATEGORIES = ['accessoire', 'resistance']

// -----------------------------------------------------------------------------
// Tarifs automatiques par marque / volume (e-liquides uniquement).
//   - 10ml : à partir de 20 unités dans un même groupe de marques.
//   - 50ml / 100ml : à partir de 4 unités, formats et marques combinables.
// Le pourcentage couvre toutes les unités éligibles dès que le seuil est atteint.
// -----------------------------------------------------------------------------
export const BUNDLE_TIERS_10ML = [
  {
    key: '10ml-liquidarom-freaks-secret-garden',
    brands: ['liquidarom', 'freaks', 'secret garden', 'secrets garden'],
    minQty: 20,
    rate: 0.5,
    label: 'Tarif quantité 10ml · Liquidarom / Freaks / Secret Garden',
    conditionLabel: 'À partir de 20 flacons 10ml combinables parmi Liquidarom, Freaks et Secret Garden',
    progressLabel: 'Liquidarom / Freaks / Secret Garden',
    promoLabel: 'tarif quantité',
  },
  {
    key: '10ml-alfaliquid-pulp',
    brands: ['alfaliquid', 'pulp'],
    minQty: 20,
    rate: 0.25,
    label: 'Tarif quantité 10ml · Alfaliquid / Pulp',
    conditionLabel: 'À partir de 20 flacons 10ml combinables parmi Alfaliquid et Pulp',
    progressLabel: 'Alfaliquid / Pulp',
    promoLabel: 'tarif quantité',
  },
]
export const BUNDLE_50_100ML = {
  key: '50-100ml',
  volumes: ['50ml', '100ml'],
  minQty: 4,
  rate: 0.25,
  label: 'Tarif quantité · 4 e-liquides 50/100ml ou +',
  conditionLabel: 'À partir de 4 flacons 50ml ou 100ml combinables, toutes marques',
  progressLabel: 'en 50/100ml (formats et marques combinables)',
  promoLabel: 'tarif quantité',
}
export const BUNDLE_VOLUME_TIERS = [BUNDLE_50_100ML]

const toCents = (n) => Math.round((Number(n) || 0) * 100)
const fromCents = (n) => (Number(n) || 0) / 100
const normBrand = (b) => String(b || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
const normVolume = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '')
const is10ml = (l) => normVolume(l.volume) === '10ml'
const isTierVolume = (l, volumes) => volumes.includes(normVolume(l.volume))
const isEliquid = (l) => (l.category || 'eliquide') === 'eliquide'
const lineSubtotalCents = (line) => (
  toCents(line.price) * (Number(line.qty) || 0)
)

// Volume effectif d'un produit pour les remises : champ `volume` s'il est
// renseigné, sinon dérivé de `specs.Contenance` (ex. « 10 ml »). Indispensable :
// le catalogue stocke souvent la contenance uniquement dans les specs, sans quoi
// aucune remise dégressive ne se déclencherait. Utilisé CÔTÉ CLIENT ET SERVEUR.
export const resolveVolume = (p = {}) => {
  const raw = p?.volume || p?.specs?.Contenance || p?.specs?.contenance || ''
  const detected = [...String(raw).matchAll(/(\d+(?:[.,]\d+)?)\s*ml\b/gi)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter(Number.isFinite)
    .map((value) => `${value}ml`)
  const unique = [...new Set(detected)]

  // Une seule contenance explicite peut piloter une remise. Une chaîne ambiguë
  // comme « 50ml / 100ml » reste non éligible plutôt que d'appliquer un palier
  // au hasard. Cela évite aussi de confondre 150ml ou 250ml avec 50ml.
  return unique.length === 1 ? unique[0] : normVolume(raw)
}

export function getQuantityPricingRule(product = {}) {
  if (!isEliquid(product)) return null

  const volume = resolveVolume(product)
  const tier = volume === '10ml'
    ? BUNDLE_TIERS_10ML.find((candidate) => candidate.brands.includes(normBrand(product.brand)))
    : BUNDLE_VOLUME_TIERS.find((candidate) => candidate.volumes.includes(volume))
  if (!tier) return null

  const regularTotalCents = toCents(product.price) * tier.minQty
  const adjustedTotalCents = regularTotalCents - Math.round(regularTotalCents * tier.rate)
  return {
    key: tier.key,
    minQty: tier.minQty,
    conditionLabel: tier.conditionLabel,
    exampleTotal: fromCents(adjustedTotalCents),
  }
}

export const getShippingMethod = (id) =>
  SHIPPING_METHODS.find((m) => m.id === id) || SHIPPING_METHODS[0]

export const normalizePromo = (code) => {
  const clean = String(code || '').trim().toUpperCase()
  return PROMO_CODES[clean] ? { code: clean, ...PROMO_CODES[clean] } : null
}

// PACK15 est reserve aux compositions qui contiennent reellement les trois
// familles du configurateur : appareil, resistance/accessoire et e-liquide.
// Cette verification est partagee par le navigateur et l'API de paiement.
export const isCompletePack = (lines = []) => {
  const active = lines.filter((line) => Number(line?.qty) > 0)
  return (
    active.some((line) => ['ecig', 'pod'].includes(line.category)) &&
    active.some((line) => PACK_CONSUMABLE_CATEGORIES.includes(line.category)) &&
    active.some((line) => line.category === 'eliquide')
  )
}

// Une remise PACK15 couvre un seul article de chaque famille du configurateur.
// Les quantités supplémentaires et les autres articles restent au prix normal.
const getCompletePackSubtotalCents = (lines = []) => {
  const active = lines.filter((line) => Number(line?.qty) > 0)
  const highestPriceCents = (categories) => active
    .filter((line) => categories.includes(line.category))
    .reduce((highest, line) => Math.max(highest, toCents(line.price)), 0)

  if (!isCompletePack(active)) return 0
  return (
    highestPriceCents(['ecig', 'pod'])
      + highestPriceCents(PACK_CONSUMABLE_CATEGORIES)
      + highestPriceCents(['eliquide'])
  )
}

export const getCompletePackSubtotal = (lines = []) => (
  fromCents(getCompletePackSubtotalCents(lines))
)

export const isPromoEligible = (promo, lines = []) => {
  if (!promo) return false
  if (promo.eligibility === 'complete-pack') return isCompletePack(lines)
  return true
}

// Calcule la remise automatique (paliers marque/volume). Renvoie le détail pour
// pouvoir l'afficher au client.
export function computeAutoDiscount(lines = []) {
  let totalCents = 0
  const details = []

  // Paliers 10ml : le groupe de marques est combinable et toutes les unités
  // éligibles passent au pourcentage prévu une fois le seuil atteint.
  for (const tier of BUNDLE_TIERS_10ML) {
    const eligible = lines.filter((l) => isEliquid(l) && is10ml(l) && tier.brands.includes(normBrand(l.brand)))
    const units = eligible.reduce((s, l) => s + (Number(l.qty) || 0), 0)
    if (units < tier.minQty) continue
    const eligibleSubtotalCents = eligible.reduce((sum, line) => sum + lineSubtotalCents(line), 0)
    const savedCents = Math.max(0, Math.round(eligibleSubtotalCents * tier.rate))
    if (savedCents > 0) {
      totalCents += savedCents
      details.push({ key: tier.key, label: tier.label, amount: fromCents(savedCents) })
    }
  }

  // Les 50ml et 100ml partagent un même seuil : 2 × 50ml + 2 × 100ml,
  // même de marques différentes, constituent donc bien quatre unités.
  for (const tier of BUNDLE_VOLUME_TIERS) {
    const eligible = lines.filter((l) => isEliquid(l) && isTierVolume(l, tier.volumes))
    const units = eligible.reduce((s, l) => s + (Number(l.qty) || 0), 0)
    if (units < tier.minQty) continue
    const eligibleSubtotalCents = eligible.reduce((sum, line) => sum + lineSubtotalCents(line), 0)
    const savedCents = Math.max(0, Math.round(eligibleSubtotalCents * tier.rate))
    if (savedCents > 0) {
      totalCents += savedCents
      details.push({ key: tier.key, label: tier.label, amount: fromCents(savedCents) })
    }
  }

  return { total: fromCents(totalCents), details }
}

// Progression vers les paliers de remise NON encore atteints, pour inciter le
// client au panier (« plus que N e-liquides pour -50 % »). Renvoie une entrée par
// palier éligible entamé mais pas complet ; vide sinon.
export function computeBundleProgress(lines = []) {
  const hints = []

  for (const tier of BUNDLE_TIERS_10ML) {
    const units = lines
      .filter((l) => isEliquid(l) && is10ml(l) && tier.brands.includes(normBrand(l.brand)))
      .reduce((s, l) => s + (Number(l.qty) || 0), 0)
    if (units > 0 && units < tier.minQty) {
      hints.push({
        key: tier.key,
        progressLabel: tier.progressLabel,
        promoLabel: tier.promoLabel,
        current: units,
        target: tier.minQty,
        remaining: tier.minQty - units,
      })
    }
  }

  for (const tier of BUNDLE_VOLUME_TIERS) {
    const units = lines
      .filter((l) => isEliquid(l) && isTierVolume(l, tier.volumes))
      .reduce((s, l) => s + (Number(l.qty) || 0), 0)
    if (units > 0 && units < tier.minQty) {
      hints.push({
        key: tier.key,
        progressLabel: tier.progressLabel,
        promoLabel: tier.promoLabel,
        current: units,
        target: tier.minQty,
        remaining: tier.minQty - units,
      })
    }
  }

  return hints
}

// Calcule les totaux de façon déterministe.
//   lines: [{ price, qty, brand, volume, category }]
//   shippingMethodId: 'poste' | 'coursier' | 'pickup' (optionnel)
//   promoCode: chaîne (optionnel)
export function computeTotals({ lines = [], shippingMethodId, promoCode } = {}) {
  const subtotalCents = lines.reduce((sum, line) => sum + lineSubtotalCents(line), 0)
  const subtotal = fromCents(subtotalCents)

  const requestedPromo = normalizePromo(promoCode)
  const promo = isPromoEligible(requestedPromo, lines) ? requestedPromo : null
  const method = getShippingMethod(shippingMethodId)

  // Livraison : gratuite dès le seuil (sauf Click & Collect déjà à 0) ou via un
  // code promo « livraison offerte ».
  const freeByThreshold = subtotalCents === 0 || subtotalCents >= toCents(FREE_SHIPPING_THRESHOLD)
  let shippingCents = toCents(method.price)
  if (freeByThreshold) shippingCents = 0
  if (promo?.type === 'shipping') shippingCents = 0

  // Remises : automatique (marque/volume) vs code promo % — on applique la plus
  // avantageuse pour le client (elles ne se cumulent PAS).
  const auto = computeAutoDiscount(lines)
  const autoCents = toCents(auto.total)
  const promoBaseCents = promo?.code === 'PACK15'
    ? getCompletePackSubtotalCents(lines)
    : subtotalCents
  const promoPercentCents = promo?.type === 'percent'
    ? Math.round((promoBaseCents * promo.value) / 100)
    : 0
  const discountCents = Math.max(autoCents, promoPercentCents)
  const discountSource = discountCents > 0
    ? (autoCents >= promoPercentCents ? 'auto' : 'promo')
    : null
  const appliedPromo = promo && (promo.type === 'shipping' || discountSource === 'promo')
    ? promo
    : null

  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents

  return {
    subtotal,
    discount: fromCents(discountCents),
    discountSource, // 'auto' | 'promo' | null
    autoDiscount: auto,
    shipping: fromCents(shippingCents),
    total: fromCents(totalCents),
    freeShipping: shippingCents === 0,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    promo,
    appliedPromo,
    promoRejected: Boolean(requestedPromo && !promo),
    shippingMethod: method,
  }
}
