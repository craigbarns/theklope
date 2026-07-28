import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { IconSearch, IconClose } from './icons.jsx'
import { useDialogFocus } from '../lib/useDialogFocus.js'
import { searchProducts } from '../lib/productSearch.js'
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
    () => (query ? searchProducts(products, query) : []),
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
      <div className="container-page pt-24" onClick={(e) => e.stopPropagation()}>
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
              placeholder="Rechercher un produit, une saveur, une marque…"
              aria-label="Rechercher un produit"
              aria-controls="search-results"
              aria-expanded={Boolean(query)}
              autoComplete="off"
              maxLength={120}
              className="flex-1 bg-transparent text-base text-white placeholder-faint outline-none"
            />
            <button type="button" onClick={close} aria-label="Fermer la recherche" className="text-muted hover:text-white">
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
                <div className="px-5 py-6">
                  <p className="text-sm font-medium text-white">Aucun résultat pour « {query} »</p>
                  <p className="mt-2 text-sm text-muted">
                    Essayez une marque, une saveur ou une référence plus courte.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      trackSearch({ searchTerm: query, resultCount: 0 })
                      setSearchOpen(false)
                      navigate('/boutique')
                    }}
                    className="btn-ghost mt-4 px-4 py-2 text-xs"
                  >
                    Voir toute la boutique
                  </button>
                </div>
              ) : (
                <>
                  {results.map((p, index) => (
                    <button
                      key={p.id}
                      onClick={() => go(p, index)}
                      className="flex w-full items-center gap-4 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" width={48} height={48} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{p.name}</p>
                        <p className="truncate text-xs text-faint">{p.type}</p>
                      </div>
                      <span className="text-sm font-semibold text-neon">{formatPrice(p.price)}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={seeAllResults}
                    className="w-full px-5 py-3 text-center text-sm font-medium text-neon transition hover:bg-white/5"
                  >
                    Voir {allResults.length} résultat{allResults.length > 1 ? 's' : ''} dans la boutique
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
