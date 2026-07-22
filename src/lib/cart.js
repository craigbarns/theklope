export const CART_VARIANT_FIELDS = Object.freeze([
  { key: 'color', productField: 'colors', label: 'Couleur' },
  { key: 'flavor', productField: 'flavors', label: 'Saveur', categories: ['eliquide', 'diy'] },
  { key: 'nicotine', productField: 'nicotine', label: 'Taux de nicotine', suffix: ' mg', categories: ['eliquide', 'diy'] },
  { key: 'ohm', productField: 'ohmOptions', label: 'Résistance', suffix: ' Ω' },
])

const comparable = (value) => String(value ?? '').trim().toLocaleLowerCase('fr-FR')
const hasValue = (value) => value !== undefined && value !== null && value !== ''

const variantKey = (variant = {}) => JSON.stringify(
  CART_VARIANT_FIELDS.map(({ key }) => variant?.[key] ?? null),
)

export function getProductVariantOptions(product = {}, key) {
  const definition = CART_VARIANT_FIELDS.find((entry) => entry.key === key)
  if (!definition) return []
  if (definition.categories && !definition.categories.includes(product?.category)) return []
  const source = Array.isArray(product?.[definition.productField]) ? product[definition.productField] : []
  return source.filter(hasValue)
}

export function getProductVariantChoices(product = {}) {
  return CART_VARIANT_FIELDS.flatMap((definition) => {
    const options = getProductVariantOptions(product, definition.key)
    return options.length > 0 ? [{ ...definition, options }] : []
  })
}

export const productRequiresVariantSelection = (product = {}) => (
  getProductVariantChoices(product).some(({ options }) => options.length > 1)
)

export const isCartCatalogResolved = ({ cart = [], cartDetailed = [], catalogReady = false } = {}) => (
  cart.length === 0 || (catalogReady === true && cartDetailed.length === cart.length)
)

export const isCartCatalogVerified = (state = {}) => (
  isCartCatalogResolved(state)
  && (state.cartDetailed || []).every((item) => (
    resolveProductVariant(item.product, item.variant).ok
  ))
)

const variantStateKey = (variant) => {
  if (!variant || typeof variant !== 'object' || Array.isArray(variant)) return 'invalid'
  return JSON.stringify(
    Object.keys(variant)
      .sort()
      .map((key) => [key, typeof variant[key], String(variant[key])]),
  )
}

// Canonicalise les choix avec les valeurs exactes du catalogue. Une dimension
// ambiguë doit être choisie explicitement ; un choix unique peut être complété.
function normalizeProductVariant(product = {}, input = {}, { allowIncomplete = false } = {}) {
  if (input != null && (typeof input !== 'object' || Array.isArray(input))) {
    return { ok: false, variant: {}, error: 'Options produit invalides.' }
  }

  const source = input || {}
  const knownKeys = new Set(CART_VARIANT_FIELDS.map(({ key }) => key))
  const unknownKey = Object.keys(source).find((key) => !knownKeys.has(key))
  if (unknownKey) {
    return { ok: false, variant: {}, error: `Option produit inconnue : ${unknownKey}.` }
  }

  const variant = {}
  const choices = getProductVariantChoices(product)
  for (const { key, label } of CART_VARIANT_FIELDS) {
    const choice = choices.find((entry) => entry.key === key)
    const provided = source[key]

    if (!choice) {
      if (hasValue(provided)) {
        return {
          ok: false,
          variant: {},
          error: `${product.name || 'Ce produit'} ne propose pas cette option (${label.toLowerCase()}).`,
        }
      }
      continue
    }

    if (!hasValue(provided)) {
      if (choice.options.length === 1) {
        variant[key] = choice.options[0]
        continue
      }
      if (allowIncomplete) continue
      return {
        ok: false,
        variant: {},
        missing: key,
        error: `Choisissez l'option « ${label} » pour ${product.name || 'ce produit'}.`,
      }
    }

    const selected = choice.options.find((option) => comparable(option) === comparable(provided))
    if (selected === undefined) {
      return {
        ok: false,
        variant: {},
        error: `L'option « ${label} » choisie n'est plus disponible pour ${product.name || 'ce produit'}.`,
      }
    }
    variant[key] = selected
  }

  return {
    ok: true,
    variant,
    complete: choices.every(({ key }) => hasValue(variant[key])),
  }
}

