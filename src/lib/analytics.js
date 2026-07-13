const GA_MEASUREMENT_ID = 'G-SF5BGR7ZXQ'
const CONSENT_STORAGE_KEY = 'tk_cookies'
const REVIEWS_CONSENT_STORAGE_KEY = 'tk_reviews_consent'
const GA_SCRIPT_ID = 'theklope-google-analytics'
const ELFSIGHT_SCRIPT_ID = 'theklope-elfsight'

let googleAnalyticsPromise = null
let elfsightPromise = null
let lastPageView = null
let runtimeAnalyticsConsent = null
let runtimeReviewsConsent = null

const readConsent = (key) => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

export const setOptionalServicesConsent = ({ analytics, reviews }) => {
  runtimeAnalyticsConsent = Boolean(analytics)
  runtimeReviewsConsent = Boolean(reviews)
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

export function revokeOptionalServices({ analytics = true, reviews = true } = {}) {
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
