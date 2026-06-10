import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES } from '../data/products.js'
import { IconFilter, IconClose, IconChevronDown } from '../components/icons.jsx'

const SORTS = [
  { value: 'popularite', label: 'Popularité' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
]

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => !['nouveautes', 'meilleures-ventes'].includes(c.slug))

export default function Shop() {
  const { products, catalogMeta } = useStore()
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''
  const maxAvailablePrice = catalogMeta.maxPrice

  const [search, setSearch] = useState(initialQ)
  const [cats, setCats] = useState([])
  const [brands, setBrands] = useState([])
  const [types, setTypes] = useState([])
  const [nicotine, setNicotine] = useState([])
  const [flavors, setFlavors] = useState([])
  const [maxPrice, setMaxPrice] = useState(maxAvailablePrice)
  const [sort, setSort] = useState('popularite')
  const [mobileFilters, setMobileFilters] = useState(false)

  useEffect(() => {
    setMaxPrice((value) => Math.min(value || maxAvailablePrice, maxAvailablePrice))
  }, [maxAvailablePrice])

  const toggle = (setter, value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))

  const reset = () => {
    setSearch('')
    setCats([])
    setBrands([])
    setTypes([])
    setNicotine([])
    setFlavors([])
    setMaxPrice(maxAvailablePrice)
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (search) {
        const t = search.toLowerCase()
        if (
          !p.name.toLowerCase().includes(t) &&
          !p.short.toLowerCase().includes(t) &&
          !p.brand.toLowerCase().includes(t) &&
          !p.type.toLowerCase().includes(t)
        )
          return false
      }
      if (cats.length && !cats.includes(p.category)) return false
      if (brands.length && !brands.includes(p.brand)) return false
      if (types.length && !types.includes(p.type)) return false
      if (p.price > maxPrice) return false
      if (nicotine.length && !p.nicotine.some((n) => nicotine.includes(n))) return false
      if (flavors.length && !p.flavors.some((f) => flavors.includes(f))) return false
      return true
    })

    switch (sort) {
      case 'prix-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'prix-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'nouveautes':
        list = [...list].sort((a, b) => (b.badge === 'nouveau' ? 1 : 0) - (a.badge === 'nouveau' ? 1 : 0))
        break
      default:
        list = [...list].sort((a, b) => b.reviews - a.reviews)
    }
    return list
  }, [search, cats, brands, types, nicotine, flavors, maxPrice, sort, products])

  const activeCount = cats.length + brands.length + types.length + nicotine.length + flavors.length + (maxPrice < maxAvailablePrice ? 1 : 0)

  const filtersPanel = (
    <div className="space-y-6">
      <FilterGroup title="Catégorie">
        {PRODUCT_CATEGORIES.map((c) => (
          <CheckRow key={c.key} checked={cats.includes(c.key)} onChange={() => toggle(setCats, c.key)} label={c.name} />
        ))}
      </FilterGroup>

      <FilterGroup title="Prix">
        <input
          type="range"
          min={1}
          max={maxAvailablePrice}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-neon"
        />
        <p className="mt-1 text-xs text-muted">Jusqu'à {maxPrice} €</p>
      </FilterGroup>

      <FilterGroup title="Marque">
        {catalogMeta.brands.map((b) => (
          <CheckRow key={b} checked={brands.includes(b)} onChange={() => toggle(setBrands, b)} label={b} />
        ))}
      </FilterGroup>

      <FilterGroup title="Type de produit">
        {catalogMeta.types.map((t) => (
          <CheckRow key={t} checked={types.includes(t)} onChange={() => toggle(setTypes, t)} label={t} />
        ))}
      </FilterGroup>

      <FilterGroup title="Taux de nicotine">
        <div className="flex flex-wrap gap-2">
          {catalogMeta.nicotineLevels.map((n) => (
            <button
              key={n}
              onClick={() => toggle(setNicotine, n)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                nicotine.includes(n)
                  ? 'border-neon bg-neon/15 text-neon'
                  : 'border-white/10 text-ash/70 hover:border-white/30'
              }`}
            >
              {n} mg
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Saveur">
        {catalogMeta.flavors.map((f) => (
          <CheckRow key={f} checked={flavors.includes(f)} onChange={() => toggle(setFlavors, f)} label={f} />
        ))}
      </FilterGroup>

      {activeCount > 0 && (
        <button onClick={reset} className="text-sm text-neon hover:underline">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  )

  return (
    <>
      <Seo title="Boutique" description="Tous nos produits de vape : cigarettes électroniques, pods, e-liquides et accessoires. Filtrez par catégorie, marque, prix, taux de nicotine et saveur." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Boutique' }]} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Boutique</h1>
            <p className="mt-1 text-sm text-muted">{filtered.length} produit{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="btn-ghost px-4 py-2.5 text-xs lg:hidden"
            >
              <IconFilter width={16} height={16} /> Filtres {activeCount > 0 && `(${activeCount})`}
            </button>
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
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 card p-5">{filtersPanel}</div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="card grid place-items-center p-16 text-center">
                <p className="text-muted">Aucun produit ne correspond à votre recherche.</p>
                <button onClick={reset} className="btn-ghost mt-4">Réinitialiser</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres mobile */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-noir/70 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-anthracite p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Filtres</h2>
              <button onClick={() => setMobileFilters(false)} aria-label="Fermer" className="text-muted">
                <IconClose />
              </button>
            </div>
            {filtersPanel}
            <button onClick={() => setMobileFilters(false)} className="btn-primary mt-6 w-full">
              Voir {filtered.length} produit{filtered.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function CheckRow({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ash/75 hover:text-white">
      <span
        className={`grid h-4 w-4 place-items-center rounded border transition ${
          checked ? 'border-neon bg-neon text-noir' : 'border-white/25'
        }`}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  )
}
