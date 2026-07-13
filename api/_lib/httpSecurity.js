export function setNoStore(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('Pragma', 'no-cache')
}

export function isRequestOriginAllowed(req) {
  const origin = String(req.headers?.origin || '').trim()
  if (!origin) return true

  const forwardedHost = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '')
    .split(',')[0]
    .trim()
  const candidates = [
    process.env.PUBLIC_BASE_URL,
    forwardedHost ? `https://${forwardedHost}` : '',
    forwardedHost ? `http://${forwardedHost}` : '',
  ].filter(Boolean)

  const allowedOrigins = new Set(candidates.map((value) => {
    try {
      return new URL(value).origin
    } catch {
      return ''
    }
  }))
  return allowedOrigins.has(origin)
}

export function configureSameOriginCors(req, res, methods = 'POST, OPTIONS') {
  const origin = String(req.headers?.origin || '').trim()
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', methods)

  if (!isRequestOriginAllowed(req)) return false
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  return true
}
