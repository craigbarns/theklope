const GA_MEASUREMENT_ID = 'G-SF5BGR7ZXQ'
const CONSENT_STORAGE_KEY = 'tk_cookies'
const REVIEWS_CONSENT_STORAGE_KEY = 'tk_reviews_consent'
const GA_SCRIPT_ID = 'theklope-google-analytics'
const ELFSIGHT_SCRIPT_ID = 'theklope-elfsight'
const ACQUISITION_STORAGE_KEY = 'tk_acquisition_v1'
const ACQUISITION_TTL_MS = 90 * 24 * 60 * 60 * 1000
const PURCHASE_SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000
const ACQUISITION_PARAMS = Object.freeze([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_id',
  'utm_term',
  'utm_content',
  'gclid',
  'dclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
])

let googleAnalyticsPromise = null
let elfsightPromise = null
let lastPageView = null
let runtimeAnalyticsConsent = null
let runtimeReviewsConsent = null
let pendingAcquisition = null

const readConsent = (key) => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

export const setOptionalServicesConsent = ({ analytics, reviews, analyticsDecision = null }) => {
  runtimeAnalyticsConsent = Boolean(analytics)
  runtimeReviewsConsent = Boolean(reviews)
  if (analyticsDecision === 'refused') {
    clearStoredAcquisition()
    clearAnalyticsMeasurementStorage()
    pendingAcquisition = null
  } else if (runtimeAnalyticsConsent && pendingAcquisition) {
    persistAcquisition(pendingAcquisition)
    pendingAcquisition = null
  } else if (!runtimeAnalyticsConsent && analyticsDecision !== 'accepted') {
    // Une décision absente n'autorise pas à conserver un ancien identifiant
    // persistant ; le touch courant reste seulement en mémoire jusqu'au choix.
    clearStoredAcquisition()
  }
}

export const hasAnalyticsConsent = () => (
  runtimeAnalyticsConsent ?? readConsent(CONSENT_STORAGE_KEY) === 'accepted'
)

export const hasReviewsConsent = () => {
  if (runtimeReviewsConsent !== null) return runtimeReviewsConsent
  const saved = readConsent(REVIEWS_CONSENT_STORAGE_KEY)
  if (saved !== null) return saved === 'accepted'
  return readConsent(CONSENT_STORAGE_KEY) === 'accepted'
}

const cleanAcquisitionValue = (value, max = 240) => {
  const cleaned = String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, '')
  return cleaned ? cleaned.slice(0, max) : undefined
}

const safeUrl = (value, base) => {
  try {
    return new URL(value, base)
  } catch {
    return null
  }
}

export function buildAnalyticsPageContext({ href, referrer } = {}) {
  const currentHref = href ?? (
    typeof window === 'undefined' ? '' : window.location.href
  )
  const currentUrl = safeUrl(currentHref)
  const pageLocation = currentUrl
    ? (() => {
        currentUrl.search = ''
        currentUrl.hash = ''
        return currentUrl.toString()
      })()
    : '/'

  const currentReferrer = referrer ?? (
    typeof document === 'undefined' ? '' : document.referrer
  )
  const referrerUrl = safeUrl(currentReferrer, currentUrl?.origin)
  if (referrerUrl) {
    referrerUrl.search = ''
    referrerUrl.hash = ''
  }

  return {
    page_location: pageLocation,
    ...(referrerUrl ? { page_referrer: referrerUrl.toString() } : {}),
  }
}

const isPaymentReferrer = (hostname) => (
  hostname === 'mollie.com'
  || hostname.endsWith('.mollie.com')
  || hostname === 'mollie.nl'
  || hostname.endsWith('.mollie.nl')
)

export function buildAcquisitionTouch({ href, referrer = '', capturedAt = new Date().toISOString() } = {}) {
  const pageUrl = safeUrl(href)
  if (!pageUrl) return null

  const params = {}
  for (const key of ACQUISITION_PARAMS) {
    const value = cleanAcquisitionValue(pageUrl.searchParams.get(key))
    if (value) params[key] = value
  }

  const referrerUrl = safeUrl(referrer, pageUrl.origin)
  const externalReferrer = referrerUrl
    && referrerUrl.hostname !== pageUrl.hostname
    && !isPaymentReferrer(referrerUrl.hostname)
      ? `${referrerUrl.origin}${referrerUrl.pathname}`.slice(0, 500)
      : undefined

  if (Object.keys(params).length === 0 && !externalReferrer) return null

  return {
    ...params,
    landing_path: `${pageUrl.pathname}${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ''}`.slice(0, 800),
    ...(externalReferrer ? { referrer: externalReferrer } : {}),
    captured_at: capturedAt,
  }
}

