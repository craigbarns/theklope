import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Logo from './Logo.jsx'
import { IconSearch, IconHeart, IconCart, IconMenu, IconClose, IconChevronDown } from './icons.jsx'
import { CATEGORIES } from '../data/products.js'

const NAV = [
  { to: '/boutique', label: 'Boutique' },
  { to: '/categorie/cigarettes-electroniques', label: 'Cigarettes électroniques' },
  { to: '/categorie/e-liquides', label: 'E-liquides' },
  { to: '/categorie/accessoires', label: 'Accessoires' },
  { to: '/categorie/packs-debutants', label: 'Packs débutants' },
]

export default function Header() {
  const { cartCount, favorites, setSearchOpen, setCartOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <>
      {/* Bandeau promo */}
      <div className="bg-neon text-noir">
        <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-[11px] font-semibold sm:text-xs">
          Livraison offerte dès 49€ en France · Vente strictement réservée aux personnes majeures (+18)
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/10 bg-noir/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-noir/40 backdrop-blur-md'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    isActive ? 'text-neon' : 'text-ash/75 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-ash/80 transition hover:bg-white/5 hover:text-white"
            >
              <IconSearch />
            </button>
            <Link
              to="/favoris"
              aria-label="Favoris"
              className="relative focus-ring grid h-10 w-10 place-items-center rounded-xl text-ash/80 transition hover:bg-white/5 hover:text-white"
            >
              <IconHeart />
              {favorites.length > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-electric px-1 text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Panier"
              className="relative focus-ring grid h-10 w-10 place-items-center rounded-xl text-ash/80 transition hover:bg-white/5 hover:text-white"
            >
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[10px] font-bold text-noir">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="animate-fade-in border-t border-white/10 bg-noir/95 backdrop-blur-xl lg:hidden">
            <nav className="container-page flex flex-col py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive ? 'text-neon' : 'text-ash/80'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="my-2 h-px bg-white/10" />
              <p className="px-3 pb-1 text-[11px] uppercase tracking-wider text-faint">Catégories</p>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} to={`/categorie/${c.slug}`} className="px-3 py-2.5 text-sm text-ash/70">
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
