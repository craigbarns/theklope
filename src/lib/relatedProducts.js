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
  const manualRelated = normalizeRelatedProductIds(product.relatedProductIds, product.id)
    .map((id) => productsById.get(id))
    .filter(Boolean)

  if (manualRelated.length >= 4) return manualRelated.slice(0, 4)

  // -- SEO & Conversion : Génération automatique de Cross-Sell si vide ou incomplet --
  const autoRelated = new Set(manualRelated.map((p) => p.id))
  const suggestions = [...manualRelated]

  const addSuggestion = (p) => {
    if (suggestions.length >= 4 || autoRelated.has(p.id) || p.id === product.id) return
    autoRelated.add(p.id)
    suggestions.push(p)
  }

  // Helper pour trouver des produits selon des critères
  const findProducts = (condition, limit = 4) => {
    for (const p of products) {
      if (suggestions.length >= 4) break
      if (condition(p) && p.stock > 0) addSuggestion(p)
    }
  }

  const pCat = product.category || ''
  const pBrand = product.brand || ''

  if (['ecig', 'pod', 'pack'].includes(pCat)) {
    // 1. Matériel : Recommander en priorité les résistances ou cartouches de la MÊME MARQUE
    findProducts((p) => ['resistance', 'cartouches', 'accessoire'].includes(p.category) && p.brand === pBrand)
    // 2. Compléter avec des E-liquides adaptés (Sels de nicotine pour les pods)
    findProducts((p) => p.category === 'eliquide' && (pCat === 'pod' ? p.name.toLowerCase().includes('sel') : true))
  } else if (pCat === 'eliquide' || pCat.startsWith('eliquide-')) {
    // 1. E-liquide : Recommander d'autres e-liquides de la même marque
    findProducts((p) => p.category === 'eliquide' && p.brand === pBrand)
    // 2. Compléter avec les best-sellers e-liquides
    findProducts((p) => p.category === 'eliquide' && p.badge === 'best-seller')
  } else if (pCat.startsWith('diy-')) {
    // 1. DIY : Recommander les boosters et bases
    findProducts((p) => ['diy-bases', 'diy-boosters', 'diy-aromes'].includes(p.category))
  } else {
    // Fallback : produits de la même marque ou même catégorie
    findProducts((p) => p.brand === pBrand && p.category === pCat)
    findProducts((p) => p.category === pCat)
  }

  return suggestions.slice(0, 4)
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
