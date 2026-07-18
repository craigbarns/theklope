import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useStore } from '../context/StoreContext.jsx'
import {
  loadElfsight,
  loadGoogleAnalytics,
  revokeOptionalServices,
  setOptionalServicesConsent,
  trackPageView,
} from '../lib/analytics.js'
import {
  getPageSeoReadyPathname,
  isPageReadyForAnalytics,
  SEO_READY_EVENT,
} from '../lib/pageReadiness.js'

export default function ConsentManager() {
  const { cookiesChoice, reviewsChoice } = useStore()
  const location = useLocation()
  const path = `${location.pathname}${location.search}`
  const [seoReadyPathname, setSeoReadyPathname] = useState(() => getPageSeoReadyPathname())
  const pageReady = isPageReadyForAnalytics(location.pathname, seoReadyPathname)
  const analyticsAllowed = cookiesChoice === 'accepted'
  const reviewsAllowed = reviewsChoice === 'accepted'

  useEffect(() => {
    const syncSeoReadyPathname = (event) => {
      const pathname = event?.detail?.pathname || getPageSeoReadyPathname()
      if (pathname) setSeoReadyPathname(pathname)
    }

    window.addEventListener(SEO_READY_EVENT, syncSeoReadyPathname)
    syncSeoReadyPathname()
    return () => window.removeEventListener(SEO_READY_EVENT, syncSeoReadyPathname)
  }, [location.pathname])

  useEffect(() => {
    setOptionalServicesConsent({ analytics: analyticsAllowed, reviews: reviewsAllowed })
    revokeOptionalServices({ analytics: !analyticsAllowed, reviews: !reviewsAllowed })

    let active = true
    let pageViewTimer = null
    if (reviewsAllowed) loadElfsight()
    if (analyticsAllowed) {
      loadGoogleAnalytics().then(() => {
        if (active && pageReady) {
          // Laisse les effets SEO appliquer le titre final avant de prendre
          // l'instantané GA4. Une fiche produit en chargement n'est pas une 404.
          pageViewTimer = window.setTimeout(() => {
            if (active) trackPageView(path)
          }, 0)
        }
      })
    }

    return () => {
      active = false
      if (pageViewTimer !== null) window.clearTimeout(pageViewTimer)
    }
  }, [analyticsAllowed, pageReady, path, reviewsAllowed])

  return analyticsAllowed ? <Analytics /> : null
}