const readStoredAcquisitionRecord = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACQUISITION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Number(parsed.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(ACQUISITION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const clearStoredAcquisition = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(ACQUISITION_STORAGE_KEY)
  } catch {
    // Le refus reste appliqué en mémoire même si le stockage est bloqué.
  }
}

const isAnalyticsMeasurementKey = (key) => (
  typeof key === 'string'
  && (key.startsWith('tk_purchase_') || key.startsWith('tk_refund_'))
)

const clearAnalyticsMeasurementStorage = () => {
  if (typeof window === 'undefined') return
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = window[storageName]
      const keys = []
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (isAnalyticsMeasurementKey(key)) keys.push(key)
      }
      keys.forEach((key) => storage.removeItem(key))
    } catch {
      // Le refus reste actif en mémoire même si un stockage est inaccessible.
    }
  }
}

export function serializePurchaseSnapshot(data, now = Date.now()) {
  return JSON.stringify({
    version: 1,
    expiresAt: now + PURCHASE_SNAPSHOT_TTL_MS,
    data,
  })
}

export function parsePurchaseSnapshot(raw, now = Date.now()) {
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    const parsed = JSON.parse(raw)
    // Compatibilité avec les snapshots de session créés avant l'ajout du TTL.
    if (!Object.hasOwn(parsed || {}, 'expiresAt')) return parsed && typeof parsed === 'object' ? parsed : null
    if (!Number.isFinite(Number(parsed.expiresAt)) || Number(parsed.expiresAt) <= now) return null
    return parsed.data && typeof parsed.data === 'object' ? parsed.data : null
  } catch {
    return null
  }
}

const persistAcquisition = (touch) => {
  if (typeof window === 'undefined' || !touch || !hasAnalyticsConsent()) return false
  try {
    const previous = readStoredAcquisitionRecord()
    const now = Date.now()
    window.localStorage.setItem(ACQUISITION_STORAGE_KEY, JSON.stringify({
      firstTouch: previous?.firstTouch || touch,
      lastTouch: touch,
      consentRecordedAt: previous?.consentRecordedAt || new Date(now).toISOString(),
      expiresAt: now + ACQUISITION_TTL_MS,
    }))
    return true
  } catch {
    return false
  }
}

// À appeler au démarrage, avant que React ne retire les paramètres de la route.
// Sans consentement, l'information reste uniquement en mémoire et n'est jamais
// transmise au serveur. L'acceptation la persiste ; un refus explicite l'efface.
export function captureAcquisition({ href, referrer, capturedAt } = {}) {
  if (typeof window === 'undefined' && !href) return null
  const touch = buildAcquisitionTouch({
    href: href || window.location.href,
    referrer: referrer ?? (typeof document === 'undefined' ? '' : document.referrer),
    capturedAt,
  })
  if (!touch) return null

  if (hasAnalyticsConsent()) {
    persistAcquisition(touch)
  } else {
    pendingAcquisition = touch
  }
  return touch
}

// Contrat checkout/API : renvoie null sans consentement analytique. Quand il
// existe, l'objet JSON peut être joint tel quel à create-payment puis stocké
// côté serveur avec la commande (firstTouch, lastTouch, consentRecordedAt).
export function getStoredAcquisition() {
  if (!hasAnalyticsConsent()) return null
  const record = readStoredAcquisitionRecord()
  if (!record?.firstTouch || !record?.lastTouch) return null
  return {
    firstTouch: record.firstTouch,
    lastTouch: record.lastTouch,
    consentRecordedAt: record.consentRecordedAt,
  }
}

const ensureGtagQueue = () => {
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments)
  }
}

export function loadGoogleAnalytics() {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return Promise.resolve(false)
  if (googleAnalyticsPromise) return googleAnalyticsPromise

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false
  ensureGtagQueue()
  window.gtag('js', new Date())
  // Réapplique explicitement l'accord après un cycle accepter → refuser →
  // accepter. Le refus précédent a pu laisser Consent Mode en état `denied`.
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...buildAnalyticsPageContext(),
  })

  googleAnalyticsPromise = new Promise((resolve) => {
    const existing = document.getElementById(GA_SCRIPT_ID)
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.id = GA_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.onload = () => resolve(true)
    script.onerror = () => {
      googleAnalyticsPromise = null
      resolve(false)
    }
    document.head.appendChild(script)
  })

  return googleAnalyticsPromise
}

