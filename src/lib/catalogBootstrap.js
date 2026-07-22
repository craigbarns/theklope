export const CATALOG_BOOTSTRAP_ID = 'theklope-catalog-bootstrap'

const isBootstrapProduct = (product) => (
  product
  && typeof product === 'object'
  && !Array.isArray(product)
  && typeof product.id === 'string'
  && product.id.length > 0
  && typeof product.name === 'string'
  && Number.isFinite(Number(product.price))
  && Number.isFinite(Number(product.stock))
)

// Le pré-rendu embarque uniquement les produits utiles à la route d'entrée.
// Ce bootstrap provient du même catalogue live que le HTML généré et évite un
// premier rendu vide. Il reste provisoire : Supabase le remplace dès sa réponse.
export function parseCatalogBootstrap(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isBootstrapProduct)
  } catch {
    return []
  }
}

export function readCatalogBootstrap(doc = typeof document === 'undefined' ? null : document) {
  if (!doc) return []
  const node = doc.getElementById(CATALOG_BOOTSTRAP_ID)
  const bootstrapPath = node?.getAttribute?.('data-prerender-path')
  const currentPath = doc.defaultView?.location?.pathname
    || (typeof window === 'undefined' ? null : window.location.pathname)
  if (bootstrapPath && currentPath && bootstrapPath !== currentPath) return []
  return parseCatalogBootstrap(node?.textContent || '')
}
