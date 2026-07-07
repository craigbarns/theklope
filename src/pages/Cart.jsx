import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { IconMinus, IconPlus, IconTrash, IconLock, IconTruck, IconArrowRight } from '../components/icons.jsx'

export default function Cart() {
  const { cartDetailed, updateQty, removeItem, totals, promo, applyPromo, removePromo, products } = useStore()
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState(null)

  // Cross-sell : consommables/accessoires en stock, absents du panier.
  const suggestions = useMemo(() => {
    const inCart = new Set(cartDetailed.map((i) => i.product.id))
    const complementary = products.filter(
      (p) => !inCart.has(p.id) && p.stock > 0 && ['accessoire', 'eliquide'].includes(p.category),
    )
    return complementary.slice(0, 4)
  }, [products, cartDetailed])

  const submitPromo = (e) => {
    e.preventDefault()
    const res = applyPromo(code)
    setFeedback(res)
    if (res.ok) setCode('')
  }

  if (cartDetailed.length === 0) {
    return (
      <div className="container-page py-8">
        <Seo title="Panier" noindex />
        <Breadcrumbs items={[{ label: 'Panier' }]} />
        <div className="mt-10 card grid place-items-center p-16 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Votre panier est vide</h1>
          <p className="mt-2 text-muted">Parcourez la boutique pour trouver votre prochain produit.</p>
          <Link to="/boutique" className="btn-primary mt-6">Découvrir la boutique</Link>
        </div>
      </div>
    )
  }

  const remainingForFreeShipping = totals.freeShippingThreshold - totals.subtotal

  return (
    <div className="container-page py-8">
      <Seo title="Panier" noindex />
      <Breadcrumbs items={[{ label: 'Panier' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Votre panier</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lignes */}
        <div className="space-y-4">
          {remainingForFreeShipping > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-neon/20 bg-neon/5 px-4 py-3 text-sm text-ash/80">
              <IconTruck width={18} height={18} className="text-neon" />
              Plus que <strong className="text-neon">{formatPrice(remainingForFreeShipping)}</strong> pour la livraison offerte !
            </div>
          )}

          {cartDetailed.map((item) => (
            <div key={item.index} className="card flex gap-4 p-4">
              <Link to={`/produit/${item.product.id}`} className="shrink-0">
                <img src={item.product.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/produit/${item.product.id}`} className="font-medium text-white hover:text-neon">
                      {item.product.name}
                    </Link>
                    <VariantLabel variant={item.variant} />
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
              <Row label="Livraison" value={totals.shipping === 0 ? 'Offerte' : formatPrice(totals.shipping)} />
              <div className="flex items-center justify-between border-t border-white/8 pt-4">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="font-display text-xl font-bold text-white">{formatPrice(totals.total)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Passer commande <IconArrowRight width={18} height={18} />
            </Link>
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
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={accent ? 'text-neon' : 'text-white'}>{value}</dd>
    </div>
  )
}

function VariantLabel({ variant }) {
  const parts = []
  if (variant.color) parts.push(variant.color)
  if (variant.flavor) parts.push(variant.flavor)
  if (variant.nicotine != null) parts.push(`${variant.nicotine} mg`)
  if (!parts.length) return null
  return <p className="mt-1 text-xs text-faint">{parts.join(' · ')}</p>
}
