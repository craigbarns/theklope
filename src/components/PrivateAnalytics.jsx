import { Analytics } from '@vercel/analytics/react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { filterVercelAnalyticsEvent } from '../lib/analytics.js'
import { isAnalyticsPageAllowed } from '../lib/analyticsPolicy.js'

export default function PrivateAnalytics() {
  const { cookiesChoice } = useStore()
  const { pathname } = useLocation()
  if (typeof window === 'undefined' || cookiesChoice !== 'accepted') return null
  if (!isAnalyticsPageAllowed(new URL(pathname, window.location.href).href)) return null

  return <Analytics beforeSend={filterVercelAnalyticsEvent} />
}
