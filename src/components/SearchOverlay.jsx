import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { IconSearch, IconClose } from './icons.jsx'
import { useDialogFocus } from '../lib/useDialogFocus.js'

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, products } = useStore()
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

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.short.toLowerCase().includes(term),
    ).slice(0, 6)
  }, [q, products])

  if (!searchOpen) return null

  const go = (id) => {
    setSearchOpen(false)
    navigate(`/produit/${id}`)
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
                if (e.key === 'Enter') {
                  setSearchOpen(false)
                  navigate(`/boutique?q=${encodeURIComponent(q)}`)
                }
              }}
              placeholder="Rechercher un produit, une saveur, une marque…"
              aria-label="Rechercher un produit"
              aria-controls="search-results"
              aria-expanded={Boolean(q)}
              autoComplete="off"
              className="flex-1 bg-transparent text-base text-white placeholder-faint outline-none"
            />
            <button type="button" onClick={close} aria-label="Fermer la recherche" className="text-muted hover:text-white">
              <IconClose />
            </button>
          </div>

          {q && (
            <div id="search-results" aria-live="polite" className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-anthracite shadow-card">
              {results.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">Aucun résultat pour « {q} ».</p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => go(p.id)}
                    className="flex w-full items-center gap-4 border-b border-white/5 px-4 py-3 text-left transition last:border-0 hover:bg-white/5"
                  >
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" width={48} height={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{p.name}</p>
                      <p className="truncate text-xs text-faint">{p.type}</p>
                    </div>
                    <span className="text-sm font-semibold text-neon">{formatPrice(p.price)}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
