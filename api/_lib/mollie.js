// Client Mollie — SERVEUR UNIQUEMENT. La clé API (test_xxx / live_xxx) est
// définie dans Vercel → Environment Variables (MOLLIE_API_KEY), jamais côté client.
import { createMollieClient } from '@mollie/api-client'

export function validateMollieConfiguration({ apiKey, vercelEnv, nodeEnv } = {}) {
  const key = String(apiKey || '').trim()
  const production = vercelEnv
    ? vercelEnv === 'production'
    : nodeEnv === 'production'

  if (!key) {
    return { ok: false, production, error: 'MOLLIE_API_KEY manquante.' }
  }
  if (production && !key.startsWith('live_')) {
    return {
      ok: false,
      production,
      error: 'Une clé Mollie live_ est obligatoire en production.',
    }
  }
  if (!/^(?:live|test)_[A-Za-z0-9]+$/.test(key)) {
    return { ok: false, production, error: 'Format de MOLLIE_API_KEY invalide.' }
  }
  return { ok: true, production, apiKey: key, error: '' }
}

const configuration = validateMollieConfiguration({
  apiKey: process.env.MOLLIE_API_KEY,
  vercelEnv: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
})

export const hasMollie = configuration.ok
export const mollieConfigurationError = configuration.error
export const mollie = hasMollie ? createMollieClient({ apiKey: configuration.apiKey }) : null

function normalizedPublicOrigin(value, { production = false } = {}) {
  const raw = String(value || '').trim()
  if (!raw) throw new Error('PUBLIC_BASE_URL manquante.')
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error('URL publique de paiement invalide.')
  }
  const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && !production && localHost)) {
    throw new Error('L’URL publique de paiement doit utiliser HTTPS.')
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !url.hostname) {
    throw new Error('L’URL publique de paiement doit être une origine sans chemin ni paramètres.')
  }
  return url.origin
}

// URL publique de base du site (redirect/cancel/webhook Mollie). Production
// fails closed on one explicit trusted origin; request forwarding headers can
// never redirect payment traffic to an attacker-controlled host.
export function baseUrlFromRequest(req, env = process.env) {
  const production = env.VERCEL_ENV
    ? env.VERCEL_ENV === 'production'
    : env.NODE_ENV === 'production'
  if (env.PUBLIC_BASE_URL) {
    return normalizedPublicOrigin(env.PUBLIC_BASE_URL, { production })
  }
  if (production) throw new Error('PUBLIC_BASE_URL manquante en production.')
  if (env.VERCEL_URL) {
    return normalizedPublicOrigin(`https://${String(env.VERCEL_URL).replace(/^https?:\/\//, '')}`)
  }

  const protoHeader = req?.headers?.['x-forwarded-proto']
  const hostHeader = req?.headers?.host
  if (Array.isArray(protoHeader) || Array.isArray(hostHeader)) {
    throw new Error('En-têtes d’origine de paiement invalides.')
  }
  const proto = String(protoHeader || 'http').split(',')[0].trim()
  const host = String(hostHeader || '').trim()
  return normalizedPublicOrigin(`${proto}://${host}`)
}