export function loadElfsight() {
  if (typeof window === 'undefined' || !hasReviewsConsent()) return Promise.resolve(false)
  if (elfsightPromise) return elfsightPromise

  elfsightPromise = new Promise((resolve) => {
    const existing = document.getElementById(ELFSIGHT_SCRIPT_ID)
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.id = ELFSIGHT_SCRIPT_ID
    script.async = true
    script.src = 'https://elfsightcdn.com/platform.js'
    script.onload = () => resolve(true)
    script.onerror = () => {
      elfsightPromise = null
      resolve(false)
    }
    document.head.appendChild(script)
  })

  return elfsightPromise
}

const clearAnalyticsCookies = () => {
  if (typeof document === 'undefined') return
  const domains = ['', window.location.hostname, `.${window.location.hostname}`, '.theklope.com']
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim()
    if (!name || (!name.startsWith('_ga') && name !== '_gid' && name !== '_gat')) return
    domains.forEach((domain) => {
      const domainPart = domain ? `;domain=${domain}` : ''
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}`
    })
  })
}

export function revokeOptionalServices({ analytics = true, reviews = true, analyticsDecision = null } = {}) {
  if (typeof window === 'undefined') return

  if (analytics) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true
    document.getElementById(GA_SCRIPT_ID)?.remove()
    clearAnalyticsCookies()
    googleAnalyticsPromise = null
    lastPageView = null
    if (analyticsDecision === 'refused' || readConsent(CONSENT_STORAGE_KEY) === 'refused') {
      clearStoredAcquisition()
      clearAnalyticsMeasurementStorage()
      pendingAcquisition = null
    }
  }

  if (reviews) {
    document.getElementById(ELFSIGHT_SCRIPT_ID)?.remove()
    elfsightPromise = null
  }
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return false
  if (typeof window.gtag !== 'function') loadGoogleAnalytics()
  if (typeof window.gtag !== 'function') return false
  window.gtag('event', name, {
    ...params,
    // Défense en profondeur : GA4 reçoit toujours une URL et un référent sans
    // paramètres libres, y compris pour les événements e-commerce automatiques.
    ...buildAnalyticsPageContext(),
  })
  return true
}

export async function trackEventWhenReady(name, params = {}) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return false
  const loaded = await loadGoogleAnalytics()
  if (!loaded || typeof window.gtag !== 'function') return false
  window.gtag('event', name, {
    ...params,
    ...buildAnalyticsPageContext(),
  })
  return true
}

const pagePathWithoutQuery = (value) => {
  if (!value) return ''
  const path = String(value || '').split(/[?#]/, 1)[0]
  return path.startsWith('/') ? path : `/${path}`
}

export function trackPageView(path) {
  const pagePath = pagePathWithoutQuery(path)
  if (!pagePath || pagePath === lastPageView || !hasAnalyticsConsent()) return false
  const tracked = trackEvent('page_view', {
    // Les paramètres libres (`q`, identifiants de retour paiement, etc.) ne
    // quittent jamais le navigateur dans un événement de page.
    page_path: pagePath,
    page_title: document.title,
  })
  if (tracked) lastPageView = pagePath
  return tracked
}

export const toAnalyticsItem = (product, quantity = 1, variant = {}) => ({
  item_id: product.id,
  item_name: product.name,
  item_brand: product.brand,
  item_category: product.category,
  price: Number(product.price) || 0,
  quantity: Number(quantity) || 1,
  item_variant: Object.values(variant || {}).filter((value) => value != null && value !== '').join(', '),
})

const cleanEventText = (value, max = 100) => {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
  return cleaned ? cleaned.slice(0, max) : undefined
}

const isAnalyticsItem = (item) => (
  item
  && typeof item === 'object'
  && (cleanEventText(item.item_id) || cleanEventText(item.item_name))
)

const normalizeAnalyticsItems = (items) => (
  Array.isArray(items) ? items.filter(isAnalyticsItem) : []
)

const analyticsItemsValue = (items) => (
  items.reduce((total, item) => {
    const price = Number(item.price)
    const quantity = Number(item.quantity)
    if (!Number.isFinite(price) || price < 0) return total
    return total + (price * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1))
  }, 0)
)

const ecommerceParams = ({
  items,
  value,
  currency = 'EUR',
  coupon,
  ...params
} = {}) => {
  const normalizedItems = normalizeAnalyticsItems(items)
  if (normalizedItems.length === 0) return null

  const numericValue = value == null ? analyticsItemsValue(normalizedItems) : Number(value)
  return {
    currency: cleanEventText(currency, 3)?.toUpperCase() || 'EUR',
    value: Number.isFinite(numericValue) && numericValue >= 0
      ? Math.round(numericValue * 100) / 100
      : analyticsItemsValue(normalizedItems),
    ...(cleanEventText(coupon) ? { coupon: cleanEventText(coupon) } : {}),
    ...params,
    items: normalizedItems,
  }
}

// GA4 recommandé : interaction avec un produit depuis une liste ou des
// résultats de recherche. `item` accepte déjà un objet issu de toAnalyticsItem ;
// `product` est le raccourci destiné aux composants de cartes produit.
export function trackSelectItem({
  product,
  item,
  quantity = 1,
  variant = {},
  itemListId,
  itemListName,
  index,
} = {}) {
  const analyticsItem = item || (product ? toAnalyticsItem(product, quantity, variant) : null)
  if (!isAnalyticsItem(analyticsItem)) return false

  const numericIndex = Number(index)
  return trackEvent('select_item', {
    ...(cleanEventText(itemListId) ? { item_list_id: cleanEventText(itemListId) } : {}),
    ...(cleanEventText(itemListName) ? { item_list_name: cleanEventText(itemListName) } : {}),
    items: [{
      ...analyticsItem,
      ...(Number.isInteger(numericIndex) && numericIndex >= 0 ? { index: numericIndex } : {}),
    }],
  })
}

// `zero_results` est un événement personnalisé complémentaire au `search`
// recommandé par GA4. Le texte libre n'est jamais envoyé à Google : un client
// peut saisir par erreur un e-mail, un téléphone ou un identifiant de commande.
export function trackSearch({ searchTerm, resultCount } = {}) {
  const normalizedTerm = cleanEventText(searchTerm)
  if (!normalizedTerm) return false

  const numericResultCount = Number(resultCount)
  const params = {
    search_term: 'catalogue_query',
    query_length: normalizedTerm.length,
    query_token_count: normalizedTerm.split(/\s+/).filter(Boolean).length,
    ...(Number.isFinite(numericResultCount) && numericResultCount >= 0
      ? { result_count: Math.floor(numericResultCount) }
      : {}),
  }
  const searchTracked = trackEvent('search', params)
  if (params.result_count !== 0) return searchTracked
  return trackEvent('zero_results', params) && searchTracked
}

export function trackViewCart({ items, value, currency = 'EUR', coupon } = {}) {
  const params = ecommerceParams({ items, value, currency, coupon })
  return params ? trackEvent('view_cart', params) : false
}

export function trackRemoveFromCart({
  product,
  item,
  quantity = 1,
  variant = {},
  value,
  currency = 'EUR',
  coupon,
} = {}) {
  const analyticsItem = item || (product ? toAnalyticsItem(product, quantity, variant) : null)
  const params = ecommerceParams({
    items: analyticsItem ? [analyticsItem] : [],
    value,
    currency,
    coupon,
  })
  return params ? trackEvent('remove_from_cart', params) : false
}

export function trackAddPaymentInfo({
  items,
  value,
  currency = 'EUR',
  coupon,
  paymentType,
} = {}) {
  const params = ecommerceParams({
    items,
    value,
    currency,
    coupon,
    ...(cleanEventText(paymentType) ? { payment_type: cleanEventText(paymentType) } : {}),
  })
  return params ? trackEvent('add_payment_info', params) : false
}

const trackSafeError = (name, {
  errorCode = 'unknown',
  checkoutStep,
  paymentProvider,
  paymentType,
  retryable,
} = {}) => {
  const numericStep = Number(checkoutStep)
  const normalizedStep = Number.isInteger(numericStep) && numericStep > 0
    ? numericStep
    : cleanEventText(checkoutStep)
  return trackEvent(name, {
    error_code: cleanEventText(errorCode) || 'unknown',
    ...(normalizedStep ? { checkout_step: normalizedStep } : {}),
    ...(cleanEventText(paymentProvider) ? { payment_provider: cleanEventText(paymentProvider) } : {}),
    ...(cleanEventText(paymentType) ? { payment_type: cleanEventText(paymentType) } : {}),
    ...(typeof retryable === 'boolean' ? { retryable } : {}),
  })
}

export const trackCheckoutError = (params = {}) => trackSafeError('checkout_error', params)

export const trackPaymentError = (params = {}) => trackSafeError('payment_error', params)
