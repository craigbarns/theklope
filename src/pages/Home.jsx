import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import GoogleReviews from '../components/GoogleReviews.jsx'
import Newsletter from '../components/Newsletter.jsx'
import { featuredProducts, isResistanceProduct } from '../data/catalog.js'
import { STORE_REVIEW_SUMMARY } from '../data/reviews.js'
import {
  IconArrowRight,
  IconShield,
  IconTruck,
  IconLock,
  IconHeadset,
  IconLeaf,
  IconCheck,
} from '../components/icons.jsx'

const FEATURES = [
  { icon: IconCheck, title: 'Produits testés et sélectionnés', text: 'Chaque référence est choisie pour sa fiabilité et sa qualité.' },
  { icon: IconTruck, title: 'Livraison rapide en France', text: 'Expédition sous 24/48h, livraison offerte dès 49€.' },
  { icon: IconLock, title: 'Paiement 100% sécurisé', text: 'Transactions chiffrées, vos données sont protégées.' },
  { icon: IconHeadset, title: 'Service client réactif', text: 'Une équipe disponible pour vous accompagner.' },
]

const heroCats = [
  { slug: 'cigarettes-electroniques', name: 'Cigarettes électroniques', key: 'ecig' },
  { slug: 'e-liquides', name: 'E-liquides', key: 'eliquide' },
  { slug: 'resistances', name: 'Résistances', key: 'resistance' },
  { slug: 'accessoires', name: 'Accessoires', key: 'accessoire' },
  { slug: 'alternatives-puffs', name: 'Alternatives puffs', key: 'alternative-puff' },
]

const GUIDE_LINKS = [
  { to: '/guides/quelle-cigarette-electronique-choisir', label: 'Choisir une cigarette électronique' },
  { to: '/guides/choisir-taux-nicotine-e-liquide', label: 'Comprendre les taux de nicotine' },
  { to: '/guides/quand-changer-resistance', label: 'Changer une résistance' },
  { to: '/guides/alternatives-puffs-jetables', label: 'Alternatives aux puffs' },
]

