import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { IconClose, IconMinus, IconPlus, IconTrash, IconLock, IconTruck } from './icons.jsx'

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartDetailed, updateQty, removeItem, totals, cartCount } = useStore()

  const remainingForFreeShipping = totals.freeShippingThreshold - totals.subtotal
  const freeShippingPct = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100))

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
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted">Votre panier est vide.</p>
            <Link to="/boutique" className="btn-primary" onClick={() => setCartOpen(false)}>
              Découvrir la boutique
            </Link>
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
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {cartDetailed.map((item) => (
                <div key={item.index} className="flex gap-3">
                  <img src={item.product.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
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
            </div>

            <footer className="border-t border-white/10 px-5 py-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">Sous-total</span>
                <span className="font-semibold text-white">{formatPrice(totals.subtotal)}</span>
              </div>
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
  if (!parts.length) return null
  return <p className="mt-0.5 text-xs text-faint">{parts.join(' · ')}</p>
}
