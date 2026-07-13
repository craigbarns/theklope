import { createHmac } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'

const RATE_LIMIT_SECRET = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

export function getClientIp(req) {
  const raw = req?.headers?.['x-vercel-forwarded-for']
    || req?.headers?.['x-forwarded-for']
    || req?.socket?.remoteAddress
    || 'unknown'
  return String(Array.isArray(raw) ? raw[0] : raw).split(',')[0].trim().slice(0, 120) || 'unknown'
}

export function hashRateLimitKey(value, secret = RATE_LIMIT_SECRET) {
  if (!secret) throw new Error('Secret de limitation de debit non configure.')
  return createHmac('sha256', secret).update(String(value)).digest('hex')
}

export async function enforceRequestRateLimits(req, rules, {
  client = supabaseAdmin,
  secret = RATE_LIMIT_SECRET,
} = {}) {
  if (!client) throw new Error('Base de donnees non configuree pour la limitation de debit.')

  const ip = getClientIp(req)
  for (const rule of rules) {
    const value = rule.value === undefined ? ip : rule.value
    const keyHash = hashRateLimitKey(`${rule.scope}:${value}`, secret)
    const { data, error } = await client.rpc('consume_rate_limit', {
      p_scope: rule.scope,
      p_key_hash: keyHash,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    })
    if (error) throw error
    if (data !== true) {
      return { allowed: false, retryAfter: rule.windowSeconds }
    }
  }

  return { allowed: true, retryAfter: 0 }
}
