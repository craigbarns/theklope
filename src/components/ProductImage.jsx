// Image produit optimisée : sert une version WebP (beaucoup plus légère) pour les
// visuels locaux /products/*, avec repli automatique sur le JPG/PNG d'origine si
// le navigateur ne gère pas WebP. Les URLs distantes (Supabase, http) et le SVG
// placeholder sont servis tels quels.
//
// `display:contents` sur <picture> évite qu'il crée une boîte : le <img> se
// comporte comme s'il était l'enfant direct du conteneur (les classes de layout
// type h-full/object-cover restent valables).
const FALLBACK_IMAGE = '/products/product-placeholder.svg'

export default function ProductImage({ src, alt = '', className = '', onError, ...props }) {
  const isLocalRaster = typeof src === 'string' && src.startsWith('/products/') && /\.(jpe?g|png)$/i.test(src)

  const handleError = (event) => {
    onError?.(event)
    if (event.defaultPrevented) return

    const image = event.currentTarget
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
