import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Newsletter from '../components/Newsletter.jsx'
import { featuredProducts } from '../data/products.js'
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
  { slug: 'accessoires', name: 'Accessoires', key: 'accessoire' },
]

export default function Home() {
  const { products } = useStore()
  const { bestSellers, newArrivals, starterPacks } = useMemo(() => featuredProducts(products), [products])
  const heroProduct = bestSellers[0] || products[0]
  const featuredProduct = starterPacks[0] || bestSellers[1] || products[1] || heroProduct
  return (
    <>
      <Seo
        title="La vape nouvelle génération"
        description="THEKLOPE — Cigarettes électroniques, e-liquides et accessoires sélectionnés pour une expérience premium. Livraison rapide, paiement sécurisé. +18 uniquement."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-neon/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-electric/10 blur-3xl" />
        </div>
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="chip mb-6 border-neon/30 text-neon">
              <IconLeaf width={14} height={14} /> Nouvelle collection 2026
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              THEKLOPE
              <span className="mt-2 block bg-gradient-to-r from-neon to-electric bg-clip-text text-transparent">
                La vape nouvelle génération
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ash/70 sm:text-lg">
              Cigarettes électroniques, e-liquides et accessoires sélectionnés pour une expérience premium.
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
            <div className="relative mx-auto max-w-md">
              <div className="card overflow-hidden rounded-3xl border-white/10 p-2 shadow-card">
                <img src={heroProduct.image} alt={heroProduct.name} className="w-full rounded-2xl" />
              </div>
              <div className="card absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl p-3 pr-5 shadow-card sm:flex">
                <img src={featuredProduct.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="text-xs text-muted">Best-seller</p>
                  <p className="max-w-[10rem] truncate text-sm font-semibold text-white">{featuredProduct.name}</p>
                </div>
              </div>
              <div className="card absolute -right-3 top-6 hidden rounded-2xl px-4 py-3 shadow-card md:block">
                <p className="font-display text-2xl font-bold text-neon">4,7★</p>
                <p className="text-[11px] text-muted">409 avis Google</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES MISES EN AVANT */}
      <section className="container-page py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {heroCats.map((c) => (
            <Link
              key={c.slug}
              to={`/categorie/${c.slug}`}
              className="card group relative flex h-44 items-end overflow-hidden p-6 transition hover:border-neon/30"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-neon/10 blur-2xl transition group-hover:bg-neon/20" />
              <img
                src={catThumb(c.key, products)}
                alt=""
                className="absolute right-3 top-1/2 h-28 w-28 -translate-y-1/2 rounded-2xl object-cover opacity-90"
              />
              <div className="relative">
                <h3 className="font-display text-xl font-semibold text-white">{c.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-neon">
                  Explorer <IconArrowRight width={15} height={15} />
                </span>
              </div>
            </Link>
          ))}
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
            <div key={f.title} className="card p-6 transition hover:border-neon/30">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon">
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
      <ProductRow
        eyebrow="Plébiscités"
        title="Meilleures ventes"
        link="/categorie/meilleures-ventes"
        products={bestSellers}
      />

      {/* PACKS DÉBUTANTS */}
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

      {/* NOUVEAUTÉS */}
      <ProductRow
        eyebrow="Tout juste arrivés"
        title="Nouveautés"
        link="/categorie/nouveautes"
        products={newArrivals.length ? newArrivals : products.slice(-4)}
      />

      {/* BANNIÈRE 18+ */}
      <section className="container-page py-10">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-amber-400/20 bg-amber-400/5 p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-amber-400/40 text-amber-400">
            <IconShield />
          </span>
          <h3 className="font-display text-xl font-bold text-white">
            Interdit aux mineurs — vente réservée aux plus de 18 ans
          </h3>
          <p className="max-w-2xl text-sm text-muted">
            La vente de produits de vapotage est interdite aux mineurs. Les produits contenant de la nicotine
            créent une forte dépendance. Leur utilisation est déconseillée aux non-fumeurs.
          </p>
        </div>
      </section>

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
    accessoire: products.find((p) => p.category === 'accessoire'),
  }
  return (map[key] || products[0])?.image || '/products/product-placeholder.svg'
}
