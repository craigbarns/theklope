import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { featuredProducts, isResistanceProduct, selectHomeHeroProduct } from '../data/catalog.js'
import { buildLocalBusinessSchema } from '../data/localBusiness.js'
import { toAnalyticsItem, trackEvent } from '../lib/analytics.js'
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
  { icon: IconTruck, title: 'Livraison Offerte dès 29 €', text: 'Expédition ultra-rapide 24/48h partout en France et coursier Marseille le jour même.' },
  { icon: IconShield, title: 'Boutique Physique & Conseils', text: 'Une équipe d’experts passionnés à votre service au 188 rue de Rome, Marseille.' },
  { icon: IconLock, title: 'Paiement 100% Sécurisé', text: 'Transaction chiffrée SSL & paiement sécurisé par Carte Bancaire et Mollie.' },
  { icon: IconHeadset, title: 'Service Client Réactif', text: 'Accompagnement personnalisé pour vous guider dans le choix de votre matériel.' },
]

const heroCats = [
  { slug: 'cigarettes-electroniques', name: 'Cigarettes électroniques', key: 'ecig' },
  { slug: 'e-liquides', name: 'E-liquides', key: 'eliquide' },
  { slug: 'resistances', name: 'Résistances', key: 'resistance' },
  { slug: 'accessoires', name: 'Accessoires', key: 'accessoire' },
  { slug: 'puffs-rechargeables', name: 'Alternatives puffs', key: 'alternative-puff' },
]

const GUIDE_LINKS = [
  { to: '/guides/quelle-cigarette-electronique-choisir', label: 'Choisir une cigarette électronique' },
  { to: '/guides/choisir-taux-nicotine-e-liquide', label: 'Comprendre les taux de nicotine' },
  { to: '/guides/quand-changer-resistance', label: 'Changer une résistance' },
  { to: '/guides/alternatives-puffs-jetables', label: 'Alternatives aux puffs' },
]

