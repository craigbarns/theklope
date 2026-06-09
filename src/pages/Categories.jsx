import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { CATEGORIES, PRODUCTS, productsByCategorySlug } from '../data/products.js'
import { IconArrowRight } from '../components/icons.jsx'

export default function Categories() {
  return (
    <div className="container-page py-8">
      <Seo title="Catégories" description="Toutes les catégories THEKLOPE : cigarettes électroniques, pods, e-liquides, accessoires, packs débutants, nouveautés et meilleures ventes." />
      <Breadcrumbs items={[{ label: 'Catégories' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Catégories</h1>
      <p className="mt-2 text-muted">Explorez notre sélection par univers.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const items = productsByCategorySlug(c.slug)
          const thumb = (items[0] || PRODUCTS[0]).image
          return (
            <Link
              key={c.slug}
              to={`/categorie/${c.slug}`}
              className="card group relative flex h-56 flex-col justify-end overflow-hidden p-6 transition hover:border-neon/30"
            >
              <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 transition group-hover:opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-transparent" />
              <div className="relative">
                <h2 className="font-display text-xl font-bold text-white">{c.name}</h2>
                <p className="mt-1 text-sm text-muted">{c.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-neon">
                  {items.length} produit{items.length > 1 ? 's' : ''} <IconArrowRight width={15} height={15} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
