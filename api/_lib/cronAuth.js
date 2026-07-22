import { timingSafeEqual } from 'node:crypto'

export function isAuthorizedCronRequest(req, secret = process.env.CRON_SECRET) {
  if (typeof secret !== 'string' || secret.length < 16) return false
  const authorization = req?.headers?.authorization
  if (Array.isArray(authorization)) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(String(authorization || ''))
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function isSafelyUnstartedCheckout(order) {
  return Boolean(
    order?.checkout_idempotency_key
    && order.payment_create_status === 'not_started'
    && !order.payment_create_started_at
    && !order.payment_id,
  )
}