export default function Home() {
  const { products, cookiesChoice } = useStore()
  const { bestSellers, newArrivals, starterPacks } = useMemo(() => featuredProducts(products), [products])
  const heroProduct = useMemo(() => selectHomeHeroProduct(products), [products])
  const featuredProduct = starterPacks[0] || bestSellers[1] || products[1] || heroProduct
  const homeCatalogue = bestSellers.slice(0, 4)
  const homeStarterPacks = starterPacks.slice(0, 2)
  const homeNewArrivals = (newArrivals.length ? newArrivals : products.slice(-4)).slice(0, 4)

  useProductListView({
    cookiesChoice,
    itemListId: 'home_catalogue',
    itemListName: 'Produits sélectionnés',
    products: homeCatalogue,
  })
  useProductListView({
    cookiesChoice,
    itemListId: 'home_starter_packs',
    itemListName: 'Packs débutants',
    products: homeStarterPacks,
  })
  useProductListView({
    cookiesChoice,
    itemListId: 'home_new_arrivals',
    itemListName: 'Nouveautés',
    products: homeNewArrivals,
  })

  const homeSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      buildLocalBusinessSchema(),
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
        title="Vape Shop Marseille & Boutique Vape en Ligne | THEKLOPE"
        description="Boutique de vape et e-liquides à Marseille et en ligne. Découvrez nos kits, pods, e-liquides et produits DIY. Livraison rapide 24/48h et conseils d'experts."
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
              THEKLOPE{' '}
              <span className="mt-2 block bg-gradient-to-r from-neon to-electric bg-clip-text text-transparent">
                — Boutique vape en ligne
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
              <Link to="/categories" className="btn-ghost">
                Voir les catégories
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2"><IconTruck width={18} height={18} className="text-neon" /> Offerte dès 29 € (24/48h)</span>
              <span className="flex items-center gap-2"><IconShield width={18} height={18} className="text-neon" /> Paiement 100% sécurisé</span>
              <span className="flex items-center gap-2"><IconCheck width={18} height={18} className="text-neon" /> Boutique Physique 188 rue de Rome</span>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            {heroProduct ? (
              <div className="relative mx-auto max-w-md">
                {/* Halos de fond colorés et dynamiques */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-neon/20 to-electric/20 blur-3xl rounded-full scale-95 animate-pulse-slow" />
                <Link
                  to={`/produit/${heroProduct.id}`}
                  aria-label={`Voir ${heroProduct.name}`}
                  data-testid="home-hero-product"
                  data-product-id={heroProduct.id}
                  className="card group block aspect-square overflow-hidden rounded-3xl border-white/10 p-2 shadow-card"
                >
                  <ProductImage key={heroProduct.id} src={heroProduct.image} alt={heroProduct.name} fetchpriority="high" className="h-full w-full rounded-2xl object-cover animate-fade-in transition duration-500 group-hover:scale-[1.02]" width={448} height={448} />
                </Link>
                {heroProduct.badge === 'nouveau' && (
                  <span className="absolute left-4 top-4 rounded-full bg-electric px-3 py-1.5 text-xs font-bold text-white shadow-glow-blue">
                    Nouveauté
                  </span>
                )}
                {featuredProduct && (
                  <div className="card absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl p-3 pr-5 shadow-card sm:flex">
                    <ProductImage src={featuredProduct.image} alt="" loading="lazy" className="h-14 w-14 rounded-xl object-cover" width={56} height={56} />
                    <div>
                      <p className="text-xs text-muted">Produit du catalogue</p>
                      <p className="max-w-[10rem] truncate text-sm font-semibold text-white">{featuredProduct.name}</p>
                    </div>
                  </div>
                )}
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
              className="card-interactive group relative flex min-h-44 flex-col justify-between overflow-hidden p-6"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-neon/10 blur-2xl transition group-hover:bg-neon/25" />
              <ProductImage
                src={catThumb(c.key, products)}
                alt=""
                loading="lazy"
                className="relative ml-auto h-24 w-24 rounded-2xl object-cover opacity-90 transition-all duration-500 ease-premium group-hover:scale-105 group-hover:rotate-3"
                width={96}
                height={96}
              />
              <div className="relative mt-4">
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
          <p className="eyebrow mb-3">Commande</p>
          <h2 className="font-display text-3xl font-bold text-white">Informations pratiques</h2>
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

      {/* SÉLECTION DU CATALOGUE */}
      {bestSellers.length > 0 && (
        <ProductRow
          eyebrow="Catalogue"
          title="Produits sélectionnés"
          link="/boutique"
          products={homeCatalogue}
          itemListId="home_catalogue"
        />
      )}

      {/* BANNIÈRE CONFIGURATEUR PACK SUR MESURE */}
      <section className="container-page py-6">
        <div className="relative overflow-hidden rounded-3xl border border-neon/30 bg-gradient-to-r from-neon/10 via-anthracite to-electric/10 p-8 lg:p-10 shadow-glow">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <span className="chip border-neon/30 text-neon mb-3 inline-block">✨ Offre Signature -15%</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Créez votre Pack Vape Sur-Mesure</h2>
              <p className="mt-2 text-sm text-ash/80 max-w-xl">
                Composez votre pack idéal (Cigarette électronique + Résistance + E-liquide au choix) et bénéficiez de <strong className="text-neon">-15% de remise immédiate</strong> automatique.
              </p>
            </div>
            <Link to="/configurateur" className="btn-primary shrink-0 py-3.5 px-6 font-bold shadow-glow text-base">
              Composer mon Pack -15% <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

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
                  sélection regroupée, avec le détail de chaque produit.
                </p>
                <Link to="/categorie/packs-debutants" className="btn-primary mt-6">
                  Voir les packs <IconArrowRight width={18} height={18} />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {homeStarterPacks.map((p, index) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    itemListId="home_starter_packs"
                    itemListName="Packs débutants"
                    index={index}
                  />
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
          products={homeNewArrivals}
          itemListId="home_new_arrivals"
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
    </>
  )
}

function useProductListView({ cookiesChoice, itemListId, itemListName, products }) {
  const trackedRef = useRef('')

  useEffect(() => {
    if (products.length === 0) return
    const signature = `${itemListId}|${products.map((product) => product.id).join('|')}`
    if (trackedRef.current === signature) return
    if (trackEvent('view_item_list', {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: products.map((product, index) => ({
        ...toAnalyticsItem(product),
        index,
      })),
    })) {
      trackedRef.current = signature
    }
  }, [cookiesChoice, itemListId, itemListName, products])
}

function ProductRow({ eyebrow, title, link, products, itemListId }) {
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
        {products.slice(0, 4).map((p, index) => (
          <ProductCard
            key={p.id}
            product={p}
            itemListId={itemListId}
            itemListName={title}
            index={index}
          />
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
