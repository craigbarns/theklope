import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import { IconSearch, IconClose } from './icons.jsx'

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, products } = useStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!searchOpen) setQ('')
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, setSearchOpen])

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
    <div className="fixed inset-0 z-[90] bg-noir/80 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
      <div className="container-page pt-24" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-2xl animate-fade-up">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-anthracite px-5 py-4 shadow-card">
            <IconSearch className="text-neon" width={22} height={22} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchOpen(false)
                  navigate(`/boutique?q=${encodeURIComponent(q)}`)
                }
              }}
              placeholder="Rechercher un produit, une saveur, une marque…"
              className="flex-1 bg-transparent text-base text-white placeholder-faint outline-none"
            />
            <button onClick={() => setSearchOpen(false)} aria-label="Fermer" className="text-muted hover:text-white">
              <IconClose />
            </button>
          </div>

          {q && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-anthracite shadow-card">
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
