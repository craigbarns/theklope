import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { featuredProducts } from '../data/catalog.js'
import ProductImage from '../components/ProductImage.jsx'
import BundleProgress from '../components/BundleProgress.jsx'
import { resolveCartRelatedProducts } from '../lib/relatedProducts.js'
import {
  getProductVariantChoices,
  isCartCatalogResolved,
  isCartCatalogVerified,
  resolveProductVariant,
} from '../lib/cart.js'
import { IconMinus, IconPlus, IconTrash, IconLock, IconTruck, IconArrowRight } from '../components/icons.jsx'

export default function Cart() {
  const {
    cart,
    cartDetailed,
    updateQty,
    updateCartVariant,
    removeItem,
    totals,
    promo,
    applyPromo,
    removePromo,
    products,
    catalogReady,
    syncStatus,
    refreshRemoteData,
  } = useStore()
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState(null)

  // Produits associés choisis manuellement, en stock et absents du panier.
  const suggestions = useMemo(() => {
    return resolveCartRelatedProducts(cartDetailed, products).slice(0, 4)
  }, [products, cartDetailed])

  const submitPromo = (e) => {
    e.preventDefault()
    const res = applyPromo(code)
    setFeedback(res)
    if (res.ok) setCode('')
  }

  const cartState = { cart, cartDetailed, catalogReady }
  const cartCatalogResolved = isCartCatalogResolved(cartState)
  const cartNeedsVerification = !cartCatalogResolved
  const cartHasVariantIssue = cartCatalogResolved && !isCartCatalogVerified(cartState)

  if (cartNeedsVerification) {
    return (
      <div className="container-page py-8">
        <Seo title="Panier" noindex />
        <Breadcrumbs items={[{ label: 'Panier' }]} />
        <div className="mt-10 card grid min-h-56 place-items-center p-8 text-center" role="status" aria-live="polite">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Vérification de votre panier</h1>
            <p className="mt-2 text-sm text-muted">
              {syncStatus === 'error'
                ? 'Le catalogue live est temporairement indisponible. Aucun prix ni produit ne sera omis de votre commande.'
                : 'Nous vérifions les prix, les variantes et le stock live avant de poursuivre.'}
            </p>
            {syncStatus === 'error' && (
              <button type="button" onClick={refreshRemoteData} className="btn-ghost mt-5">Réessayer</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (cartDetailed.length === 0) {
    const { bestSellers } = featuredProducts(products)
    const inspirations = bestSellers.slice(0, 4)

    return (
      <div className="container-page py-8">
        <Seo title="Panier" noindex />
        <Breadcrumbs items={[{ label: 'Panier' }]} />
        <div className="mt-10 card grid place-items-center p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Votre panier est vide</h1>
          <p className="mt-2 text-muted text-sm">Parcourez la boutique pour trouver votre prochain produit.</p>
          <Link to="/boutique" className="btn-primary mt-6 text-xs px-6 py-2.5">Découvrir la boutique</Link>
        </div>

        {inspirations.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-display text-xl font-bold text-white text-center sm:text-left">Les coups de cœur de la communauté</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {inspirations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const remainingForFreeShipping = totals.freeShippingThreshold - totals.subtotal
  const itemsTotal = Math.max(0, totals.subtotal - totals.discount)

  return (
    <div className="container-page py-8">
      <Seo title="Panier" noindex />
      <Breadcrumbs items={[{ label: 'Panier' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Votre panier</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lignes */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neon/20 bg-neon/5 px-4 py-3 text-sm text-ash/80">
            <p className="flex items-center gap-3">
              <IconTruck width={18} height={18} className="text-neon" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Plus que <strong className="text-neon">{formatPrice(remainingForFreeShipping)}</strong> pour la livraison standard offerte.
                </span>
              ) : (
                <strong className="text-neon">Livraison standard offerte débloquée.</strong>
              )}
            </p>
            <p className="mt-1 pl-[30px] text-xs text-muted">Retrait gratuit en boutique à Marseille, disponible à l’étape suivante.</p>
          </div>

          <BundleProgress hints={totals.bundleProgress} />

          {cartHasVariantIssue && (
            <p role="alert" className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Une option de votre panier n'est plus disponible. Choisissez une option proposée ci-dessous avant de passer commande.
            </p>
          )}

          {cartDetailed.map((item) => (
            <div key={item.index} className="card flex gap-4 p-4">
              <Link to={`/produit/${item.product.id}`} className="shrink-0">
                <ProductImage src={item.product.image} alt="" loading="lazy" className="h-24 w-24 rounded-xl object-cover" width={96} height={96} />
              </Link>
              <div className="min-w-0 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/produit/${item.product.id}`} className="font-medium text-white hover:text-neon">
                      {item.product.name}
                    </Link>
                    <VariantEditor
                      product={item.product}
                      variant={item.variant}
                      onChange={(variant) => updateCartVariant(item.index, variant)}
                    />
                  </div>
                  <button onClick={() => removeItem(item.index)} aria-label="Retirer" className="text-faint hover:text-rose-400">
                    <IconTrash width={18} height={18} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-white/12">
                    <button onClick={() => updateQty(item.index, item.qty - 1)} className="grid h-9 w-9 place-items-center text-ash/70 hover:text-white" aria-label="Diminuer">
                      <IconMinus width={15} height={15} />
                    </button>
                    <span className="w-9 text-center text-sm text-white">{item.qty}</span>
                    <button onClick={() => updateQty(item.index, item.qty + 1)} className="grid h-9 w-9 place-items-center text-ash/70 hover:text-white" aria-label="Augmenter">
                      <IconPlus width={15} height={15} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatPrice(item.lineTotal)}</p>
                    <p className="text-xs text-faint">{formatPrice(item.product.price)} / unité</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {suggestions.length > 0 && (
            <div className="pt-6">
              <h2 className="mb-4 font-display text-lg font-bold text-white">Complétez votre commande</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {suggestions.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Récap */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-white">Récapitulatif</h2>

            <form onSubmit={submitPromo} className="mt-4">
              {promo ? (
                <div className="flex items-center justify-between rounded-xl border border-neon/30 bg-neon/10 px-4 py-3 text-sm">
                  <span className="text-neon">Code « {promo.code} » · {promo.label}</span>
                  <button type="button" onClick={() => { removePromo(); setFeedback(null) }} className="text-muted hover:text-white">Retirer</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code promo" className="input" />
                  <button type="submit" className="btn-ghost shrink-0 px-5">OK</button>
                </div>
              )}
              {feedback && !promo && (
                <p className={`mt-2 text-xs ${feedback.ok ? 'text-neon' : 'text-rose-400'}`}>{feedback.message}</p>
              )}
            </form>

            <dl className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm">
              <Row label="Sous-total" value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && <Row label="Remise" value={`- ${formatPrice(totals.discount)}`} accent />}
              {totals.discountSource === 'auto' && totals.autoDiscount?.details?.map((d) => (
                <div key={d.key} className="-mt-1 text-[11px] text-neon/80">
                  <dt className="sr-only">Remise automatique</dt>
                  <dd>✓ {d.label}</dd>
                </div>
              ))}
              <Row label="Livraison" value="Calculée à l’étape suivante" />
              <div className="flex items-center justify-between border-t border-white/8 pt-4">
                <dt className="font-semibold text-white">Total avant livraison</dt>
                <dd className="font-display text-xl font-bold text-white">{formatPrice(itemsTotal)}</dd>
              </div>
            </dl>

            <p className="mt-3 text-xs leading-relaxed text-faint">
              Retrait boutique gratuit disponible. Le tarif exact dépendra du mode de livraison choisi.
            </p>

            {cartHasVariantIssue ? (
              <button type="button" disabled className="btn-primary mt-6 w-full cursor-not-allowed opacity-50">
                Choisissez les options requises
              </button>
            ) : (
              <Link to="/checkout" className="btn-primary mt-6 w-full">
                Passer commande <IconArrowRight width={18} height={18} />
              </Link>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-faint">
              <IconLock width={13} height={13} /> Paiement sécurisé · Données chiffrées
            </p>
          </div>
          <Link to="/boutique" className="mt-4 block text-center text-sm text-neon hover:underline">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${accent ? 'text-neon' : 'text-white'}`}>{value}</dd>
    </div>
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
    <div className="mt-2" aria-label={`Options de ${product.name}`}>
      <div className="flex flex-wrap gap-2">
      {choices.map(({ key, label, options, suffix = '' }) => {
        const selected = options.find((option) => String(option) === String(variant[key]))
        if (options.length === 1) {
          return (
            <span key={key} className="text-xs text-faint">
              {label} : {options[0]}{suffix}
            </span>
          )
        }

        return (
          <label key={key} className="flex items-center gap-1 text-xs text-faint">
            <span>{label} :</span>
            <select
              value={selected === undefined ? '' : String(selected)}
              onChange={(event) => {
                const value = options.find((option) => String(option) === event.target.value)
                if (value !== undefined) onChange({ ...editableVariant, [key]: value })
              }}
              aria-label={`${label} pour ${product.name}`}
              aria-invalid={selected === undefined ? 'true' : undefined}
              className="rounded-lg border border-white/12 bg-carbon px-2 py-1 text-xs text-white outline-none focus:border-neon"
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
        <p role="alert" className="mt-1 text-xs text-amber-200">{resolution.error}</p>
      )}
    </div>
  )
}
