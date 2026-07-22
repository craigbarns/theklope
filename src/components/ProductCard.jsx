import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Badge from './Badge.jsx'
import ProductImage from './ProductImage.jsx'
import { IconHeart, IconCart } from './icons.jsx'
import { productRequiresVariantSelection, resolveProductVariant } from '../lib/cart.js'

export default function ProductCard({ product }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore()
  const fav = isFavorite(product.id)
  const outOfStock = product.stock <= 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const requiresChoice = productRequiresVariantSelection(product)
  const productUrl = `/produit/${product.id}`

  const handleAdd = () => {
    if (outOfStock) return
    const normalized = resolveProductVariant(product)
    if (normalized.ok) addToCart(product.id, 1, normalized.variant)
  }

  return (
    <article
      className="card-interactive focus-ring group relative flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
        <Link to={productUrl} className="focus-ring block h-full w-full" aria-label={`Voir ${product.name}`}>
          <ProductImage
            src={product.image}
            alt={`${product.name} — ${product.type} ${product.brand}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.07]"
            width={400}
            height={400}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && <Badge type={product.badge} />}
          {product.oldPrice && !product.badge && <Badge type="promo" />}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`focus-ring absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition active:scale-90 ${
            fav
              ? 'border-neon/40 bg-neon/15 text-neon'
              : 'border-white/10 bg-black/40 text-white/70 hover:scale-110 hover:text-white'
          }`}
        >
          <IconHeart filled={fav} width={17} height={17} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] uppercase tracking-wider text-faint">{product.type}</span>
        <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold text-white">
          <Link to={productUrl} className="focus-ring rounded-sm hover:text-neon">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{product.short}</p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-faint line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          {requiresChoice && !outOfStock ? (
            <Link
              to={productUrl}
              aria-label={`Choisir les options de ${product.name}`}
              className="focus-ring flex h-10 items-center gap-1.5 rounded-full bg-neon px-3 text-[11px] font-bold text-noir transition hover:scale-105 hover:shadow-glow active:scale-95"
            >
              Choisir
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={outOfStock ? `${product.name} en rupture de stock` : `Ajouter ${product.name} au panier`}
              className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-neon text-noir transition hover:scale-105 hover:shadow-glow active:scale-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-faint disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <IconCart width={18} height={18} />
            </button>
          )}
        </div>
        {outOfStock ? (
          <p className="mt-2 text-[11px] font-medium text-rose-400">Rupture de stock</p>
        ) : lowStock ? (
          <p className="mt-2 text-[11px] font-medium text-amber-400">
            Plus que {product.stock} en stock
          </p>
        ) : null}
      </div>
    </article>
  )
}
