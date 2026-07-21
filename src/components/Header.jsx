import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Logo from './Logo.jsx'
import { IconSearch, IconHeart, IconCart, IconMenu, IconClose, IconUser } from './icons.jsx'
import { CATEGORIES } from '../data/catalog.js'
import { MAIN_NAV } from '../data/navigation.js'

export default function Header() {
  const { cartCount, favorites, setSearchOpen, setCartOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const [animateCart, setAnimateCart] = useState(false)
  const [prevCartCount, setPrevCartCount] = useState(cartCount)

  useEffect(() => {
    if (cartCount > prevCartCount) {
      setAnimateCart(true)
      const timer = setTimeout(() => setAnimateCart(false), 450)
      setPrevCartCount(cartCount)
      return () => clearTimeout(timer)
    } else if (cartCount !== prevCartCount) {
      setPrevCartCount(cartCount)
    }
  }, [cartCount, prevCartCount])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

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
              type="button"
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-white xl:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-2.5 py-2 text-xs font-medium transition 2xl:px-3.5 2xl:text-sm ${
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
                <span className={`absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[10px] font-bold text-noir transition-all duration-300 ${animateCart ? 'animate-badge-pulse shadow-[0_0_12px_#35FF8A]' : ''}`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Menu mobile plein écran */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-label="Navigation principale"
          className="fixed inset-0 z-50 animate-fade-in overflow-y-auto bg-noir/95 backdrop-blur-2xl xl:hidden"
        >
          <div className="container-page flex h-16 items-center gap-3">
            <button
              type="button"
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
            >
              <IconClose />
            </button>
            <Logo />
          </div>
          <nav className="container-page flex flex-col space-y-1 pb-6 pt-2">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neon">Navigation</p>
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                    isActive ? 'bg-neon/10 text-neon' : 'text-ash hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="my-4 h-px bg-white/10" />
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-neon">Catégories</p>
            <div className="grid grid-cols-2 gap-2 px-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to={`/categorie/${c.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 text-sm text-ash hover:text-white hover:border-white/15 transition-all"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
