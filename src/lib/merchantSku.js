export const MERCHANT_SKU_MAX_LENGTH = 50

const hashSku = (value) => {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return hash.toString(36).padStart(11, '0')
}

const normalizeSku = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7E]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^A-Za-z0-9_-]+/g, '-')
  .replace(/[-_]{2,}/g, '-')
  .replace(/^[-_]+|[-_]+$/g, '')

// Google associe Product.sku à l'identifiant marchand : 1 à 50 caractères,
// sans espace et idéalement en ASCII. Les IDs courts restent inchangés afin
// de préserver leur stabilité ; les IDs longs reçoivent un suffixe déterministe
// pour éviter les collisions après troncature.
export const buildMerchantSku = (productId) => {
  const normalized = normalizeSku(productId) || 'product'
  if (normalized.length <= MERCHANT_SKU_MAX_LENGTH) return normalized

  const suffix = hashSku(normalized)
  const prefixLength = MERCHANT_SKU_MAX_LENGTH - suffix.length - 1
  const prefix = normalized.slice(0, prefixLength).replace(/[-_]+$/g, '') || 'product'
  return `${prefix}-${suffix}`
}
