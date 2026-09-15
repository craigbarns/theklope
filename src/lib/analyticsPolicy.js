const PUBLIC_HOSTS = new Set(['theklope.com', 'www.theklope.com'])

export function isInternalAnalyticsPath(pathname = '') {
  try {
    // Includes the former administration URLs, mixed case and encoded paths.
    const path = decodeURIComponent(pathname).replace(/\\/g, '/')
    return /^\/+admin/i.test(path) || /^\/+api(?:\/|$)/i.test(path)
  } catch {
    // An invalid URL must never become permission to send data.
    return true
  }
}

export function isAnalyticsPageAllowed(href) {
  try {
    const url = new URL(href)
    return url.protocol === 'https:'
      && PUBLIC_HOSTS.has(url.hostname)
      && !url.port
      && !url.username
      && !url.password
      && !isInternalAnalyticsPath(url.pathname)
  } catch {
    return false
  }
}

export function sanitizeAnalyticsUrl(href) {
  if (!isAnalyticsPageAllowed(href)) return null
  const url = new URL(href)
  url.search = ''
  url.hash = ''
  return url.toString()
}
