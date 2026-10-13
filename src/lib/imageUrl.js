// Images produit servies par l'optimiseur d'images de Vercel (/_vercel/image).
// Les visuels du catalogue sont stockés dans Supabase Storage en taille
// d'origine (souvent des PNG de 1 000 à 2 000 px, 300 à 800 Ko) et sans durée
// de cache longue : c'était le premier poste de lenteur mesuré par PageSpeed
// (3 Mo sur une page catégorie, LCP mobile de 4 à 6 s).
//
// Partagé par le navigateur (ProductImage) et le pré-rendu (scripts/
// prerender.mjs) : les deux demandent exactement la même URL, l'image vue par
// Google est donc celle que le visiteur a déjà en cache.
//
// Quota Vercel Hobby : 5 000 transformations par mois, comptées à chaque
// absence en cache. D'où trois largeurs seulement et un cache de 31 jours
// (vercel.json → images). Au-delà du quota, Vercel répond 402 et ProductImage
// repasse sur l'image d'origine : rien ne casse.

export const OPTIMIZED_IMAGE_WIDTHS = [256, 384, 828]
export const OPTIMIZED_IMAGE_QUALITY = 70
export const SUPABASE_IMAGE_HOST = 'xbfpgyhtpreijgttjidr.supabase.co'

const PUBLIC_STORAGE_PATH = '/storage/v1/object/public/'

export function isOptimizableImage(src) {
  if (typeof src !== 'string') return false
  let url
  try {
    url = new URL(src)
  } catch {
    return false
  }
  return url.protocol === 'https:'
    && url.hostname === SUPABASE_IMAGE_HOST
    && url.pathname.startsWith(PUBLIC_STORAGE_PATH)
    && /\.(jpe?g|png|webp)$/i.test(url.pathname)
}

export function optimizedImageUrl(src, width) {
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${OPTIMIZED_IMAGE_QUALITY}`
}

// Largeurs demandées selon la taille d'affichage (attribut width du composant) :
// 1x et 2x (écrans haute densité), ramenées aux trois largeurs autorisées.
export function optimizedWidthsFor(displayWidth) {
  const width = Number(displayWidth) || 828
  if (width <= 128) return [256]
  if (width <= 200) return [256, 384]
  if (width <= 450) return [384, 828]
  return [828]
}

// { src, srcSet } prêts pour <img>, ou null si l'image n'est pas optimisable.
export function optimizedImageAttrs(src, displayWidth) {
  if (!isOptimizableImage(src)) return null
  const [base, retina] = optimizedWidthsFor(displayWidth)
  return {
    src: optimizedImageUrl(src, base),
    srcSet: retina ? `${optimizedImageUrl(src, base)} 1x, ${optimizedImageUrl(src, retina)} 2x` : undefined,
  }
}
