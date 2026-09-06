import crypto from 'node:crypto'

const DEFAULT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.COOKIE_SECRET || 'theklope-review-secret-2026'

export function createReviewToken({ orderId, productId, secret = DEFAULT_SECRET }) {
  if (!orderId || !productId) throw new Error('orderId and productId are required')
  const payload = `${orderId.trim()}:${productId.trim()}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${signature}`
}

export function verifyReviewToken({ orderId, productId, token, secret = DEFAULT_SECRET }) {
  if (!orderId || !productId || !token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [encodedPayload, signature] = parts
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const expectedPayload = `${orderId.trim()}:${productId.trim()}`
    if (payload !== expectedPayload) return false

    const expectedSignature = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex')
    if (signature.length !== expectedSignature.length) return false
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch {
    return false
  }
}

export function validateReviewInput({ rating, authorName, comment, title }) {
  const parsedRating = Number(rating)
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return { ok: false, error: 'La note doit être un entier compris entre 1 et 5 étoiles.' }
  }

  const name = String(authorName || '').trim()
  if (name.length < 1 || name.length > 100) {
    return { ok: false, error: 'Le prénom ou nom doit comporter entre 1 et 100 caractères.' }
  }

  const cleanComment = String(comment || '').trim()
  if (cleanComment.length < 5 || cleanComment.length > 2000) {
    return { ok: false, error: 'L’avis doit comporter entre 5 et 2 000 caractères.' }
  }

  const cleanTitle = title ? String(title).trim().slice(0, 150) : null

  return {
    ok: true,
    data: {
      rating: parsedRating,
      authorName: name,
      comment: cleanComment,
      title: cleanTitle,
    },
  }
}
