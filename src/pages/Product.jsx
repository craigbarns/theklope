import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { categoryName } from '../data/catalog.js'
import { STORE_REVIEW_SUMMARY, STORE_REVIEW_SNIPPETS } from '../data/reviews.js'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Badge from '../components/Badge.jsx'
import Stars from '../components/Stars.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import NotFound from './NotFound.jsx'
import {
  IconHeart,
  IconCart,
  IconMinus,
  IconPlus,
  IconTruck,
  IconLock,
  IconShield,
  IconCheck,
} from '../components/icons.jsx'

export default function Product() {
  const { id } = useParams()
  const { products, getProduct, addToCart, toggleFavorite, isFavorite } = useStore()
  const product = getProduct(id)

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(product?.colors?.[0] || null)
  const [flavor, setFlavor] = useState(product?.flavors?.[0] || null)
  const [nicotine, setNicotine] = useState(product?.nicotine?.[0] ?? null)
  const [added, setAdded] = useState(false)

  const similar = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  }, [product, products])

  const productSchema = useMemo(() => {
    if (!product) return null
    // priceValidUntil : Google recommande une date de validité du prix (≈ fin de l'année suivante).
    const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": [
        product.image.startsWith('http') ? product.image : `https://theklope.com${product.image}`
      ],
      "description": product.long || product.short,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "url": `https://theklope.com/produit/${product.id}`,
        "priceCurrency": "EUR",
        "price": (Number(product.price) || 0).toFixed(2),
        "priceValidUntil": priceValidUntil,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "THEKLOPE"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "FR"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 2,
              "maxValue": 4,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "FR",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
        }
      }
    }
    // On n'expose des données d'avis structurées QUE si des avis réels existent.
    if (product.reviews > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": (Number(product.rating) || 0).toFixed(1),
        "reviewCount": product.reviews,
      }
    }
    return schema
  }, [product])

  useEffect(() => {
    if (!product) return
    setActiveImg(0)
    setQty(1)
    setColor(product.colors?.[0] || null)
    setFlavor(product.flavors?.[0] || null)
    setNicotine(product.nicotine?.[0] ?? null)
  }, [product])

  const [selectedBundleIds, setSelectedBundleIds] = useState([])

  // Compte à rebours d'expédition (limite 14h00)
  const shippingCountdown = useMemo(() => {
    const now = new Date()
    const hours = now.getHours()
    const day = now.getDay()
    const isWeekend = day === 0 || day === 6

    if (hours < 14 && !isWeekend) {
      const remainingHours = 14 - hours - 1
      const remainingMinutes = 60 - now.getMinutes()
      return `Expédition aujourd'hui ! Commandez dans les ${remainingHours}h ${remainingMinutes}min.`
    }
    return `Commandez maintenant pour une expédition dès demain (ou lundi) !`
  }, [])

  // Lot d'achat groupé compatible (Frequently Bought Together)
  const bundleItems = useMemo(() => {
    if (!product || !['ecig', 'pod'].includes(product.category)) return []

    // Trouver un accessoire compatible (résistance de la marque ou accessoire générique)
    const brandAccessory = products.find(
      (p) => p.category === 'accessoire' && p.stock > 0 && p.brand.toLowerCase() === product.brand.toLowerCase()
    )
    const fallbackAccessory = products.find((p) => p.category === 'accessoire' && p.stock > 0 && p.id !== product.id)
    const accessory = brandAccessory || fallbackAccessory

    // Trouver un e-liquide
    const eliquid = products.find((p) => p.category === 'eliquide' && p.stock > 0)

    return [accessory, eliquid].filter(Boolean)
  }, [product, products])

  // Initialiser les éléments cochés du lot
  useEffect(() => {
    if (bundleItems.length) {
      setSelectedBundleIds(bundleItems.map((item) => item.id))
    } else {
      setSelectedBundleIds([])
    }
  }, [bundleItems])

  const bundleTotalPrice = useMemo(() => {
    if (!product) return 0
    let total = product.price
    selectedBundleIds.forEach((id) => {
      const p = products.find((item) => item.id === id)
      if (p) total += p.price
    })
    return total
  }, [product, selectedBundleIds, products])

  if (!product) return <NotFound />

  const fav = isFavorite(product.id)
  const outOfStock = product.stock <= 0
  const maxQty = product.stock > 0 ? product.stock : 1
  const hasNicotine = Array.isArray(product.nicotine) && product.nicotine.some((n) => Number(n) > 0)

  const handleAdd = () => {
    if (outOfStock) return
    const variant = {}
    if (color) variant.color = color
    if (flavor) variant.flavor = flavor
    if (nicotine != null) variant.nicotine = nicotine
    addToCart(product.id, Math.min(qty, maxQty), variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleAddBundle = () => {
    if (outOfStock) return
    handleAdd()
    selectedBundleIds.forEach((id) => {
      const item = products.find((p) => p.id === id)
      if (item) {
        const variant = {}
        if (item.colors?.length) variant.color = item.colors[0]
        if (item.flavors?.length) variant.flavor = item.flavors[0]
        if (item.nicotine?.length) variant.nicotine = item.nicotine[0]
        addToCart(item.id, 1, variant)
      }
    })
  }

  return (
    <>
      <Seo
        title={`${product.name} — ${categoryName(product.category)} | THEKLOPE`}
        description={product.short}
        schema={productSchema}
      />
      <div className="container-page py-8 pb-28 lg:pb-8">
        <Breadcrumbs
          items={[
            { label: 'Boutique', to: '/boutique' },
            { label: categoryName(product.category) },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Galerie */}
          <div>
            <div className="card relative overflow-hidden rounded-3xl p-2">
              <div className="absolute left-4 top-4 z-10 flex gap-2">
                {product.badge && <Badge type={product.badge} />}
                {product.oldPrice && !product.badge && <Badge type="promo" />}
              </div>
              <ProductImage
                src={product.images?.[activeImg] || product.image || '/products/product-placeholder.svg'}
                alt={product.name}
                fetchpriority="high"
                decoding="async"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="mt-3 flex gap-3">
              {(product.images || []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-xl border-2 transition ${
                    activeImg === i ? 'border-neon' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <ProductImage src={img} alt="" loading="lazy" className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Infos */}
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">{product.brand} · {product.type}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{product.name}</h1>
            <div className="mt-3"><Stars rating={product.rating} reviews={product.reviews} size={16} /></div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-white">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-lg text-faint line-through">{formatPrice(product.oldPrice)}</span>
              )}
              {product.oldPrice && (
                <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              )}
            </div>

            <p className="mt-5 text-ash/70">{product.short}</p>

            {/* Variantes */}
            <div className="mt-7 space-y-5">
              {product.colors?.length > 0 && (
                <VariantPicker label="Couleur" options={product.colors} value={color} onChange={setColor} />
              )}
              {product.flavors?.length > 0 && (
                <VariantPicker label="Saveur" options={product.flavors} value={flavor} onChange={setFlavor} />
              )}
              {product.nicotine?.length > 0 && (
                <VariantPicker
                  label="Taux de nicotine"
                  options={product.nicotine}
                  value={nicotine}
                  onChange={setNicotine}
                  render={(n) => `${n} mg`}
                />
              )}
            </div>

            {/* Quantité + CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-white/15">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-ash/70 hover:text-white" aria-label="Diminuer">
                  <IconMinus width={16} height={16} />
                </button>
                <span className="w-10 text-center font-semibold text-white">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="grid h-11 w-11 place-items-center text-ash/70 hover:text-white disabled:opacity-30" aria-label="Augmenter">
                  <IconPlus width={16} height={16} />
                </button>
              </div>
              <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-10">
                {outOfStock ? 'Rupture de stock' : added ? <><IconCheck width={18} height={18} /> Ajouté !</> : <><IconCart width={18} height={18} /> Ajouter au panier</>}
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label="Favori"
                className={`grid h-12 w-12 place-items-center rounded-full border transition ${
                  fav ? 'border-neon/40 bg-neon/15 text-neon' : 'border-white/15 text-ash/70 hover:text-white'
                }`}
              >
                <IconHeart filled={fav} />
              </button>
            </div>

            <p className={`mt-3 text-sm ${outOfStock ? 'text-rose-400' : 'text-muted'}`}>
              {outOfStock
                ? 'Rupture de stock — bientôt de retour'
                : product.stock > 10
                  ? 'En stock — expédié sous 24/48h'
                  : `Plus que ${product.stock} en stock — commandez vite`}
            </p>

            {!outOfStock && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-neon/10 border border-neon/30 px-3.5 py-2.5 text-xs text-neon font-medium max-w-sm">
                <IconTruck width={16} height={16} className="shrink-0" />
                <span>{shippingCountdown}</span>
              </div>
            )}

            {/* Réassurance */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Reassure icon={IconLock} text="Paiement 100% sécurisé" />
              <Reassure icon={IconTruck} text="Livraison 24/48h en France" />
              <Reassure icon={IconShield} text="Retours sous 14 jours" />
              <Reassure icon={IconShield} text="Vente réservée aux +18" />
            </div>

            {bundleItems.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="font-display text-base font-bold text-white mb-4">Acheter les indispensables compatibles</h3>
                <div className="space-y-3">
                  {/* Article principal (toujours présent et coché) */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-neon bg-neon text-noir">
                      <IconCheck width={12} height={12} />
                    </div>
                    <span className="text-xs text-ash/80">
                      <strong>Cet article :</strong> {product.name} ({formatPrice(product.price)})
                    </span>
                  </div>

                  {/* Articles du bundle */}
                  {bundleItems.map((item) => {
                    const isChecked = selectedBundleIds.includes(item.id)
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBundleIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            )
                          }
                          className={`grid h-5 w-5 place-items-center rounded border transition ${
                            isChecked ? 'border-neon bg-neon text-noir' : 'border-white/25 hover:border-white/40'
                          }`}
                        >
                          {isChecked && <IconCheck width={12} height={12} />}
                        </button>
                        <span className="text-xs text-ash/80">
                          <strong>{item.category === 'accessoire' ? 'Consommable' : 'E-liquide'} conseillé :</strong>{' '}
                          <Link to={`/produit/${item.id}`} className="hover:text-neon text-white font-medium">
                            {item.name}
                          </Link>{' '}
                          ({formatPrice(item.price)})
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl bg-white/[0.02] border border-white/8 p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-muted">Prix total du lot :</p>
                      <p className="font-display text-lg font-bold text-white mt-0.5">{formatPrice(bundleTotalPrice)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBundle}
                      className="btn-ghost text-xs px-5 py-2 min-h-0 text-neon hover:bg-neon hover:text-noir"
                    >
                      Ajouter le lot au panier
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-neon/80">
                    💡 Astuce : Utilisez le code <strong className="font-bold underline">PACK15</strong> au panier pour obtenir -15% sur ce lot !
                  </p>
                </div>
              </div>
            )}

            {hasNicotine && (
              <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-xs leading-relaxed text-ash/70">
                <strong className="text-ash/80">Avertissement —</strong> Produit contenant de la nicotine, substance
                qui crée une forte dépendance. Vente interdite aux mineurs (−18&nbsp;ans) et déconseillée aux non-fumeurs.
              </p>
            )}
          </div>
        </div>

        {/* Description détaillée + specs */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Description</h2>
            <p className="mt-4 leading-relaxed text-ash/70">{product.long}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold text-white">Caractéristiques techniques</h3>
            <dl className="mt-4 divide-y divide-white/8">
              {product.volume && (
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted">Volume</dt>
                  <dd className="text-right font-medium text-white">{product.volume}</dd>
                </div>
              )}
              {product.ohm && (
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted">Résistance</dt>
                  <dd className="text-right font-medium text-white">{product.ohm}</dd>
                </div>
              )}
              {Object.entries(product.specs || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Avis */}
        <div className="mt-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <h2 className="font-display text-2xl font-bold text-white">Avis clients Google</h2>
            <Stars rating={STORE_REVIEW_SUMMARY.rating} reviews={STORE_REVIEW_SUMMARY.count} size={16} />
            <p className="text-sm text-muted">Avis boutique THEKLOPE réels, collectés sur Google.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STORE_REVIEW_SNIPPETS.map((r) => (
              <div key={r.name} className="card p-5">
                <Stars rating={r.rating} showCount={false} />
                <p className="mt-3 text-sm leading-relaxed text-ash/70">“{r.text}”</p>
                <p className="mt-4 text-xs text-faint">{r.name} · {r.date} · {r.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similaires */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold text-white">Produits similaires</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barre d'achat persistante (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--line)] bg-noir/90 backdrop-blur-xl lg:hidden">
        <div className="container-page flex items-center gap-3 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{product.name}</p>
            <p className="font-display text-base font-bold text-neon">{formatPrice(product.price)}</p>
          </div>
          <button onClick={handleAdd} disabled={outOfStock} className="btn-primary shrink-0 px-6 disabled:cursor-not-allowed disabled:opacity-50">
            {outOfStock ? 'Rupture' : added ? <><IconCheck width={18} height={18} /> Ajouté</> : <><IconCart width={18} height={18} /> Ajouter</>}
          </button>
        </div>
      </div>
    </>
  )
}

function VariantPicker({ label, options, value, onChange, render = (x) => x }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white">
        {label} <span className="text-faint">· {render(value)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              value === opt
                ? 'border-neon bg-neon/15 text-neon'
                : 'border-white/12 text-ash/75 hover:border-white/30'
            }`}
          >
            {render(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Reassure({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-xs text-ash/70">
      <Icon width={18} height={18} className="shrink-0 text-neon" />
      {text}
    </div>
  )
}
