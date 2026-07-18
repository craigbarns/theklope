export const SEO_READY_EVENT = 'theklope:seo-ready'

let seoReadyPathname = null

export const PRODUCT_PAGE_STATE = Object.freeze({
  loading: 'loading',
  error: 'error',
  ready: 'ready',
  notFound: 'not-found',
})

export function getProductPageState({ product, catalogReady, syncStatus }) {
  if (product) return PRODUCT_PAGE_STATE.ready
  if (catalogReady) return PRODUCT_PAGE_STATE.notFound
  if (syncStatus === 'error') return PRODUCT_PAGE_STATE.error
  return PRODUCT_PAGE_STATE.loading
}

export function markPageSeoReady(pathname) {
  if (typeof window === 'undefined' || !pathname) return
  seoReadyPathname = pathname
  window.dispatchEvent(new CustomEvent(SEO_READY_EVENT, { detail: { pathname } }))
}

export function getPageSeoReadyPathname() {
  return seoReadyPathname
}

export function isPageReadyForAnalytics(pathname, readyPathname) {
  return Boolean(pathname) && pathname === readyPathname
}
