// Client Mollie — SERVEUR UNIQUEMENT. La clé API (test_xxx / live_xxx) est
// définie dans Vercel → Environment Variables (MOLLIE_API_KEY), jamais côté client.
import { createMollieClient } from '@mollie/api-client'

const apiKey = process.env.MOLLIE_API_KEY

export const hasMollie = Boolean(apiKey)

export const mollie = hasMollie ? createMollieClient({ apiKey }) : null

// URL publique de base du site (pour redirectUrl / webhookUrl Mollie).
// Priorité à PUBLIC_BASE_URL, sinon on reconstruit depuis les en-têtes de la requête.
export function baseUrlFromRequest(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '')
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}
