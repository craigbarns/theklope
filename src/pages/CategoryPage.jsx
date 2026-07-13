import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, productsByCategorySlugFrom } from '../data/catalog.js'
import { CATEGORY_SEO } from '../data/categorySeo.js'
import { IconChevronDown } from '../components/icons.jsx'
import NotFound from './NotFound.jsx'

const SORTS = [
  { value: 'popularite', label: 'Popularité' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
]
const PAGE_SIZE = 24

export default function CategoryPage() {
  const { slug } = useParams()
  const { products: allProducts } = useStore()
  const [sort, setSort] = useState('popularite')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const category = CATEGORIES.find((c) => c.slug === slug)
  const seo = CATEGORY_SEO[slug]
  const products = useMemo(() => {
    let list = productsByCategorySlugFrom(allProducts, slug)
    if (sort === 'prix-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'prix-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'popularite') list = [...list].sort((a, b) => b.reviews - a.reviews)
    return list
  }, [allProducts, slug, sort])
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [slug, sort])

  const schema = useMemo(() => {
    if (!category) return null
    const path = `https://www.theklope.com/categorie/${slug}`
    const graph = [
      {
        '@type': 'CollectionPage',
        '@id': path,
        url: path,
        name: seo?.h1 || category.name,
        description: seo?.metaDescription || category.tagline,
        isPartOf: { '@id': 'https://www.theklope.com/#website' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.theklope.com/' },
          { '@type': 'ListItem', position: 2, name: 'Catégories', item: 'https://www.theklope.com/categories' },
          { '@type': 'ListItem', position: 3, name: category.name, item: path },
        ],
      },
      {
        '@type': 'ItemList',
        name: category.name,
        itemListElement: products.slice(0, 24).map((p, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://www.theklope.com/produit/${p.id}`,
          name: p.name,
        })),
      },
    ]

    if (seo?.faq?.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: seo.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      })
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
  }, [category, products, seo, slug])

  if (!category) return <NotFound />

  return (
    <div className="container-page py-8">
      <Seo
        title={`${seo?.seoTitle || category.name} | THEKLOPE`}
        description={seo?.metaDescription || `${category.name} — ${category.tagline}. Sélection THEKLOPE.`}
        schema={schema}
      />
      <Breadcrumbs items={[{ label: 'Catégories', to: '/categories' }, { label: category.name }]} />

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-anthracite p-8 sm:p-10">
        <p className="eyebrow mb-2">Catégorie</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{seo?.h1 || category.name}</h1>
        <p className="mt-2 max-w-2xl text-muted">{seo?.intro || category.tagline}</p>
      </div>

      {seo?.sections?.length > 0 && (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {seo.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="font-display text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.text}</p>
            </article>
          ))}
        </section>
      )}

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
        <>
          <div id="category-products" className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-xs text-muted">
              {visibleProducts.length} produit{visibleProducts.length > 1 ? 's' : ''} affiché{visibleProducts.length > 1 ? 's' : ''} sur {products.length}
            </p>
            {visibleProducts.length < products.length && (
              <button
                type="button"
                className="btn-ghost px-6 py-3 text-sm"
                aria-controls="category-products"
                onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, products.length))}
              >
                Afficher {Math.min(PAGE_SIZE, products.length - visibleProducts.length)} produits de plus
              </button>
            )}
          </div>
        </>
      )}

      {seo?.faq?.length > 0 && (
        <section className="mt-14">
          <p className="eyebrow mb-2">Questions fréquentes</p>
          <h2 className="font-display text-2xl font-bold text-white">À savoir avant de commander</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {seo.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-xs leading-relaxed text-muted">
        Produits de vapotage réservés aux personnes majeures. Les produits contenant de la nicotine créent une forte
        dépendance. La vape ne doit pas être présentée comme totalement sans risque et ne remplace pas un avis médical.
      </p>
    </div>
  )
}