export default function Home() {
  const { products } = useStore()
  const { bestSellers, newArrivals, starterPacks } = useMemo(() => featuredProducts(products), [products])
  const heroProduct = bestSellers[0] || products[0]
  const featuredProduct = starterPacks[0] || bestSellers[1] || products[1] || heroProduct

  const homeSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: 'THEKLOPE',
        image: 'https://www.theklope.com/og-image.jpg',
        '@id': 'https://www.theklope.com/#store',
        url: 'https://www.theklope.com',
        telephone: '+33491555555',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '188 rue de Rome',
          addressLocality: 'Marseille',
          postalCode: '13006',
          addressCountry: 'FR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 43.2905,
          longitude: 5.3801,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: STORE_REVIEW_SUMMARY.rating.toFixed(1),
          reviewCount: STORE_REVIEW_SUMMARY.count,
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.theklope.com/#website',
        url: 'https://www.theklope.com',
        name: 'THEKLOPE',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.theklope.com/boutique?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.theklope.com/#organization',
        name: 'THEKLOPE',
        url: 'https://www.theklope.com',
        logo: 'https://www.theklope.com/logo.png',
      },
    ],
  }), [])

  return (
    <>
      <Seo
        title="Boutique vape en ligne pour adultes"
        description="THEKLOPE — boutique vape en ligne : cigarettes électroniques, e-liquides, produits DIY, résistances et accessoires pour adultes. Livraison France, paiement Mollie sécurisé."
        schema={homeSchema}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="chip mb-6 border-neon/30 text-neon">
              <IconLeaf width={14} height={14} /> Boutique vape française · +18
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              THEKLOPE
              <span className="mt-2 block bg-gradient-to-r from-neon to-electric bg-clip-text text-transparent">
                Boutique vape en ligne pour adultes
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ash/70 sm:text-lg">
              Cigarettes électroniques, e-liquides, produits DIY, résistances et accessoires sélectionnés pour leur
              fiabilité, leur compatibilité et la clarté des informations produit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/boutique" className="btn-primary">
                Découvrir la boutique <IconArrowRight width={18} height={18} />
              </Link>
              <Link to="/categorie/meilleures-ventes" className="btn-ghost">
                Voir les meilleures ventes
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2"><IconTruck width={18} height={18} className="text-neon" /> Livraison 24/48h</span>
              <span className="flex items-center gap-2"><IconShield width={18} height={18} className="text-neon" /> Paiement sécurisé</span>
              <span className="flex items-center gap-2"><IconCheck width={18} height={18} className="text-neon" /> +18 uniquement</span>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            {heroProduct ? (
              <div className="relative mx-auto max-w-md">
                {/* Halos de fond colorés et dynamiques */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-neon/20 to-electric/20 blur-3xl rounded-full scale-95 animate-pulse-slow" />
                <div className="card overflow-hidden rounded-3xl border-white/10 p-2 shadow-card aspect-square">
                  <ProductImage src={heroProduct.image} alt={heroProduct.name} fetchpriority="high" className="w-full h-full object-cover rounded-2xl animate-fade-in" width={448} height={448} />
                </div>
                {featuredProduct && (
                  <div className="card absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl p-3 pr-5 shadow-card sm:flex">
                    <ProductImage src={featuredProduct.image} alt="" loading="lazy" className="h-14 w-14 rounded-xl object-cover" width={56} height={56} />
                    <div>
                      <p className="text-xs text-muted">Best-seller</p>
                      <p className="max-w-[10rem] truncate text-sm font-semibold text-white">{featuredProduct.name}</p>
                    </div>
                  </div>
                )}
                <div className="card absolute -right-3 top-6 hidden rounded-2xl px-4 py-3 shadow-card md:block">
                  <p className="font-display text-2xl font-bold text-neon">{STORE_REVIEW_SUMMARY.ratingLabel}</p>
                  <p className="text-[11px] text-muted">{STORE_REVIEW_SUMMARY.countLabel}</p>
                </div>
              </div>
            ) : (
              <div className="relative mx-auto max-w-md">
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-neon/20 to-electric/20 blur-3xl rounded-full scale-95 animate-pulse-slow" />
                <div className="card overflow-hidden rounded-3xl border-white/10 p-6 shadow-card aspect-[4/3] flex items-center justify-center bg-anthracite/50 text-center">
                  <div>
                    <span className="text-neon text-4xl block mb-3 animate-bounce">💨</span>
                    <p className="text-sm font-semibold text-white">Votre boutique THEKLOPE</p>
                    <p className="text-xs text-muted mt-1">Ajoutez vos premiers produits dans le tableau de bord.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATÉGORIES MISES EN AVANT */}
      <section className="container-page py-10">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {heroCats.map((c) => (
            <Link
              key={c.slug}
              to={`/categorie/${c.slug}`}
              className="card-interactive group relative flex h-44 items-end overflow-hidden p-6"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-neon/10 blur-2xl transition group-hover:bg-neon/25" />
              <ProductImage
                src={catThumb(c.key, products)}
                alt=""
                loading="lazy"
                className="absolute right-3 top-1/2 h-28 w-28 -translate-y-1/2 rounded-2xl object-cover opacity-90 transition-all duration-500 ease-premium group-hover:scale-105 group-hover:rotate-3"
                width={112}
                height={112}
              />
              <div className="relative">
                <h2 className="font-display text-xl font-semibold text-white">{c.name}</h2>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-neon">
                  Explorer <IconArrowRight width={15} height={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="eyebrow mb-3">Guides responsables</p>
            <h2 className="font-display text-2xl font-bold text-white">Comprendre avant de commander</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Des guides courts pour comparer les cigarettes électroniques, choisir un e-liquide compatible,
              entretenir une résistance et connaître les précautions liées à la nicotine.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {GUIDE_LINKS.map((guide) => (
                <Link key={guide.to} to={guide.to} className="rounded-2xl border border-white/8 px-4 py-3 text-sm text-ash transition hover:border-neon/40 hover:text-neon">
                  {guide.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="eyebrow mb-3">Local</p>
            <h2 className="font-display text-2xl font-bold text-white">Boutique vape Marseille</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              THEKLOPE est associé à Marseille et sert les clients adultes en France via la boutique en ligne.
            </p>
            <Link to="/boutique-vape-marseille" className="btn-primary mt-5">
              Voir la page Marseille <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI THEKLOPE */}
      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Confiance</p>
          <h2 className="font-display text-3xl font-bold text-white">Pourquoi choisir THEKLOPE ?</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-interactive group p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon transition-all duration-300 group-hover:scale-110 group-hover:bg-neon/20">
                <f.icon />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-faint">Boutique réservée aux majeurs.</p>
      </section>

      {/* MEILLEURES VENTES */}
      {bestSellers.length > 0 && (
        <ProductRow
          eyebrow="Plébiscités"
          title="Meilleures ventes"
          link="/categorie/meilleures-ventes"
          products={bestSellers}
        />
      )}

      {/* PACKS DÉBUTANTS */}
      {starterPacks.length > 0 && (
        <section className="container-page py-8">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-anthracite">
            <div className="grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-12">
              <div>
                <p className="eyebrow mb-3">Bien démarrer</p>
                <h2 className="font-display text-3xl font-bold text-white">Packs débutants</h2>
                <p className="mt-3 max-w-md text-muted">
                  Tout ce qu'il faut pour commencer sereinement : kit, e-liquides et accessoires réunis dans une
                  sélection avantageuse, pensée pour la première vape.
                </p>
                <Link to="/categorie/packs-debutants" className="btn-primary mt-6">
                  Voir les packs <IconArrowRight width={18} height={18} />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {starterPacks.slice(0, 2).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NOUVEAUTÉS */}
      {products.length > 0 && (
        <ProductRow
          eyebrow="Tout juste arrivés"
          title="Nouveautés"
          link="/categorie/nouveautes"
          products={newArrivals.length ? newArrivals : products.slice(-4)}
        />
      )}

      {/* BANNIÈRE 18+ */}
      <section className="container-page py-10">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-amber-400/20 bg-amber-400/5 p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-amber-400/40 text-amber-400">
            <IconShield />
          </span>
          <h2 className="font-display text-xl font-bold text-white">
            Interdit aux mineurs — vente réservée aux plus de 18 ans
          </h2>
          <p className="max-w-2xl text-sm text-muted">
            La vente de produits de vapotage est interdite aux mineurs. Les produits contenant de la nicotine
            créent une forte dépendance. Leur utilisation est déconseillée aux non-fumeurs.
          </p>
        </div>
      </section>

      <GoogleReviews />
      <Newsletter />
    </>
  )
}

function ProductRow({ eyebrow, title, link, products }) {
  return (
    <section className="container-page py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-display text-3xl font-bold text-white">{title}</h2>
        </div>
        <Link to={link} className="hidden items-center gap-1 text-sm font-medium text-neon hover:gap-2 sm:flex">
          Tout voir <IconArrowRight width={16} height={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

function catThumb(key, products = []) {
  const map = {
    ecig: products.find((p) => p.category === 'ecig'),
    eliquide: products.find((p) => p.category === 'eliquide'),
    resistance: products.find(isResistanceProduct),
    accessoire: products.find((p) => p.category === 'accessoire'),
    'alternative-puff': products.find((p) => p.category === 'pod') || products.find((p) => p.category === 'ecig'),
  }
  return (map[key] || products[0])?.image || '/products/product-placeholder.svg'
}
