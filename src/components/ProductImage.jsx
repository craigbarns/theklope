// Image produit optimisée : sert une version WebP (beaucoup plus légère) pour les
// visuels locaux /products/*, avec repli automatique sur le JPG/PNG d'origine si
// le navigateur ne gère pas WebP. Les URLs distantes (Supabase, http) et le SVG
// placeholder sont servis tels quels.
//
// `display:contents` sur <picture> évite qu'il crée une boîte : le <img> se
// comporte comme s'il était l'enfant direct du conteneur (les classes de layout
// type h-full/object-cover restent valables).
export default function ProductImage({ src, alt = '', className = '', ...props }) {
  const isLocalRaster = typeof src === 'string' && src.startsWith('/products/') && /\.(jpe?g|png)$/i.test(src)

  if (!isLocalRaster) {
    return <img src={src || '/products/product-placeholder.svg'} alt={alt} className={className} {...props} />
  }

  const webp = src.replace(/\.(jpe?g|png)$/i, '.webp')
  return (
    <picture style={{ display: 'contents' }}>
      <source srcSet={webp} type="image/webp" />
      <img src={src} alt={alt} className={className} {...props} />
    </picture>
  )
}
