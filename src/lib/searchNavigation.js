const SHOP_PATH = '/boutique'
const SHOP_SEARCH_STATE_KEY = 'shopSearchQuery'
const MAX_SEARCH_LENGTH = 120

const normalizeShopSearchQuery = (value) => (
  String(value ?? '').trim().slice(0, MAX_SEARCH_LENGTH)
)

export function getShopSearchQuery(state) {
  return normalizeShopSearchQuery(state?.[SHOP_SEARCH_STATE_KEY])
}

export function createShopSearchState(state, query) {
  const nextState = state && typeof state === 'object' ? { ...state } : {}
  const normalizedQuery = normalizeShopSearchQuery(query)

  if (normalizedQuery) nextState[SHOP_SEARCH_STATE_KEY] = normalizedQuery
  else delete nextState[SHOP_SEARCH_STATE_KEY]

  return nextState
}

// Les recherches peuvent contenir par erreur un e-mail, un téléphone ou un
// numéro de commande. Une URL entrante `?q=` reste compatible avec les liens
// externes et le balisage SearchAction, puis sa valeur est déplacée dans l'état
// privé de React Router avant le chargement de tout outil analytique.
export function preserveShopSearchFromUrl({ href, history } = {}) {
  const currentHref = href ?? (typeof window === 'undefined' ? '' : window.location.href)
  const historyApi = history ?? (typeof window === 'undefined' ? null : window.history)

  let url
  try {
    url = new URL(currentHref)
  } catch {
    return ''
  }

  if (url.pathname !== SHOP_PATH || !url.searchParams.has('q')) {
    return getShopSearchQuery(historyApi?.state?.usr)
  }

  const query = normalizeShopSearchQuery(url.searchParams.get('q'))
  url.searchParams.delete('q')

  if (typeof historyApi?.replaceState === 'function') {
    const previousState = historyApi.state && typeof historyApi.state === 'object'
      ? historyApi.state
      : {}
    historyApi.replaceState({
      ...previousState,
      usr: createShopSearchState(previousState.usr, query),
    }, '', `${url.pathname}${url.search}${url.hash}`)
  }

  return query
}
