import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { categoryName, getProductCategoryKey } from '../data/catalog.js'
import { STORE_REVIEW_SUMMARY } from '../data/reviews.js'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Badge from '../components/Badge.jsx'
import Stars from '../components/Stars.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import NotFound from './NotFound.jsx'
import { toAnalyticsItem, trackEvent } from '../lib/analytics.js'
import { getProductPageState, PRODUCT_PAGE_STATE } from '../lib/pageReadiness.js'
import { getPrerenderSnapshot } from '../lib/prerenderSnapshot.js'
import { resolveRelatedProducts } from '../lib/relatedProducts.js'
import { relatedGuidesForProduct } from '../data/productGuides.js'
import { BLOG_POSTS } from '../data/blog.js'
import { getProductVariantOptions, resolveProductVariant } from '../lib/cart.js'
import {
  IconHeart,
  IconCart,
  IconMinus,
  IconPlus,
  IconTruck,
  IconLock,
  IconShield,
  IconCheck,
  IconArrowRight,
} from '../components/icons.jsx'

export default function Product() {
  const { id } = useParams()
  const {
    products,
    cart,
    getProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    cookiesChoice,
    catalogReady,
    syncStatus,
  } = useStore()
  const product = getProduct(id)

  const onlyChoice = (options) => (Array.isArray(options) && options.length === 1 ? options[0] : null)
  const colorOptions = getProductVariantOptions(product, 'color')
  const flavorOptions = getProductVariantOptions(product, 'flavor')
  const nicotineOptions = getProductVariantOptions(product, 'nicotine')
  const ohmOptions = getProductVariantOptions(product, 'ohm')

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(onlyChoice(colorOptions))
  const [flavor, setFlavor] = useState(onlyChoice(flavorOptions))
  const [nicotine, setNicotine] = useState(onlyChoice(nicotineOptions))
  const [ohm, setOhm] = useState(onlyChoice(ohmOptions))
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState('')
  const trackedProductRef = useRef(null)
  const variantsRef = useRef(null)

  const relatedProducts = useMemo(() => resolveRelatedProducts(product, products), [product, products])
  const relatedGuides = useMemo(
    () => (product ? relatedGuidesForProduct(getProductCategoryKey(product), BLOG_POSTS) : []),
    [product],
  )

  const productSchema = useMemo(() => {
    if (!product) return null
    // priceValidUntil : Google recommande une date de validité du prix (≈ fin de l'année suivante).
    const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`
    // priceValidFrom : début de validité du prix (date de mise en ligne du produit si connue).
    const priceValidFrom = (product.created_at ? new Date(product.created_at) : new Date())
      .toISOString().split('T')[0]
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": [
        product.image.startsWith('http') ? product.image : `https://www.theklope.com${product.image}`
      ],
      "description": product.long || product.short,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.theklope.com/produit/${product.id}`,
        "priceCurrency": "EUR",
        "price": (Number(product.price) || 0).toFixed(2),
        "validFrom": priceValidFrom,
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
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "7.50",
            "currency": "EUR"
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
    return schema
  }, [product])

  useEffect(() => {
    if (!product) return
    setActiveImg(0)
    setQty(1)
    setColor(onlyChoice(getProductVariantOptions(product, 'color')))
    setFlavor(onlyChoice(getProductVariantOptions(product, 'flavor')))
    setNicotine(onlyChoice(getProductVariantOptions(product, 'nicotine')))
    setOhm(onlyChoice(getProductVariantOptions(product, 'ohm')))
    setAddError('')
  }, [product])

  useEffect(() => {
    if (!product || trackedProductRef.current === product.id) return
    if (trackEvent('view_item', {
      currency: 'EUR',
      value: product.price,
      items: [toAnalyticsItem(product)],
    })) {
      trackedProductRef.current = product.id
    }
  }, [cookiesChoice, product])

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

  const cartProductQty = product
    ? cart.reduce(
      (sum, item) => sum + (item.productId === product.id ? Number(item.qty) || 0 : 0),
      0,
    )
    : 0
  const remainingStock = product ? Math.max(0, product.stock - cartProductQty) : 0

  useEffect(() => {
    if (!product) return
    setQty((current) => Math.min(current, Math.max(1, remainingStock)))
  }, [product, remainingStock])

  const pageState = getProductPageState({ product, catalogReady, syncStatus })
  if (pageState === PRODUCT_PAGE_STATE.loading) return <ProductLoading />
  if (pageState === PRODUCT_PAGE_STATE.error) return <CatalogUnavailable />
  if (pageState === PRODUCT_PAGE_STATE.notFound) return <NotFound />

  const fav = isFavorite(product.id)
  const outOfStock = product.stock <= 0
  const stockLimitReached = !outOfStock && remainingStock === 0
  const maxQty = remainingStock > 0 ? remainingStock : 1
  const hasNicotine = nicotineOptions.some((n) => Number(n) > 0)
  const selectedVariant = {
    ...(color != null ? { color } : {}),
    ...(flavor != null ? { flavor } : {}),
    ...(nicotine != null ? { nicotine } : {}),
    ...(ohm != null ? { ohm } : {}),
  }
  const variantResolution = resolveProductVariant(product, selectedVariant)

  const handleAdd = (requestedQty = qty) => {
    if (outOfStock || stockLimitReached) {
      setAddError('La quantité maximale disponible est déjà dans votre panier.')
      return false
    }
    if (!variantResolution.ok) {
      setAddError(variantResolution.error || 'Choisissez les options du produit.')
      variantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    const wasAdded = addToCart(product.id, Math.min(requestedQty, maxQty), variantResolution.variant)
    if (!wasAdded) {
      setAddError('Le stock vient d’évoluer. Vérifiez votre panier avant de réessayer.')
      return false
    }
    setAddError('')
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    return true
  }

  return (
    <>
      <Seo
        title={`${product.name} — ${categoryName(getProductCategoryKey(product))} | THEKLOPE`}
        description={product.short}
        image={product.image}
        imageAlt={`${product.name} — ${product.brand}`}
        type="product"
        schema={productSchema}
      />
      <div className="container-page py-8 pb-28 lg:pb-8">
        <Breadcrumbs
          items={[
            { label: 'Boutique', to: '/boutique' },
            { label: categoryName(getProductCategoryKey(product)) },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Galerie */}
          <div>
            <div className="card relative overflow-hidden rounded-3xl p-2 aspect-square flex items-center justify-center">
              <div className="absolute left-4 top-4 z-10 flex gap-2">
                {product.badge && <Badge type={product.badge} />}
                {product.oldPrice && !product.badge && <Badge type="promo" />}
              </div>
              <ProductImage
                src={product.images?.[activeImg] || product.image || '/products/product-placeholder.svg'}
                alt={product.name}
                fetchpriority="high"
                decoding="async"
                className="w-full h-full object-cover rounded-2xl"
                width={600}
                height={600}
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
                  <ProductImage src={img} alt="" loading="lazy" className="h-20 w-20 object-cover" width={80} height={80} />
                </button>
              ))}
            </div>
            {product.nicotine?.length > 1 && (
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Le visuel du flacon peut présenter un autre dosage. Le taux sélectionné et repris dans votre panier
                fait foi{nicotine != null ? ` : ${nicotine} mg.` : '.'}
              </p>
            )}
          </div>

          {/* Infos */}
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">{product.brand} · {product.type}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Stars rating={STORE_REVIEW_SUMMARY.rating} reviews={STORE_REVIEW_SUMMARY.count} size={16} />
              <span className="text-xs text-muted">Note de la boutique sur Google, pas du produit.</span>
            </div>

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
            <div ref={variantsRef} className="mt-7 scroll-mt-28 space-y-5">
              {colorOptions.length > 0 && (
                <VariantPicker label="Couleur" options={colorOptions} value={color} onChange={(value) => { setColor(value); setAddError('') }} />
              )}
              {flavorOptions.length > 0 && (
                <VariantPicker label="Saveur" options={flavorOptions} value={flavor} onChange={(value) => { setFlavor(value); setAddError('') }} />
              )}
              {nicotineOptions.length > 0 && (
                <VariantPicker
                  label="Taux de nicotine"
                  options={nicotineOptions}
                  value={nicotine}
                  onChange={(value) => { setNicotine(value); setAddError('') }}
                  render={(n) => `${n} mg`}
                />
              )}
              {ohmOptions.length > 0 && (
                <VariantPicker
                  label="Résistance (Ω)"
                  options={ohmOptions}
                  value={ohm}
                  onChange={(value) => { setOhm(value); setAddError('') }}
                  render={(v) => `${v} Ω`}
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
              <button onClick={() => handleAdd()} disabled={outOfStock || stockLimitReached} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-10">
                {outOfStock
                  ? 'Rupture de stock'
                  : stockLimitReached
                    ? 'Stock maximum au panier'
                    : added
                      ? <><IconCheck width={18} height={18} /> Ajouté !</>
                      : <><IconCart width={18} height={18} /> Ajouter au panier</>}
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
                : stockLimitReached
                  ? 'Tout le stock disponible est déjà dans votre panier'
                : remainingStock > 10
                  ? 'En stock — expédition sous 24/48 h'
                  : `Plus que ${remainingStock} disponible${remainingStock > 1 ? 's' : ''} à ajouter`}
            </p>

            {addError && <p role="alert" className="mt-2 text-xs text-rose-300">{addError}</p>}

            {!outOfStock && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-neon/10 border border-neon/30 px-3.5 py-2.5 text-xs text-neon font-medium max-w-sm">
                <IconTruck width={16} height={16} className="shrink-0" />
                <span>{shippingCountdown}</span>
              </div>
            )}

            {/* Réassurance */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Reassure icon={IconLock} text="Paiement 100% sécurisé" />
              <Reassure icon={IconTruck} text="Livraison en 2–4 jours" />
              <Reassure icon={IconShield} text="Retours sous 14 jours" />
              <Reassure icon={IconShield} text="Vente réservée aux +18" />
            </div>

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
              {product.ohm && !(product.ohmOptions?.length > 0) && (
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted">Résistance</dt>
                  <dd className="text-right font-medium text-white">{product.ohm}</dd>
                </div>
              )}
              {product.ohmOptions?.length > 0 && (
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted">Résistance (Ω)</dt>
                  <dd className="text-right font-medium text-white">{product.ohmOptions.join(' · ')} Ω</dd>
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
          <div className="card p-5 text-sm leading-relaxed text-ash/70">
            Cette note concerne l’expérience globale en boutique, et non ce produit en particulier.
            Les avis Google complets sont affichés sur la page d’accueil après votre accord pour le service d’avis externe.
            <a href="/#avis-clients" className="ml-1 font-semibold text-neon hover:underline">Voir les avis clients</a>
          </div>
        </div>

        {/* Produits associés choisis dans l'administration */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold text-white">Produits associés</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Guides utiles : maillage interne fiche → guides (SEO + réassurance) */}
        {relatedGuides.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold text-white">Guides utiles</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/guides/${guide.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ash transition hover:border-neon/40 hover:text-neon"
                >
                  <span>{guide.title}</span>
                  <IconArrowRight width={15} height={15} className="shrink-0 opacity-60 transition group-hover:opacity-100" />
                </Link>
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
          <button onClick={() => handleAdd()} disabled={outOfStock || stockLimitReached} className="btn-primary shrink-0 px-6 disabled:cursor-not-allowed disabled:opacity-50">
            {outOfStock
              ? 'Rupture'
              : stockLimitReached
                ? 'Stock maximum'
                : added
                  ? <><IconCheck width={18} height={18} /> Ajouté</>
                  : <><IconCart width={18} height={18} /> Ajouter</>}
          </button>
        </div>
      </div>
    </>
  )
}

// Réaffiche le bloc SEO pré-rendu (titre, prix, description, liens) pendant que
// le catalogue se charge : la page garde un contenu réel pour les visiteurs
// comme pour les crawlers, au lieu d'un simple spinner classé « Soft 404 ».
function PrerenderContent({ html }) {
  return (
    <div
      className="container-page prerender-seo py-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function ProductLoading() {
  const snapshot = getPrerenderSnapshot(window.location.pathname)
  if (snapshot) {
    return (
      <div role="status" aria-live="polite" aria-label="Chargement du produit">
        <PrerenderContent html={snapshot} />
      </div>
    )
  }
  return (
    <div className="container-page py-8">
      <div
        className="flex min-h-[60vh] items-center justify-center py-20"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-neon" />
          <p className="mt-4 text-sm text-muted">Chargement du produit…</p>
        </div>
      </div>
    </div>
  )
}

function CatalogUnavailable() {
  // Si la fiche a été pré-rendue, on réaffiche son contenu réel et on la laisse
  // indexable : une panne passagère ne doit pas désindexer un produit valide.
  const snapshot = getPrerenderSnapshot(window.location.pathname)
  if (snapshot) {
    return (
      <>
        <PrerenderContent html={snapshot} />
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-amber-400/25 bg-anthracite p-4 shadow-card" role="alert">
          <p className="text-sm text-white">Les disponibilités live n'ont pas pu être actualisées.</p>
          <button type="button" className="mt-2 text-xs font-semibold text-neon hover:underline" onClick={() => window.location.reload()}>
            Réessayer la synchronisation
          </button>
        </div>
      </>
    )
  }
  return (
    <div className="container-page py-16 text-center">
      {/* Sans instantané : page d'erreur pure, noindex. Avec instantané : on
          conserve le <title>/canonical pré-rendus de la fiche, déjà corrects. */}
      <Seo title="Catalogue temporairement indisponible" noindex />
      <div className="grid min-h-[60vh] place-items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Catalogue temporairement indisponible</h1>
          <p className="mt-2 text-muted">Nous n’avons pas pu vérifier cette fiche produit. Veuillez réessayer.</p>
          <button type="button" className="btn-primary mt-7" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}

function VariantPicker({ label, options, value, onChange, render = (x) => x }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-white">
        {label}{' '}
        <span className={value == null ? 'text-amber-300' : 'text-faint'}>
          · {value == null ? 'À choisir' : render(value)}
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={String(opt)}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
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
    </fieldset>
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
