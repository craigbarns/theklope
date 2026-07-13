import { SHIPPING_METHODS } from '../../src/lib/pricing.js'

export const MAX_CART_LINES = 100
export const MAX_LINE_QUANTITY = 100

const VARIANT_FIELDS = [
  ['color', 'colors', 'couleur'],
  ['flavor', 'flavors', 'saveur'],
  ['nicotine', 'nicotine', 'taux de nicotine'],
  ['ohm', 'ohmOptions', 'resistance'],
]

const comparable = (value) => String(value ?? '').trim().toLocaleLowerCase('fr-FR')
const compact = (value, max = 220) => String(value ?? '').trim().slice(0, max)

export function parseQuantity(value) {
  const qty = Number(value)
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QUANTITY) return null
  return qty
}

export function normalizeVariant(product, input = {}) {
  if (input != null && (typeof input !== 'object' || Array.isArray(input))) {
    return { ok: false, error: 'Options produit invalides.' }
  }
  const source = input || {}
  const knownKeys = new Set(VARIANT_FIELDS.map(([key]) => key))
  const unknownKey = Object.keys(source).find((key) => !knownKeys.has(key))
  if (unknownKey) {
    return { ok: false, error: `Option produit inconnue : ${unknownKey}.` }
  }

  const variant = {}
  for (const [key, productField, label] of VARIANT_FIELDS) {
    const allowed = Array.isArray(product?.[productField]) ? product[productField].filter((value) => value !== '' && value != null) : []
    const provided = source[key]

    if (allowed.length === 0) {
      if (provided !== undefined && provided !== null && provided !== '') {
        return { ok: false, error: `${product.name} ne propose pas cette option de ${label}.` }
      }
      continue
    }

    // Les ajouts rapides utilisent la premiere option quand aucun choix n'a
    // encore ete fait. Une valeur envoyee explicitement doit, elle, exister.
    if (provided === undefined || provided === null || provided === '') {
      variant[key] = allowed[0]
      continue
    }

    const selected = allowed.find((value) => comparable(value) === comparable(provided))
    if (selected === undefined) {
      return { ok: false, error: `Option ${label} indisponible pour ${product.name}.` }
    }
    variant[key] = selected
  }

  return { ok: true, variant }
}

export function aggregateQuantities(lines = []) {
  const totals = new Map()
  for (const line of lines) {
    totals.set(line.productId, (totals.get(line.productId) || 0) + line.qty)
  }
  return totals
}

export function validateFulfillment(shippingMethodId, address = {}) {
  const method = SHIPPING_METHODS.find((entry) => entry.id === shippingMethodId)
  if (!method) return { ok: false, error: 'Mode de livraison invalide.' }

  if (method.id === 'pickup') {
    return {
      ok: true,
      method,
      address: {
        street: '188 rue de Rome',
        extra: 'Retrait en boutique',
        zip: '13006',
        city: 'Marseille',
        country: 'France',
      },
    }
  }

  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return { ok: false, error: 'Adresse de livraison invalide.' }
  }

  const normalized = {
    street: compact(address.street),
    extra: compact(address.extra),
    zip: compact(address.zip, 10).replace(/\s+/g, ''),
    city: compact(address.city, 120),
    country: compact(address.country || 'France', 80),
  }
  const country = comparable(normalized.country).replace(/[.\s-]/g, '')
  if (!['france', 'fr'].includes(country)) {
    return { ok: false, error: 'La livraison est actuellement disponible uniquement en France.' }
  }
  if (!normalized.street || !normalized.city || !/^\d{5}$/.test(normalized.zip)) {
    return { ok: false, error: 'Adresse de livraison ou code postal invalide.' }
  }
  if (method.id === 'coursier' && !/^130(?:0[1-9]|1[0-6])$/.test(normalized.zip)) {
    return { ok: false, error: 'La livraison par coursier est reservee aux 16 arrondissements de Marseille.' }
  }

  return { ok: true, method, address: { ...normalized, country: 'France' } }
}
