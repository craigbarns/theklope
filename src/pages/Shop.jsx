import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, productMatchesCategory, sortProductsByMerchandising } from '../data/catalog.js'
import { IconFilter, IconClose, IconChevronDown, IconSearch } from '../components/icons.jsx'
import { toAnalyticsItem, trackEvent, trackSearch } from '../lib/analytics.js'
import { normalizeSearchText, rankProductsBySearch } from '../lib/productSearch.js'
import { createShopSearchState, getShopSearchQuery } from '../lib/searchNavigation.js'

const SORTS = [
  { value: 'selection', label: 'Sélection THEKLOPE' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
]

const MAIN_SHOP_CATEGORIES = [
  { key: 'eliquide', name: 'E-liquides' },
  { key: 'ecig', name: 'Cigarettes électroniques' },
  { key: 'pod', name: 'Pods' },
  { key: 'resistance', name: 'Résistances & Cartouches' },
  { key: 'diy', name: 'DIY' },
  { key: 'accessoire', name: 'Accessoires' },
  { key: 'pack', name: 'Packs débutants' },
  { key: 'alternative-puff', name: 'Puffs rechargeables' },
]

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => !['nouveautes', 'meilleures-ventes'].includes(c.slug))
const PAGE_SIZE = 24

export default function Shop() {
  const { products, catalogMeta, catalogSearchReady, cookiesChoice } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const queryFromNavigation = getShopSearchQuery(location.state)
  const maxAvailablePrice = catalogMeta.maxPrice

  const [search, setSearch] = useState(queryFromNavigation)
  const [cats, setCats] = useState([])
  const [brands, setBrands] = useState([])
  const [types, setTypes] = useState([])
  const [nicotine, setNicotine] = useState([])
  const [flavors, setFlavors] = useState([])
  const [maxPrice, setMaxPrice] = useState(maxAvailablePrice)
  const [userTouchedPrice, setUserTouchedPrice] = useState(false)
  const [sort, setSort] = useState('selection')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const trackedListRef = useRef({ context: '', count: 0 })
  const trackedSearchRef = useRef('')

  const updateSearchState = useCallback((value) => {
    navigate('/boutique', {
      replace: true,
      state: createShopSearchState(location.state, value),
    })
  }, [location.state, navigate])

  useEffect(() => {
    if (!userTouchedPrice) {
      setMaxPrice(maxAvailablePrice)
    } else if (maxPrice > maxAvailablePrice) {
      setMaxPrice(maxAvailablePrice)
    }
  }, [maxAvailablePrice, maxPrice, userTouchedPrice])

  useEffect(() => {
    setSearch(queryFromNavigation)
  }, [queryFromNavigation])

  useEffect(() => {
    if (normalizeSearchText(search) === normalizeSearchText(queryFromNavigation)) return undefined
    const timer = window.setTimeout(() => updateSearchState(search), 250)
    return () => window.clearTimeout(timer)
  }, [queryFromNavigation, search, updateSearchState])

  useEffect(() => {
    const normalizedQuery = normalizeSearchText(queryFromNavigation)
    if (!normalizedQuery) {
      trackedSearchRef.current = ''
      return
    }
    if (!catalogSearchReady) return
    const resultCount = rankProductsBySearch(products, queryFromNavigation).length
    const signature = `${normalizedQuery}:${resultCount}`
    if (trackedSearchRef.current === signature) return
    if (trackSearch({ searchTerm: queryFromNavigation, resultCount })) {
      trackedSearchRef.current = signature
    }
  }, [catalogSearchReady, cookiesChoice, products, queryFromNavigation])

  const toggle = (setter, value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))

  const clearSearch = () => {
    setSearch('')
    updateSearchState('')
  }

  const resetFilters = () => {
    setCats([])
    setBrands([])
    setTypes([])
    setNicotine([])
    setFlavors([])
    setUserTouchedPrice(false)
    setMaxPrice(maxAvailablePrice)
  }

  const reset = () => {
    clearSearch()
    resetFilters()
  }

  const hasSearch = Boolean(normalizeSearchText(queryFromNavigation))
  const searchLoading = hasSearch && !catalogSearchReady
  const searchResults = useMemo(
    () => (hasSearch ? rankProductsBySearch(products, queryFromNavigation) : products),
    [hasSearch, products, queryFromNavigation],
  )

  const filtered = useMemo(() => {
    let list = searchResults.filter((p) => {
      if (cats.length && !cats.some((cat) => productMatchesCategory(p, cat))) return false
      if (brands.length && !brands.includes(p.brand)) return false
      if (types.length && !types.includes(p.type)) return false
      if (p.price > maxPrice) return false
      if (nicotine.length && !(p.nicotine || []).some((n) => nicotine.includes(n))) return false
      if (flavors.length && !(p.flavors || []).some((f) => flavors.includes(f))) return false
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
        if (!hasSearch) list = sortProductsByMerchandising(list)
    }
    return list
  }, [searchResults, cats, brands, types, nicotine, flavors, maxPrice, sort, hasSearch])

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [queryFromNavigation, cats, brands, types, nicotine, flavors, maxPrice, sort])

  useEffect(() => {
    if (searchLoading || visibleProducts.length === 0) return
    const itemListId = hasSearch ? 'search_results' : 'boutique'
    const itemListName = hasSearch ? 'Résultats de recherche' : 'Boutique'
    const context = [
      itemListId,
      normalizeSearchText(queryFromNavigation),
      sort,
      cats.join(','),
      brands.join(','),
      types.join(','),
      nicotine.join(','),
      flavors.join(','),
      maxPrice,
    ].join('|')
    const startIndex = trackedListRef.current.context === context
      ? trackedListRef.current.count
      : 0
    const newlyVisibleProducts = visibleProducts.slice(startIndex)
    if (newlyVisibleProducts.length === 0) return
    if (trackEvent('view_item_list', {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: newlyVisibleProducts.map((product, index) => ({
        ...toAnalyticsItem(product),
        index: startIndex + index,
      })),
    })) {
      trackedListRef.current = { context, count: visibleProducts.length }
    }
  }, [
    brands,
    cats,
    cookiesChoice,
    flavors,
    hasSearch,
    maxPrice,
    nicotine,
    queryFromNavigation,
    searchLoading,
    sort,
    types,
    visibleProducts,
  ])

  const activeCount = cats.length + brands.length + types.length + nicotine.length + flavors.length + (maxPrice < maxAvailablePrice ? 1 : 0)

  const activeChips = useMemo(() => {
    const chips = []
    
    if (hasSearch) {
      chips.push({
        id: 'search',
        label: `Recherche: "${queryFromNavigation}"`,
        onRemove: clearSearch,
      })
    }
    
    cats.forEach((cat) => {
      const catObj = PRODUCT_CATEGORIES.find((c) => c.key === cat)
      chips.push({
        id: `cat-${cat}`,
        label: catObj ? catObj.name : cat,
        onRemove: () => toggle(setCats, cat),
      })
    })

    if (maxPrice < maxAvailablePrice) {
      chips.push({
        id: 'price',
        label: `Max: ${maxPrice} €`,
        onRemove: () => setMaxPrice(maxAvailablePrice),
      })
    }

    brands.forEach((brand) => {
      chips.push({
        id: `brand-${brand}`,
        label: brand,
        onRemove: () => toggle(setBrands, brand),
      })
    })

    types.forEach((type) => {
      chips.push({
        id: `type-${type}`,
        label: type,
        onRemove: () => toggle(setTypes, type),
      })
    })

    nicotine.forEach((n) => {
      chips.push({
        id: `nicotine-${n}`,
        label: `${n} mg`,
        onRemove: () => toggle(setNicotine, n),
      })
    })

    flavors.forEach((f) => {
      chips.push({
        id: `flavor-${f}`,
        label: f,
        onRemove: () => toggle(setFlavors, f),
      })
    })

    return chips
  }, [hasSearch, queryFromNavigation, cats, maxPrice, maxAvailablePrice, brands, types, nicotine, flavors])

  const filtersPanel = (
    <div className="space-y-4">
      <FilterGroup title="Catégorie" defaultOpen={true} activeCount={cats.length}>
        {MAIN_SHOP_CATEGORIES.map((c) => (
          <CheckRow key={c.key} checked={cats.includes(c.key)} onChange={() => toggle(setCats, c.key)} label={c.name} />
        ))}
      </FilterGroup>

      <FilterGroup title="Prix" defaultOpen={true} activeCount={maxPrice < maxAvailablePrice ? 1 : 0}>
        <input
          type="range"
          min={1}
          max={maxAvailablePrice}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value))
            setUserTouchedPrice(true)
          }}
          className="w-full accent-neon"
        />
        <p className="mt-1 text-xs text-muted">Jusqu'à {maxPrice} €</p>
      </FilterGroup>

      <FilterGroup title="Marque" defaultOpen={false} activeCount={brands.length}>
        <BrandFilter
          values={catalogMeta.brands}
          selected={brands}
          onToggle={(brand) => toggle(setBrands, brand)}
        />
      </FilterGroup>

      <FilterGroup title="Taux de nicotine" defaultOpen={true} activeCount={nicotine.length}>
        <div className="flex flex-wrap gap-2">
          {catalogMeta.nicotineLevels.map((n) => (
            <button
              key={n}
              onClick={() => toggle(setNicotine, n)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                nicotine.includes(n)
                  ? 'border-neon bg-neon/15 text-neon font-semibold'
                  : 'border-white/10 text-ash/70 hover:border-white/30'
              }`}
            >
              {n} mg
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`Saveurs (${catalogMeta.flavors.length})`} defaultOpen={false} activeCount={flavors.length}>
        <FlavorFilter
          values={catalogMeta.flavors}
          selected={flavors}
          onToggle={(flavor) => toggle(setFlavors, flavor)}
        />
      </FilterGroup>

      {activeCount > 0 && (
        <button onClick={resetFilters} className="w-full rounded-xl border border-neon/30 bg-neon/10 py-2.5 text-xs font-semibold text-neon hover:bg-neon/20 transition">
          Réinitialiser les filtres ({activeCount})
        </button>
      )}
    </div>
  )

  return (
    <>
      <Seo title="Boutique vape en ligne | THEKLOPE" description="Boutique vape THEKLOPE : cigarettes électroniques, pods rechargeables, e-liquides, résistances et accessoires pour adultes. Filtres par marque, prix, nicotine et saveur." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Boutique' }]} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Boutique</h1>
            <p className="mt-1 text-sm text-muted">
              {searchLoading
                ? 'Chargement du catalogue…'
                : `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`}
            </p>
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
                  <option key={s.value} value={s.value}>
                    Trier : {s.value === 'selection' && hasSearch ? 'Pertinence' : s.label}
                  </option>
                ))}
              </select>
              <IconChevronDown width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
            </div>
          </div>
        </div>

        <form
          className="relative mt-6 max-w-2xl"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            updateSearchState(search)
          }}
        >
          <IconSearch
            width={19}
            height={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Produit, marque, saveur, modèle compatible…"
            aria-label="Rechercher dans la boutique"
            maxLength={120}
            className="w-full rounded-xl border border-white/10 bg-carbon py-3.5 pl-12 pr-12 text-sm text-white outline-none placeholder:text-faint focus:border-neon/50"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Effacer la recherche"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
            >
              <IconClose width={17} height={17} />
            </button>
          )}
        </form>

        {/* CONTENEUR DES CHIPS ACTIFS */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <span className="text-xs text-muted font-medium mr-1">Filtres actifs :</span>
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={chip.onRemove}
                className="group flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-neon/40 hover:bg-neon/5 pl-3 pr-2 py-1 text-xs text-ash/85 hover:text-neon transition"
              >
                <span>{chip.label}</span>
                <span className="text-muted group-hover:text-neon text-[10px] bg-white/5 group-hover:bg-neon/10 rounded-full p-0.5">
                  <IconClose width={10} height={10} />
                </span>
              </button>
            ))}
            <button
              onClick={reset}
              className="text-xs text-neon hover:underline ml-auto pl-2 font-medium"
            >
              Tout effacer
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 card p-5 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              {filtersPanel}
            </div>
          </aside>

          <div>
            {searchLoading ? (
              <div className="card grid place-items-center px-6 py-14 text-center sm:p-16" role="status">
                <p className="text-sm text-muted">Recherche dans le catalogue complet…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card grid place-items-center px-6 py-14 text-center sm:p-16">
                <h2 className="font-display text-xl font-semibold text-white">
                  {hasSearch ? `Aucun résultat pour « ${queryFromNavigation} »` : 'Aucun produit avec ces filtres'}
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  {hasSearch && searchResults.length > 0
                    ? `${searchResults.length} produit${searchResults.length > 1 ? 's correspondent' : ' correspond'} à la recherche, mais pas aux filtres actifs.`
                    : hasSearch
                      ? 'Essayez une marque, une saveur ou une référence plus courte, puis vérifiez les filtres actifs.'
                      : 'Retirez un ou plusieurs filtres pour élargir la sélection.'}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {hasSearch && searchResults.length > 0 ? (
                    <button onClick={resetFilters} className="btn-ghost">Retirer les filtres</button>
                  ) : (
                    <button onClick={reset} className="btn-ghost">Voir tous les produits</button>
                  )}
                  {hasSearch && (
                    <button onClick={clearSearch} className="text-sm font-medium text-neon hover:underline">
                      Effacer la recherche
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div id="catalogue-products" className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                  {visibleProducts.map((p, index) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      itemListId={hasSearch ? 'search_results' : 'boutique'}
                      itemListName={hasSearch ? 'Résultats de recherche' : 'Boutique'}
                      index={index}
                    />
                  ))}
                </div>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <p className="text-xs text-muted">
                    {visibleProducts.length} produit{visibleProducts.length > 1 ? 's' : ''} affiché{visibleProducts.length > 1 ? 's' : ''} sur {filtered.length}
                  </p>
                  {visibleProducts.length < filtered.length && (
                    <button
                      type="button"
                      className="btn-ghost px-6 py-3 text-sm"
                      aria-controls="catalogue-products"
                      onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length))}
                    >
                      Afficher {Math.min(PAGE_SIZE, filtered.length - visibleProducts.length)} produits de plus
                    </button>
                  )}
                </div>
              </>
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

function FilterGroup({ title, children, defaultOpen = true, activeCount = 0 }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1 text-left text-sm font-semibold text-white transition hover:text-neon"
      >
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-neon px-1.5 py-0.5 text-[10px] font-bold text-noir">
              {activeCount}
            </span>
          )}
        </span>
        <IconChevronDown
          width={16}
          height={16}
          className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-3 space-y-2 animate-fade-in">{children}</div>}
    </div>
  )
}

function BrandFilter({ values, selected, onToggle }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const normalizedQuery = normalizeSearchText(query)

  const matches = useMemo(() => {
    const filteredValues = normalizedQuery
      ? values.filter((value) => normalizeSearchText(value).includes(normalizedQuery))
      : values
    const selectedSet = new Set(selected)

    return [
      ...filteredValues.filter((value) => selectedSet.has(value)),
      ...filteredValues.filter((value) => !selectedSet.has(value)),
    ]
  }, [normalizedQuery, selected, values])

  const collapsedLimit = 8
  const visibleValues = expanded ? matches : matches.slice(0, collapsedLimit)
  const remaining = matches.length - visibleValues.length

  return (
    <div className="space-y-2">
      {values.length > 8 && (
        <div className="relative mb-2">
          <IconSearch width={14} height={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setExpanded(false) }}
            placeholder="Filtrer les marques…"
            className="w-full rounded-lg border border-white/10 bg-noir/20 py-1.5 pl-8 pr-7 text-xs text-white outline-none placeholder:text-faint focus:border-neon/40"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-white">
              <IconClose width={12} height={12} />
            </button>
          )}
        </div>
      )}
      {visibleValues.map((brand) => (
        <CheckRow key={brand} checked={selected.includes(brand)} onChange={() => onToggle(brand)} label={brand} />
      ))}
      {remaining > 0 && !expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-xs font-medium text-neon hover:underline">
          + Voir {remaining} marques de plus
        </button>
      )}
      {expanded && values.length > collapsedLimit && !query && (
        <button type="button" onClick={() => setExpanded(false)} className="mt-1 text-xs font-medium text-muted hover:text-white">
          Réduire la liste
        </button>
      )}
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

function FlavorFilter({ values, selected, onToggle }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const normalizedQuery = normalizeSearchText(query)

  const matches = useMemo(() => {
    const filteredValues = normalizedQuery
      ? values.filter((value) => normalizeSearchText(value).includes(normalizedQuery))
      : values
    const selectedSet = new Set(selected)

    return [
      ...filteredValues.filter((value) => selectedSet.has(value)),
      ...filteredValues.filter((value) => !selectedSet.has(value)),
    ]
  }, [normalizedQuery, selected, values])

  const collapsedLimit = normalizedQuery ? 20 : 12
  const visibleValues = expanded ? matches : matches.slice(0, collapsedLimit)
  const remaining = matches.length - visibleValues.length

  return (
    <div className="space-y-2">
      {values.length > 12 && (
        <div className="relative">
          <IconSearch
            width={15}
            height={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setExpanded(false)
            }}
            placeholder="Filtrer les saveurs…"
            aria-label="Filtrer la liste des saveurs"
            className="w-full rounded-lg border border-white/10 bg-noir/20 py-2 pl-9 pr-8 text-xs text-white outline-none placeholder:text-faint focus:border-neon/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setExpanded(false)
              }}
              aria-label="Effacer le filtre des saveurs"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-white"
            >
              <IconClose width={13} height={13} />
            </button>
          )}
        </div>
      )}

      {visibleValues.map((flavor) => (
        <CheckRow
          key={flavor}
          checked={selected.includes(flavor)}
          onChange={() => onToggle(flavor)}
          label={flavor}
        />
      ))}

      {matches.length === 0 && (
        <p className="py-2 text-xs text-muted">Aucune saveur ne correspond à « {query.trim()} ».</p>
      )}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="pt-1 text-xs font-medium text-neon hover:underline"
        >
          Afficher {remaining} autre{remaining > 1 ? 's' : ''} saveur{remaining > 1 ? 's' : ''}
        </button>
      )}

      {expanded && matches.length > collapsedLimit && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="pt-1 text-xs text-muted hover:text-white"
        >
          Réduire la liste
        </button>
      )}
    </div>
  )
}
