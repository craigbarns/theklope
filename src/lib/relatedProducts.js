const normalizeSearchValue = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function normalizeRelatedProductIds(value, currentProductId = '') {
  const ids = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []
  const currentId = String(currentProductId || '').trim()
  const seen = new Set()

  return ids.reduce((result, valueId) => {
    const id = String(valueId || '').trim()
    if (!id || id === currentId || seen.has(id)) return result
    seen.add(id)
    result.push(id)
    return result
  }, [])
}

export function addRelatedProductId(value, productId, currentProductId = '') {
  return normalizeRelatedProductIds([
    ...normalizeRelatedProductIds(value, currentProductId),
    productId,
  ], currentProductId)
}

export function removeRelatedProductId(value, productId, currentProductId = '') {
  const idToRemove = String(productId || '').trim()
  return normalizeRelatedProductIds(value, currentProductId).filter((id) => id !== idToRemove)
}

export function removeProductAndReferences(products = [], productId = '') {
  const removedId = String(productId || '').trim()
  if (!removedId) return products

  return products
    .filter((product) => product.id !== removedId)
    .map((product) => {
      const relatedProductIds = normalizeRelatedProductIds(product.relatedProductIds, product.id)
      if (!relatedProductIds.includes(removedId)) return product
      return {
        ...product,
        relatedProductIds: relatedProductIds.filter((id) => id !== removedId),
      }
    })
}

export function searchRelatedProducts({ products = [], query = '', currentProductId = '', selectedIds = [] }) {
  const term = normalizeSearchValue(query).trim()
  if (!term) return []

  const excludedIds = new Set([
    String(currentProductId || '').trim(),
    ...normalizeRelatedProductIds(selectedIds, currentProductId),
  ])

  return products.filter((product) => {
    if (!product?.id || excludedIds.has(product.id)) return false
    return [product.id, product.name, product.brand, product.type, product.category]
      .some((value) => normalizeSearchValue(value).includes(term))
  })
}

export function resolveRelatedProducts(product, products = []) {
  if (!product) return []
  const productsById = new Map(products.map((item) => [item.id, item]))
  return normalizeRelatedProductIds(product.relatedProductIds, product.id)
    .map((id) => productsById.get(id))
    .filter(Boolean)
}

export function resolveCartRelatedProducts(cartDetailed = [], products = []) {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const cartProductIds = new Set(cartDetailed.map((item) => item.product?.id).filter(Boolean))
  const seen = new Set()
  const related = []

  cartDetailed.forEach((item) => {
    normalizeRelatedProductIds(item.product?.relatedProductIds, item.product?.id).forEach((id) => {
      if (seen.has(id) || cartProductIds.has(id)) return
      seen.add(id)
      const product = productsById.get(id)
      if (product?.stock > 0) related.push(product)
    })
  })

  return related
}
