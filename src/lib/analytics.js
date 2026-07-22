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
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
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
  window.gtag('event', name, params)
  return true
}

export async function trackEventWhenReady(name, params = {}) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return false
  const loaded = await loadGoogleAnalytics()
  if (!loaded || typeof window.gtag !== 'function') return false
  window.gtag('event', name, params)
  return true
}

export function trackPageView(path) {
  if (!path || path === lastPageView || !hasAnalyticsConsent()) return false
  const tracked = trackEvent('page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  })
  if (tracked) lastPageView = path
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
