import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getProduct } from '../data/products.js'

const StoreContext = createContext(null)

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const PROMO_CODES = {
  THEKLOPE10: { type: 'percent', value: 10, label: '-10%' },
  BIENVENUE: { type: 'percent', value: 15, label: '-15% première commande' },
  LIVRAISON: { type: 'shipping', value: 0, label: 'Livraison offerte' },
}

const FREE_SHIPPING_THRESHOLD = 49
const SHIPPING_COST = 4.9

export function StoreProvider({ children }) {
  // Vérification d'âge — null = pas encore répondu
  const [ageVerified, setAgeVerified] = useState(() => read('tk_age', null))
  const [cookiesChoice, setCookiesChoice] = useState(() => read('tk_cookies', null))
  const [cart, setCart] = useState(() => read('tk_cart', []))
  const [favorites, setFavorites] = useState(() => read('tk_favorites', []))
  const [promo, setPromo] = useState(() => read('tk_promo', null))

  // UI
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => localStorage.setItem('tk_age', JSON.stringify(ageVerified)), [ageVerified])
  useEffect(() => localStorage.setItem('tk_cookies', JSON.stringify(cookiesChoice)), [cookiesChoice])
  useEffect(() => localStorage.setItem('tk_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('tk_favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => localStorage.setItem('tk_promo', JSON.stringify(promo)), [promo])

  // ----- Cart -----
  const addToCart = useCallback((productId, qty = 1, variant = {}) => {
    setCart((prev) => {
      const key = JSON.stringify(variant)
      const existing = prev.find((i) => i.productId === productId && JSON.stringify(i.variant) === key)
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { productId, qty, variant }]
    })
    setCartOpen(true)
  }, [])

  const updateQty = useCallback((index, qty) => {
    setCart((prev) =>
      prev
        .map((i, idx) => (idx === index ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    )
  }, [])

  const removeItem = useCallback((index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setPromo(null)
  }, [])

  // ----- Favorites -----
  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }, [])
  const isFavorite = useCallback((productId) => favorites.includes(productId), [favorites])

  // ----- Promo -----
  const applyPromo = useCallback((code) => {
    const clean = (code || '').trim().toUpperCase()
    if (PROMO_CODES[clean]) {
      setPromo({ code: clean, ...PROMO_CODES[clean] })
      return { ok: true, message: `Code « ${clean} » appliqué (${PROMO_CODES[clean].label}).` }
    }
    return { ok: false, message: 'Code promo invalide.' }
  }, [])
  const removePromo = useCallback(() => setPromo(null), [])

  // ----- Totaux -----
  const cartDetailed = useMemo(
    () =>
      cart
        .map((item, index) => {
          const product = getProduct(item.productId)
          if (!product) return null
          return { ...item, index, product, lineTotal: product.price * item.qty }
        })
        .filter(Boolean),
    [cart],
  )

  const totals = useMemo(() => {
    const subtotal = cartDetailed.reduce((s, i) => s + i.lineTotal, 0)
    let discount = 0
    let shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    if (promo) {
      if (promo.type === 'percent') discount = (subtotal * promo.value) / 100
      if (promo.type === 'shipping') shipping = 0
    }
    const total = Math.max(0, subtotal - discount) + shipping
    return { subtotal, discount, shipping, total, freeShippingThreshold: FREE_SHIPPING_THRESHOLD }
  }, [cartDetailed, promo])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const value = {
    ageVerified,
    setAgeVerified,
    cookiesChoice,
    setCookiesChoice,
    cart,
    cartDetailed,
    cartCount,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    favorites,
    toggleFavorite,
    isFavorite,
    promo,
    applyPromo,
    removePromo,
    totals,
    searchOpen,
    setSearchOpen,
    cartOpen,
    setCartOpen,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans StoreProvider')
  return ctx
}

export const formatPrice = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
