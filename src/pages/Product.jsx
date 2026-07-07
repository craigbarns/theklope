import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { categoryName } from '../data/catalog.js'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Badge from '../components/Badge.jsx'
import Stars from '../components/Stars.jsx'
import ProductCard from '../components/ProductCard.jsx'
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

const REVIEWS = [
  { name: 'Julien M.', rating: 5, date: 'Mai 2026', text: "Très bon produit, finition impeccable et autonomie au rendez-vous. Je recommande." },
  { name: 'Sarah L.', rating: 5, date: 'Avril 2026', text: 'Livraison rapide et emballage soigné. Exactement ce que je cherchais.' },
  { name: 'Karim B.', rating: 4, date: 'Avril 2026', text: 'Bon rapport qualité-prix. Le rendu des saveurs est très correct.' },
]

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
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
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

  return (
    <>
      <Seo title={product.name} description={product.short} schema={productSchema} />
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
              <img
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
                  <img src={img} alt="" className="h-20 w-20 object-cover" />
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

            {/* Réassurance */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Reassure icon={IconLock} text="Paiement 100% sécurisé" />
              <Reassure icon={IconTruck} text="Livraison 24/48h en France" />
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
          <div className="mb-6 flex items-center gap-4">
            <h2 className="font-display text-2xl font-bold text-white">Avis clients</h2>
            <Stars rating={product.rating} reviews={product.reviews} size={16} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="card p-5">
                <Stars rating={r.rating} showCount={false} />
                <p className="mt-3 text-sm leading-relaxed text-ash/70">“{r.text}”</p>
                <p className="mt-4 text-xs text-faint">{r.name} · {r.date}</p>
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
