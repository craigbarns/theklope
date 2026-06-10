import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Badge from './Badge.jsx'
import Stars from './Stars.jsx'
import { IconHeart, IconCart } from './icons.jsx'

export default function ProductCard({ product }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore()
  const fav = isFavorite(product.id)
  const lowStock = product.stock <= 10

  const handleAdd = (e) => {
    e.preventDefault()
    const variant = {}
    if (product.colors?.length) variant.color = product.colors[0]
    if (product.flavors?.length) variant.flavor = product.flavors[0]
    if (product.nicotine?.length) variant.nicotine = product.nicotine[0]
    addToCart(product.id, 1, variant)
  }

  return (
    <Link
      to={`/produit/${product.id}`}
      className="card-interactive focus-ring group relative flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
        <img
          src={product.image}
          alt={`${product.name} — ${product.type} ${product.brand}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && <Badge type={product.badge} />}
          {product.oldPrice && !product.badge && <Badge type="promo" />}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(product.id)
          }}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`focus-ring absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition active:scale-90 ${
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
          {product.name}
        </h3>
        <div className="mt-1.5">
          <Stars rating={product.rating} reviews={product.reviews} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{product.short}</p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-faint line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Ajouter ${product.name} au panier`}
            className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-neon text-noir transition hover:scale-105 hover:shadow-glow active:scale-90"
          >
            <IconCart width={18} height={18} />
          </button>
        </div>
        {lowStock && (
          <p className="mt-2 text-[11px] font-medium text-amber-400">
            Plus que {product.stock} en stock
          </p>
        )}
      </div>
    </Link>
  )
}
