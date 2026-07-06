import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, productsByCategorySlugFrom } from '../data/catalog.js'
import { IconChevronDown } from '../components/icons.jsx'
import NotFound from './NotFound.jsx'

const SORTS = [
  { value: 'popularite', label: 'Popularité' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
]

export default function CategoryPage() {
  const { slug } = useParams()
  const { products: allProducts } = useStore()
  const [sort, setSort] = useState('popularite')

  const category = CATEGORIES.find((c) => c.slug === slug)
  const products = useMemo(() => {
    let list = productsByCategorySlugFrom(allProducts, slug)
    if (sort === 'prix-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'prix-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'popularite') list = [...list].sort((a, b) => b.reviews - a.reviews)
    return list
  }, [allProducts, slug, sort])

  if (!category) return <NotFound />

  return (
    <div className="container-page py-8">
      <Seo title={category.name} description={`${category.name} — ${category.tagline}. Sélection THEKLOPE.`} />
      <Breadcrumbs items={[{ label: 'Catégories', to: '/categories' }, { label: category.name }]} />

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-anthracite p-8 sm:p-10">
        <p className="eyebrow mb-2">Catégorie</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{category.name}</h1>
        <p className="mt-2 max-w-xl text-muted">{category.tagline}</p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted">{products.length} produit{products.length > 1 ? 's' : ''}</p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-full border border-white/10 bg-carbon py-2.5 pl-4 pr-10 text-sm text-white outline-none focus:border-neon/50"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>Trier : {s.label}</option>
            ))}
          </select>
          <IconChevronDown width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card mt-8 grid place-items-center p-16 text-center">
          <p className="text-muted">Aucun produit dans cette catégorie pour le moment.</p>
          <Link to="/boutique" className="btn-primary mt-4">Voir toute la boutique</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
