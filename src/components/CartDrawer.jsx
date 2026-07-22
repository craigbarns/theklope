import { Link } from 'react-router-dom'
import { useCallback, useMemo, useRef } from 'react'
import { featuredProducts } from '../data/catalog.js'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import BundleProgress from './BundleProgress.jsx'
import ProductImage from './ProductImage.jsx'
import { resolveCartRelatedProducts } from '../lib/relatedProducts.js'
import {
  getProductVariantChoices,
  isCartCatalogResolved,
  isCartCatalogVerified,
  productRequiresVariantSelection,
  resolveProductVariant,
} from '../lib/cart.js'
import { useDialogFocus } from '../lib/useDialogFocus.js'
import { IconClose, IconMinus, IconPlus, IconTrash, IconLock, IconTruck } from './icons.jsx'

export default function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cartDetailed,
    cart,
    updateQty,
    updateCartVariant,
    removeItem,
    totals,
    cartCount,
    products,
    addToCart,
    catalogReady,
    syncStatus,
    refreshRemoteData,
  } = useStore()
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const close = useCallback(() => setCartOpen(false), [setCartOpen])

  useDialogFocus({
    open: cartOpen,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose: close,
  })

  const remainingForFreeShipping = totals.freeShippingThreshold - totals.subtotal
  const freeShippingPct = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100))
  const itemsTotal = Math.max(0, totals.subtotal - totals.discount)
  const cartState = { cart, cartDetailed, catalogReady }
  const cartCatalogResolved = isCartCatalogResolved(cartState)
  const cartNeedsVerification = !cartCatalogResolved
  const cartHasVariantIssue = cartCatalogResolved && !isCartCatalogVerified(cartState)

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
        onClick={close}
        aria-hidden="true"
      />
      <aside
        ref={dialogRef}
        className={`fixed right-0 top-0 z-[96] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-anthracite shadow-card transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal={cartOpen ? 'true' : undefined}
        aria-labelledby="cart-drawer-title"
        aria-hidden={cartOpen ? undefined : 'true'}
        inert={cartOpen ? undefined : ''}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-lg font-bold text-white">
            Panier <span className="text-faint">({cartCount})</span>
          </h2>
          <button ref={closeButtonRef} type="button" onClick={close} aria-label="Fermer le panier" className="text-muted hover:text-white">
            <IconClose />
          </button>
        </header>

        {cartNeedsVerification ? (
          <div className="grid flex-1 place-items-center p-6 text-center" role="status" aria-live="polite">
            <div>
              <p className="font-display text-lg font-bold text-white">Vérification du panier</p>
              <p className="mt-2 text-sm text-muted">
                {syncStatus === 'error'
                  ? 'Le catalogue live est indisponible. Le paiement reste bloqué pour protéger vos prix et vos articles.'
                  : 'Synchronisation des prix, variantes et stocks en cours…'}
              </p>
              {syncStatus === 'error' && (
                <button type="button" onClick={refreshRemoteData} className="btn-ghost mt-5">Réessayer</button>
              )}
            </div>
          </div>
        ) : cartDetailed.length === 0 ? (
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
                      {productRequiresVariantSelection(p) ? (
                        <Link
                          to={`/produit/${p.id}`}
                          onClick={() => setCartOpen(false)}
                          className="btn-ghost mt-3 w-full min-h-0 px-3 py-1 text-[10px]"
                        >
                          Choisir les options
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(p.id, 1)}
                          className="btn-ghost mt-3 w-full min-h-0 px-3 py-1 text-[10px]"
                        >
                          Ajouter
                        </button>
                      )}
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
              <p className="mt-2 text-[11px] text-faint">Retrait gratuit en boutique à Marseille, au choix lors du paiement.</p>
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
                    <VariantEditor
                      product={item.product}
                      variant={item.variant}
                      onChange={(variant) => updateCartVariant(item.index, variant)}
                    />
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
                        {productRequiresVariantSelection(p) ? (
                          <Link
                            to={`/produit/${p.id}`}
                            onClick={() => setCartOpen(false)}
                            className="shrink-0 rounded-full border border-neon/30 bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon transition hover:bg-neon hover:text-noir"
                          >
                            Choisir
                          </Link>
                        ) : (
                          <button
                            onClick={() => addToCart(p.id, 1)}
                            className="shrink-0 rounded-full border border-neon/30 bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon transition hover:bg-neon hover:text-noir"
                          >
                            Ajouter
                          </button>
                        )}
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
                      <div key={d.key} className="-mt-1 text-[11px] text-neon/80">
                        <dt className="sr-only">Remise automatique</dt>
                        <dd>✓ {d.label}</dd>
                      </div>
                    ))}
                  </>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Livraison</dt>
                  <dd className="text-right text-xs font-semibold text-white">Calculée ensuite</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-2">
                  <dt className="font-semibold text-white">Avant livraison</dt>
                  <dd className="font-display text-lg font-bold text-white">{formatPrice(itemsTotal)}</dd>
                </div>
              </dl>
              <p className="mb-3 text-center text-[11px] text-faint">Retrait boutique gratuit disponible.</p>
              <Link to="/panier" className="btn-ghost mb-2 w-full" onClick={() => setCartOpen(false)}>
                Voir le panier
              </Link>
              {cartHasVariantIssue ? (
                <Link to="/panier" className="btn-primary w-full" onClick={() => setCartOpen(false)}>
                  Choisir les options requises
                </Link>
              ) : (
                <Link to="/checkout" className="btn-primary w-full" onClick={() => setCartOpen(false)}>
                  Passer commande
                </Link>
              )}
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

function VariantEditor({ product, variant = {}, onChange }) {
  const choices = getProductVariantChoices(product)
  if (!choices.length) return null
  const resolution = resolveProductVariant(product, variant)
  const editableVariant = Object.fromEntries(choices.flatMap(({ key, options }) => {
    const selected = options.find((option) => String(option) === String(variant[key]))
    return selected === undefined ? [] : [[key, selected]]
  }))

  return (
    <div className="mt-1.5" aria-label={`Options de ${product.name}`}>
      <div className="flex flex-wrap gap-x-2 gap-y-1">
      {choices.map(({ key, label, options, suffix = '' }) => {
        const selected = options.find((option) => String(option) === String(variant[key]))
        if (options.length === 1) {
          return <span key={key} className="text-[11px] text-faint">{label} : {options[0]}{suffix}</span>
        }

        return (
          <label key={key} className="flex items-center gap-1 text-[11px] text-faint">
            <span>{label} :</span>
            <select
              value={selected === undefined ? '' : String(selected)}
              onChange={(event) => {
                const value = options.find((option) => String(option) === event.target.value)
                if (value !== undefined) onChange({ ...editableVariant, [key]: value })
              }}
              aria-label={`${label} pour ${product.name}`}
              aria-invalid={selected === undefined ? 'true' : undefined}
              className="max-w-28 rounded-md border border-white/12 bg-carbon px-1.5 py-0.5 text-[11px] text-white outline-none focus:border-neon"
            >
              {selected === undefined && <option value="">Choisir</option>}
              {options.map((option) => (
                <option key={String(option)} value={String(option)}>{option}{suffix}</option>
              ))}
            </select>
          </label>
        )
      })}
      </div>
      {!resolution.ok && (
        <p role="alert" className="mt-1 text-[11px] text-amber-200">{resolution.error}</p>
      )}
    </div>
  )
}
