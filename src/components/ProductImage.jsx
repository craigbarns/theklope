// Image produit optimisée :
// - visuels locaux /products/* : version WebP, repli sur le JPG/PNG d'origine ;
// - visuels du catalogue Supabase : redimensionnés et convertis en WebP par
//   l'optimiseur Vercel (src/lib/imageUrl.js), repli sur l'original si
//   l'optimiseur échoue (quota mensuel atteint, environnement local) ;
// - le reste (http, placeholder SVG) est servi tel quel.
//
// `display:contents` sur <picture> évite qu'il crée une boîte : le <img> se
// comporte comme s'il était l'enfant direct du conteneur (les classes de layout
// type h-full/object-cover restent valables).
import { optimizedImageAttrs } from '../lib/imageUrl.js'

const FALLBACK_IMAGE = '/products/product-placeholder.svg'

// /_vercel/image n'existe qu'une fois déployé : en local (vite dev / preview),
// on sert directement l'original plutôt qu'une requête vouée à l'échec.
const OPTIMIZER_AVAILABLE = typeof window === 'undefined'
  || !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)

export default function ProductImage({ src, alt = '', className = '', onError, ...props }) {
  const isLocalRaster = typeof src === 'string' && src.startsWith('/products/') && /\.(jpe?g|png)$/i.test(src)

  const handleError = (event) => {
    onError?.(event)
    if (event.defaultPrevented) return

    const image = event.currentTarget

    // Optimiseur indisponible : on retente l'image d'origine, sans srcset.
    if (image.dataset.optimized === 'true' && image.dataset.optimizedRetried !== 'true') {
      image.dataset.optimizedRetried = 'true'
      image.removeAttribute('srcset')
      image.src = src
      return
    }

    const source = image.parentElement?.tagName === 'PICTURE'
      ? image.parentElement.querySelector('source')
      : null

    // Si le WebP derive manque, retenter d'abord le fichier catalogue. NFC
    // corrige aussi les chemins avec accents decomposes selon l'OS d'import.
    if (source && image.dataset.originalRetried !== 'true') {
      image.dataset.originalRetried = 'true'
      source.remove()
      image.src = String(src || '').normalize('NFC') || FALLBACK_IMAGE
      return
    }

    const normalized = String(src || '').normalize('NFC')
    if (normalized && normalized !== src && image.dataset.normalizedRetried !== 'true') {
      image.dataset.normalizedRetried = 'true'
      image.src = normalized
      return
    }

    if (image.src.endsWith(FALLBACK_IMAGE)) return
    image.src = FALLBACK_IMAGE
  }

  if (!isLocalRaster) {
    const optimized = OPTIMIZER_AVAILABLE ? optimizedImageAttrs(src, props.width) : null
    if (optimized) {
      return (
        <img
          key={optimized.src}
          src={optimized.src}
          srcSet={optimized.srcSet}
          data-optimized="true"
          alt={alt}
          className={className}
          onError={handleError}
          {...props}
        />
      )
    }
    return <img src={src || FALLBACK_IMAGE} alt={alt} className={className} onError={handleError} {...props} />
  }

  const webp = src.replace(/\.(jpe?g|png)$/i, '.webp')
  return (
    <picture style={{ display: 'contents' }}>
      <source srcSet={webp} type="image/webp" width={props.width} height={props.height} />
      <img src={src} alt={alt} className={className} onError={handleError} {...props} />
    </picture>
  )
}
