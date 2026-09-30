// Décode le panier transmis par l'e-mail de relance (?reprise=…, base64url de
// [[id, qty, variant?], …]). Tolérant : toute entrée invalide est ignorée.
export function decodeCartRestore(param) {
  if (!param || typeof param !== 'string' || param.length > 6000) return []
  try {
    const base64 = param.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))))
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, 30).flatMap((entry) => {
      if (!Array.isArray(entry)) return []
      const [productId, qty, variant] = entry
      const quantity = Math.floor(Number(qty))
      if (typeof productId !== 'string' || !productId || !(quantity >= 1 && quantity <= 100)) return []
      const safeVariant = variant && typeof variant === 'object' && !Array.isArray(variant) ? variant : {}
      return [{ productId, qty: quantity, variant: safeVariant }]
    })
  } catch {
    return []
  }
}
