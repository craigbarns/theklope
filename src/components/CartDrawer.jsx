import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { featuredProducts } from '../data/catalog.js'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import BundleProgress from './BundleProgress.jsx'
import ProductImage from './ProductImage.jsx'
import { resolveCartRelatedProducts } from '../lib/relatedProducts.js'
import { IconClose, IconMinus, IconPlus, IconTrash, IconLock, IconTruck } from './icons.jsx'

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartDetailed, updateQty, removeItem, totals, cartCount, products, addToCart } = useStore()

  const remainingForFreeShipping = totals.freeShippingThreshold - totals.subtotal
  const freeShippingPct = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100))

  // Produits associés choisis manuellement, en stock et absents du panier.
  const crossSellSuggestions = useMemo(() => {
    return resolveCartRelatedProducts(cartDetailed, products).slice(0, 3)
  }, [products, cartDetailed])

  // Inspiration : meilleures ventes si le panier est vide
  const emptyCartInspirations = useMemo(() => {
    if (products.length === 0) return []
    const { bestSellers } = featuredProducts(products)
    return bestSellers.slice(0, 2)
  }, [products])

  return (
    <>
      <div
        className={`fixed inset-0 z-[95] bg-noir/70 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[96] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-anthracite shadow-card transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Panier"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-white">
            Panier <span className="text-faint">({cartCount})</span>
          </h2>
          <button onClick={() => setCartOpen(false)} aria-label="Fermer" className="text-muted hover:text-white">
            <IconClose />
          </button>
        </header>

        {cartDetailed.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between p-6">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-muted text-sm">Votre panier est vide.</p>
              <Link to="/boutique" className="btn-primary mt-4 text-xs py-2.5 px-6" onClick={() => setCartOpen(false)}>
                Découvrir la boutique
              </Link>
            </div>
            {emptyCartInspirations.length > 0 && (
              <div className="border-t border-white/8 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">Les préférés de la communauté</p>
                <div className="grid grid-cols-2 gap-3">
                  {emptyCartInspirations.map((p) => (
                    <div key={p.id} className="card p-3 flex flex-col justify-between hover:border-neon/30 transition">
                      <ProductImage src={p.image} alt="" className="aspect-square rounded-xl object-cover bg-carbon p-1" width={150} height={150} />
                      <h3 className="mt-2 truncate text-xs font-semibold text-white">{p.name}</h3>
                      <p className="text-[10px] text-faint mt-0.5">{formatPrice(p.price)}</p>
                      <button
                        onClick={() => addToCart(p.id, 1)}
                        className="btn-ghost mt-3 text-[10px] py-1 px-3 min-h-0 w-full"
                      >
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 px-5 py-3">
              {remainingForFreeShipping > 0 ? (
                <p className="flex items-center gap-2 text-xs text-ash/80">
                  <IconTruck width={16} height={16} className="text-neon shrink-0" />
                  Plus que <strong className="text-neon">{formatPrice(remainingForFreeShipping)}</strong> pour la livraison offerte
                </p>
              ) : (
                <p className="flex items-center gap-2 text-xs text-neon">
                  <IconTruck width={16} height={16} className="shrink-0" /> Livraison offerte débloquée&nbsp;!
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-neon transition-all duration-500" style={{ width: `${freeShippingPct}%` }} />
              </div>
              {totals.bundleProgress?.length > 0 && (
                <div className="mt-3">
                  <BundleProgress hints={totals.bundleProgress} compact />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {cartDetailed.map((item) => (
                <div key={item.index} className="flex gap-3">
                  <ProductImage src={item.product.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" width={80} height={80} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/produit/${item.product.id}`}
                        onClick={() => setCartOpen(false)}
                        className="line-clamp-1 text-sm font-medium text-white hover:text-neon"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.index)}
                        aria-label="Retirer"
                        className="text-faint hover:text-rose-400"
                      >
                        <IconTrash width={17} height={17} />
                      </button>
                    </div>
                    <VariantLabel variant={item.variant} />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-white/10">
                        <button
                          onClick={() => updateQty(item.index, item.qty - 1)}
                          className="grid h-7 w-7 place-items-center text-ash/70 hover:text-white"
                          aria-label="Diminuer"
                        >
                          <IconMinus width={14} height={14} />
                        </button>
                        <span className="w-7 text-center text-sm text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.index, item.qty + 1)}
                          className="grid h-7 w-7 place-items-center text-ash/70 hover:text-white"
                          aria-label="Augmenter"
                        >
                          <IconPlus width={14} height={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-white">{formatPrice(item.lineTotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {crossSellSuggestions.length > 0 && (
                <div className="mt-8 border-t border-white/8 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">Complétez votre commande</p>
                  <div className="space-y-3">
                    {crossSellSuggestions.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.01] p-3 hover:border-neon/30 transition">
                        <ProductImage src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover bg-carbon p-1 shrink-0" width={48} height={48} />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/produit/${p.id}`}
                            onClick={() => setCartOpen(false)}
                            className="block truncate text-xs font-bold text-white hover:text-neon"
                          >
                            {p.name}
                          </Link>
                          <p className="text-[10px] text-faint mt-0.5">{p.brand} · {formatPrice(p.price)}</p>
                        </div>
                        <button
                          onClick={() => addToCart(p.id, 1)}
                          className="rounded-full bg-neon/10 border border-neon/30 hover:bg-neon hover:text-noir px-3 py-1.5 text-xs text-neon font-bold transition shrink-0"
                        >
                          Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-white/10 px-5 py-5">
              <dl className="mb-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Sous-total</dt>
                  <dd className="font-semibold text-white">{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-neon">
                      <dt>Remise</dt>
                      <dd className="font-semibold">- {formatPrice(totals.discount)}</dd>
                    </div>
                    {totals.discountSource === 'auto' && totals.autoDiscount?.details?.map((d) => (
                      <p key={d.key} className="-mt-1 text-[11px] text-neon/80">✓ {d.label}</p>
                    ))}
                  </>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Livraison</dt>
                  <dd className="font-semibold text-white">{totals.shipping === 0 ? 'Offerte' : formatPrice(totals.shipping)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-2">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="font-display text-lg font-bold text-white">{formatPrice(totals.total)}</dd>
                </div>
              </dl>
              <Link to="/panier" className="btn-ghost mb-2 w-full" onClick={() => setCartOpen(false)}>
                Voir le panier
              </Link>
              <Link to="/checkout" className="btn-primary w-full" onClick={() => setCartOpen(false)}>
                Passer commande
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-faint">
                <IconLock width={13} height={13} /> Paiement 100% sécurisé
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}

function VariantLabel({ variant }) {
  const parts = []
  if (variant.color) parts.push(variant.color)
  if (variant.flavor) parts.push(variant.flavor)
  if (variant.nicotine != null) parts.push(`${variant.nicotine} mg`)
  if (variant.ohm != null) parts.push(`${variant.ohm} Ω`)
  if (!parts.length) return null
  return <p className="mt-0.5 text-xs text-faint">{parts.join(' · ')}</p>
}
