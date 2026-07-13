import { useEffect } from 'react'
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

export default function ConsentManager() {
  const { cookiesChoice, reviewsChoice } = useStore()
  const location = useLocation()
  const path = `${location.pathname}${location.search}`
  const analyticsAllowed = cookiesChoice === 'accepted'
  const reviewsAllowed = reviewsChoice === 'accepted'

  useEffect(() => {
    setOptionalServicesConsent({ analytics: analyticsAllowed, reviews: reviewsAllowed })
    revokeOptionalServices({ analytics: !analyticsAllowed, reviews: !reviewsAllowed })

    let active = true
    if (reviewsAllowed) loadElfsight()
    if (analyticsAllowed) {
      loadGoogleAnalytics().then(() => {
        if (active) trackPageView(path)
      })
    }

    return () => {
      active = false
    }
  }, [analyticsAllowed, path, reviewsAllowed])

  return analyticsAllowed ? <Analytics /> : null
}
