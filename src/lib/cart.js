const variantKey = (variant = {}) => JSON.stringify(
  ['color', 'flavor', 'nicotine', 'ohm'].map((key) => variant?.[key] ?? null),
)

export function buildCartAddition({ cart = [], products = [], entries = [] } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) return { ok: false, cart, prepared: [] }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const prepared = []
  const requestedByProduct = new Map()

  for (const entry of entries) {
    const product = productMap.get(entry.productId)
    const qty = Math.floor(Number(entry.qty) || 0)
    if (!product || product.stock <= 0 || qty < 1) return { ok: false, cart, prepared: [] }

    const variant = { ...(entry.variant || {}) }
    if (product.colors?.length && variant.color == null) variant.color = product.colors[0]
    if (product.flavors?.length && variant.flavor == null) variant.flavor = product.flavors[0]
    if (product.nicotine?.length && variant.nicotine == null) variant.nicotine = product.nicotine[0]
    if (product.ohmOptions?.length && variant.ohm == null) variant.ohm = product.ohmOptions[0]

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