export function resolveProductVariant(product = {}, input = {}) {
  const result = normalizeProductVariant(product, input)
  if (!result.ok) return result
  return { ok: true, variant: result.variant }
}

export function resolvePartialProductVariant(product = {}, input = {}) {
  return normalizeProductVariant(product, input, { allowIncomplete: true })
}

// A saved cart may outlive a catalog option. Keep every still-valid choice,
// apply only unambiguous single-option defaults, and remove obsolete values so
// the UI can ask for the missing choice instead of failing only at payment.
export function reconcilePersistedProductVariant(product = {}, input = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const sanitized = {}
  for (const { key, options } of getProductVariantChoices(product)) {
    const selected = options.find((option) => comparable(option) === comparable(source[key]))
    if (selected !== undefined) sanitized[key] = selected
  }
  const result = resolvePartialProductVariant(product, sanitized)
  const variant = result.ok ? result.variant : {}
  return {
    variant,
    complete: Boolean(result.ok && result.complete),
    changed: variantStateKey(source) !== variantStateKey(variant),
  }
}

export function buildCartAddition({ cart = [], products = [], entries = [] } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) return { ok: false, cart, prepared: [] }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const prepared = []
  const requestedByProduct = new Map()

  for (const entry of entries) {
    const product = productMap.get(entry.productId)
    const qty = Math.floor(Number(entry.qty) || 0)
    if (!product || product.stock <= 0 || qty < 1) return { ok: false, cart, prepared: [] }

    const normalized = resolveProductVariant(product, entry.variant)
    if (!normalized.ok) {
      return { ok: false, cart, prepared: [], error: normalized.error }
    }
    const variant = normalized.variant

    prepared.push({ product, productId: product.id, qty, variant })
    requestedByProduct.set(product.id, (requestedByProduct.get(product.id) || 0) + qty)
  }

  for (const [productId, requestedQty] of requestedByProduct) {
    const product = productMap.get(productId)
    const alreadyInCart = cart.reduce(
      (sum, item) => sum + (item.productId === productId ? Number(item.qty) || 0 : 0),
      0,
    )
    if (alreadyInCart + requestedQty > product.stock) return { ok: false, cart, prepared: [] }
  }

  const next = [...cart]
  for (const entry of prepared) {
    const key = variantKey(entry.variant)
    const index = next.findIndex(
      (item) => item.productId === entry.productId && variantKey(item.variant) === key,
    )
    if (index >= 0) {
      next[index] = { ...next[index], qty: next[index].qty + entry.qty }
    } else {
      next.push({ productId: entry.productId, qty: entry.qty, variant: entry.variant })
    }
  }

  return { ok: true, cart: next, prepared }
}

export function buildCartVariantUpdate({ cart = [], products = [], index, variant = {} } = {}) {
  const targetIndex = Number(index)
  if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= cart.length) {
    return { ok: false, cart, error: 'Ligne de panier introuvable.' }
  }

  const current = cart[targetIndex]
  const product = products.find((entry) => entry.id === current?.productId)
  if (!product) return { ok: false, cart, error: 'Produit introuvable.' }

  const normalized = resolvePartialProductVariant(product, variant)
  if (!normalized.ok) return { ok: false, cart, error: normalized.error }

  const duplicateIndex = cart.findIndex((entry, entryIndex) => (
    entryIndex !== targetIndex
    && entry.productId === current.productId
    && variantKey(entry.variant) === variantKey(normalized.variant)
  ))

  if (duplicateIndex === -1) {
    const next = cart.map((entry, entryIndex) => (
      entryIndex === targetIndex ? { ...entry, variant: normalized.variant } : entry
    ))
    return { ok: true, cart: next, variant: normalized.variant }
  }

  const mergedQty = (Number(cart[duplicateIndex].qty) || 0) + (Number(current.qty) || 0)
  const next = cart
    .map((entry, entryIndex) => (
      entryIndex === duplicateIndex ? { ...entry, qty: mergedQty } : entry
    ))
    .filter((_, entryIndex) => entryIndex !== targetIndex)

  return { ok: true, cart: next, variant: normalized.variant }
}
