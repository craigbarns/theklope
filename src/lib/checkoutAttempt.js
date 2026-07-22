export const CHECKOUT_ATTEMPT_STORAGE_KEY = 'tk_checkout_attempt_v1'
// Une tentative Mollie peut rester ouverte bien au-delà de deux heures. Tant
// que le serveur n'a pas confirmé un état terminal, le même panier doit garder
// la même clé afin de ne jamais réserver ou débiter deux fois. sessionStorage
// limite déjà cette durée à l'onglet ; ce plafond couvre les onglets conservés.
export const CHECKOUT_ATTEMPT_TTL_MS = 30 * 24 * 60 * 60 * 1000

const getSessionStorage = () => {
  try {
    return globalThis.window?.sessionStorage || globalThis.sessionStorage || null
  } catch {
    return null
  }
}

export const createCheckoutIdempotencyKey = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `checkout:${globalThis.crypto.randomUUID()}`
  }
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
    return `checkout:${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`
  }
  return `checkout:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`
}

export const createPayloadFingerprint = async (value) => {
  if (globalThis.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  // Compatibilité pour les navigateurs anciens : aucune coordonnée client
  // n'est enregistrée en clair, seulement cette empreinte de comparaison.
  let left = 0x811c9dc5
  let right = 0x9e3779b9
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    left = Math.imul(left ^ code, 0x01000193)
    right = Math.imul(right ^ code, 0x85ebca6b)
  }
  return `fallback-${(left >>> 0).toString(16)}${(right >>> 0).toString(16)}-${value.length}`
}

const compact = (value, max) => String(value ?? '').trim().slice(0, max)

export const canonicalCheckoutAttemptPayload = (requestBody = {}) => {
  const customer = requestBody.customer && typeof requestBody.customer === 'object'
    ? requestBody.customer
    : {}
  const sourceAddress = requestBody.address && typeof requestBody.address === 'object'
    ? requestBody.address
    : {}
  const address = requestBody.shippingMethodId === 'pickup'
    ? {}
    : {
        street: compact(sourceAddress.street, 200),
        extra: compact(sourceAddress.extra, 200),
        zip: compact(sourceAddress.zip, 10).replace(/\s+/g, ''),
        city: compact(sourceAddress.city, 120),
        country: ['fr', 'france'].includes(
          compact(sourceAddress.country || 'France', 80).toLocaleLowerCase('fr-FR').replace(/[.\s-]/g, ''),
        ) ? 'France' : compact(sourceAddress.country, 80),
        deliveryInstructions: String(sourceAddress.deliveryInstructions ?? '')
          .replace(/\r\n?/g, '\n')
          .replace(/\u0000/g, '')
          .trim(),
      }

  const lines = (Array.isArray(requestBody.items) ? requestBody.items : []).map((item) => {
    const variant = Object.fromEntries(
      Object.entries(item?.variant && typeof item.variant === 'object' ? item.variant : {})
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => [
          key,
          compact(value, 220).toLocaleLowerCase('fr-FR'),
        ]),
    )
    return {
      productId: compact(item?.id, 160),
      qty: Number(item?.qty),
      variant,
    }
  })
  lines.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))

  return {
    ageConfirmed: requestBody.ageConfirmed === true,
    customer: {
      name: compact(customer.name, 160),
      email: compact(customer.email, 180).toLocaleLowerCase('fr-FR'),
      phone: compact(customer.phone, 40),
    },
    address,
    shippingMethodId: compact(requestBody.shippingMethodId, 40),
    promoCode: compact(requestBody.promoCode, 80).toLocaleUpperCase('fr-FR'),
    lines,
  }
}

export const createCheckoutAttemptFingerprint = (requestBody) => createPayloadFingerprint(
  JSON.stringify(canonicalCheckoutAttemptPayload(requestBody)),
)

export const readStoredPaymentAttempt = (
  fingerprint,
  { storage = getSessionStorage(), now = Date.now() } = {},
) => {
  if (!storage || !fingerprint) return null
  try {
    const stored = JSON.parse(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY) || 'null')
    const createdAt = Number(stored?.createdAt)
    const isExpired = !Number.isFinite(createdAt)
      || createdAt <= 0
      || createdAt > now + 60_000
      || now - createdAt > CHECKOUT_ATTEMPT_TTL_MS
    if (isExpired) {
      storage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY)
      return null
    }
    if (stored.fingerprint !== fingerprint || typeof stored.key !== 'string' || !stored.key) return null
    return {
      fingerprint: stored.fingerprint,
      key: stored.key,
      createdAt,
      ...(typeof stored.orderId === 'string' && stored.orderId ? { orderId: stored.orderId } : {}),
    }
  } catch {
    return null
  }
}

export const persistPaymentAttempt = (attempt, storage = getSessionStorage()) => {
  if (!storage || !attempt?.fingerprint || !attempt?.key || !Number.isFinite(attempt?.createdAt)) return false
  try {
    storage.setItem(CHECKOUT_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt))
    return true
  } catch {
    // La référence mémoire protège encore les doubles clics si le stockage est bloqué.
    return false
  }
}

export const clearPaymentAttempt = (key, storage = getSessionStorage()) => {
  if (!storage) return false
  try {
    const stored = JSON.parse(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY) || 'null')
    if (!key || stored?.key === key) {
      storage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY)
      return true
    }
  } catch {
    // Le paiement ne dépend jamais du stockage navigateur.
  }
  return false
}

export const clearPaymentAttemptForOrder = (orderId, storage = getSessionStorage()) => {
  if (!storage || !orderId) return false
  try {
    const stored = JSON.parse(storage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY) || 'null')
    if (stored?.orderId === orderId) {
      storage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY)
      return true
    }
  } catch {
    // Le statut serveur reste la source de vérité si le stockage est verrouillé.
  }
  return false
}
