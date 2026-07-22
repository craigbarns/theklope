const HARDWARE_IN_LIQUID_PATTERN = /\b(?:r[eé]sistances?|coils?|cartouches?|chargeurs?|batteries?|accus?|clearomiseurs?|tanks?|kits?|pods?|box|mods?|aegis|xros|gtx|pnp|tpp|nautilus|zenith)\b/i

const normalizeName = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()

const extractMl = (value) => {
  const match = String(value || '').match(/\b(\d+(?:[.,]\d+)?)\s*ml\b/i)
  if (!match) return null
  const amount = Number(match[1].replace(',', '.'))
  return Number.isFinite(amount) ? amount : null
}

const isActive = (product) => Number(product?.stock) > 0

export function findCatalogIssues(products = []) {
  const issues = []
  const byId = new Map()
  const activeByName = new Map()

  for (const product of products) {
    const id = String(product?.id || '').trim()
    if (!id) {
      issues.push({ code: 'missing_id', productIds: [], message: 'Une référence ne possède pas d’identifiant.' })
    } else if (byId.has(id)) {
      issues.push({
        code: 'duplicate_id',
        productIds: [id],
        message: `L’identifiant produit « ${id} » est présent plusieurs fois.`,
      })
    } else {
      byId.set(id, product)
    }

    const normalizedName = normalizeName(product?.name)
    if (normalizedName && isActive(product)) {
      const sameName = activeByName.get(normalizedName) || []
      sameName.push(product)
      activeByName.set(normalizedName, sameName)
    }

    if (isActive(product) && (!Number.isFinite(Number(product?.price)) || Number(product.price) <= 0)) {
      issues.push({
        code: 'invalid_price',
        productIds: id ? [id] : [],
        message: `« ${product?.name || id || 'Produit sans nom'} » est en stock sans prix de vente valide.`,
      })
    }

    const volumes = [
      extractMl(product?.name),
      extractMl(product?.volume),
      extractMl(product?.specs?.Contenance),
    ].filter((value) => value != null)
    if (new Set(volumes).size > 1) {
      issues.push({
        code: 'volume_conflict',
        productIds: id ? [id] : [],
        message: `« ${product?.name || id} » présente plusieurs contenances (${[...new Set(volumes)].join(' / ')} ml).`,
      })
    }

    if (isActive(product) && product?.category === 'eliquide' && HARDWARE_IN_LIQUID_PATTERN.test(normalizeName(`${product?.name || ''} ${product?.type || ''}`))) {
      issues.push({
        code: 'hardware_as_liquid',
        productIds: id ? [id] : [],
        message: `« ${product?.name || id} » semble être du matériel classé comme e-liquide.`,
      })
    }
  }

  for (const productsWithSameName of activeByName.values()) {
    if (productsWithSameName.length < 2) continue
    const productIds = productsWithSameName.map((product) => product.id).filter(Boolean)
    issues.push({
      code: 'duplicate_active_name',
      productIds,
      message: `« ${productsWithSameName[0].name} » est vendu sous plusieurs références actives (${productIds.join(', ')}).`,
    })
  }

  return issues
}
