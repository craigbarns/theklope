import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { fuzzySearchProducts } from '../lib/fuzzySearch.js'
import { IconSearch, IconClose, IconArrowRight } from './icons.jsx'
import ProductImage from './ProductImage.jsx'
import { useDialogFocus } from '../lib/useDialogFocus.js'
import { createShopSearchState } from '../lib/searchNavigation.js'
import { trackSearch, trackSelectItem } from '../lib/analytics.js'

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, products, catalogSearchReady } = useStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const close = useCallback(() => setSearchOpen(false), [setSearchOpen])

  useDialogFocus({
    open: searchOpen,
    dialogRef,
    initialFocusRef: inputRef,
    onClose: close,
  })

  useEffect(() => {
    if (!searchOpen) setQ('')
  }, [searchOpen])

  const query = q.trim()
  const allResults = useMemo(
    () => (query ? fuzzySearchProducts(query, products, 50) : []),
    [query, products],
  )
  const results = allResults.slice(0, 6)
  const catalogLoading = !catalogSearchReady

  if (!searchOpen) return null

  const go = (product, index) => {
    trackSearch({ searchTerm: query, resultCount: allResults.length })
    trackSelectItem({
      product,
      itemListId: 'search_results',
      itemListName: 'Résultats de recherche',
      index,
    })
    setSearchOpen(false)
    navigate(`/produit/${product.id}`)
  }

  const seeAllResults = () => {
    setSearchOpen(false)
    navigate('/boutique', {
      state: createShopSearchState(null, query),
    })
  }

  return (
    <div className="fixed inset-0 z-[90] bg-noir/80 backdrop-blur-sm" onClick={close}>
      <div className="container-page pt-20 sm:pt-24" onClick={(e) => e.stopPropagation()}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-dialog-title"
          tabIndex={-1}
          className="mx-auto max-w-2xl animate-fade-up"
        >
          <h2 id="search-dialog-title" className="sr-only">Rechercher dans la boutique</h2>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-anthracite px-5 py-4 shadow-card">
            <IconSearch className="text-neon" width={22} height={22} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query) seeAllResults()
              }}
              placeholder="Rechercher un produit, une saveur, une marque (ex: Liquideo, Pod, Fruité)…"
              aria-label="Rechercher un produit"
              aria-controls="search-results"
              aria-expanded={Boolean(query)}
              autoComplete="off"
              maxLength={120}
              className="flex-1 bg-transparent text-base text-white placeholder-faint outline-none"
            />
            <button type="button" onClick={close} aria-label="Fermer la recherche" className="text-muted hover:text-white transition">
              <IconClose />
            </button>
          </div>

          {query && (
            <div id="search-results" aria-live="polite" className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-anthracite shadow-card">
              {catalogLoading ? (
                <p className="px-5 py-6 text-sm text-muted" role="status">
                  Chargement du catalogue…
                </p>
              ) : results.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-muted">Aucun produit ne correspond à « <span className="text-white font-medium">{query}</span> ».</p>
                  <p className="mt-1 text-xs text-faint">Essayez avec un mot-clé comme "Pod", "Liquideo", "Vaporesso" ou "Fruité".</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  <div className="bg-carbon/50 px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-faint flex justify-between items-center">
                    <span>Résultats suggérés ({allResults.length})</span>
                    <span>Appuyez sur Entrée pour tout voir</span>
                  </div>
                  {results.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => go(p, idx)}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-white/5 group"
                    >
                      <ProductImage src={p.image} alt="" className="h-12 w-12 rounded-xl bg-carbon p-1 object-cover shrink-0" width={48} height={48} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-white group-hover:text-neon transition">{p.name}</span>
                          <span className="shrink-0 rounded-full border border-white/10 bg-carbon px-2 py-0.5 text-[10px] font-medium text-faint">
                            {p.brand}
                          </span>
                        </div>
                        <p className="truncate text-xs text-faint mt-0.5">{p.type} · {p.short}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-neon block">{formatPrice(p.price)}</span>
                        {p.stock <= 0 && <span className="text-[10px] text-rose-400">Épuisé</span>}
                      </div>
                    </button>
                  ))}
                  {allResults.length > 6 && (
                    <button
                      type="button"
                      onClick={seeAllResults}
                      className="flex w-full items-center justify-between bg-carbon/40 px-4 py-3 text-xs font-semibold text-neon hover:bg-white/5 transition"
                    >
                      <span>Voir les {allResults.length} résultats dans la boutique</span>
                      <IconArrowRight width={16} height={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
