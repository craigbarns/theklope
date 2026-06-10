import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { PRODUCTS as INITIAL_PRODUCTS, getCatalogMeta, getProductFrom } from '../data/products.js'

const StoreContext = createContext(null)
const DEFAULT_PRODUCT_IMAGE = '/products/product-placeholder.svg'

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

export const ORDER_STATUSES = [
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

const slugify = (value) =>
  String(value || 'produit')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter((v) => v !== '')
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

const normalizeProduct = (product) => {
  const id = product.id?.trim() || slugify(product.name)
  const images = normalizeArray(product.images)
  const image = product.image || images[0] || DEFAULT_PRODUCT_IMAGE
  return {
    id,
    name: product.name?.trim() || 'Nouveau produit',
    category: product.category || 'eliquide',
    brand: product.brand?.trim() || 'THEKLOPE',
    type: product.type?.trim() || 'Produit',
    price: Math.max(0, toNumber(product.price)),
    oldPrice: product.oldPrice ? Math.max(0, toNumber(product.oldPrice)) : null,
    rating: Math.min(5, Math.max(0, toNumber(product.rating, 4.7))),
    reviews: Math.max(0, Math.round(toNumber(product.reviews))),
    stock: Math.max(0, Math.round(toNumber(product.stock))),
    badge: product.badge || null,
    nicotine: normalizeArray(product.nicotine).map((n) => toNumber(n)).filter((n) => Number.isFinite(n)),
    flavors: normalizeArray(product.flavors),
    colors: normalizeArray(product.colors),
    short: product.short?.trim() || 'Produit sélectionné par THEKLOPE pour une expérience fiable et agréable.',
    long: product.long?.trim() || product.short?.trim() || 'Fiche produit à compléter depuis le tableau de bord.',
    specs: product.specs && typeof product.specs === 'object' ? product.specs : {},
    images: images.length ? images : [image],
    image,
  }
}

export function StoreProvider({ children }) {
  // Vérification d'âge — null = pas encore répondu
  const [ageVerified, setAgeVerified] = useState(() => read('tk_age', null))
  const [cookiesChoice, setCookiesChoice] = useState(() => read('tk_cookies', null))
  const [products, setProducts] = useState(() => {
    const saved = read('tk_products', null)
    return Array.isArray(saved) && saved.length ? saved.map(normalizeProduct) : INITIAL_PRODUCTS.map(normalizeProduct)
  })
  const [orders, setOrders] = useState(() => {
    const saved = read('tk_orders', [])
    return Array.isArray(saved) ? saved : []
  })
  const [cart, setCart] = useState(() => read('tk_cart', []))
  const [favorites, setFavorites] = useState(() => read('tk_favorites', []))
  const [promo, setPromo] = useState(() => read('tk_promo', null))

  // UI
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => localStorage.setItem('tk_age', JSON.stringify(ageVerified)), [ageVerified])
  useEffect(() => localStorage.setItem('tk_cookies', JSON.stringify(cookiesChoice)), [cookiesChoice])
  useEffect(() => localStorage.setItem('tk_products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('tk_orders', JSON.stringify(orders)), [orders])
  useEffect(() => localStorage.setItem('tk_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('tk_favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => localStorage.setItem('tk_promo', JSON.stringify(promo)), [promo])

  const getProduct = useCallback((id) => getProductFrom(products, id), [products])

  // ----- Catalogue admin -----
  const upsertProduct = useCallback((input) => {
    const nextProduct = normalizeProduct(input)
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === nextProduct.id)
      return exists
        ? prev.map((p) => (p.id === nextProduct.id ? nextProduct : p))
        : [nextProduct, ...prev]
    })
    return nextProduct
  }, [])

  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setCart((prev) => prev.filter((item) => item.productId !== productId))
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }, [])

  const resetProducts = useCallback(() => {
    setProducts(INITIAL_PRODUCTS.map(normalizeProduct))
  }, [])

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
          const product = getProductFrom(products, item.productId)
          if (!product) return null
          return { ...item, index, product, lineTotal: product.price * item.qty }
        })
        .filter(Boolean),
    [cart, products],
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

  // ----- Commandes admin -----
  const createOrder = useCallback(
    ({ customer, address, shipping, shippingCost, total }) => {
      const now = new Date().toISOString()
      const order = {
        id: 'TK-' + Math.floor(100000 + Math.random() * 899999),
        createdAt: now,
        status: 'processing',
        paymentStatus: 'paid',
        customer,
        address,
        shipping,
        items: cartDetailed.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          qty: item.qty,
          variant: item.variant,
          lineTotal: item.lineTotal,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingCost,
        total,
        promo: promo ? { code: promo.code, label: promo.label, type: promo.type, value: promo.value } : null,
      }

      setOrders((prev) => [order, ...prev])
      setProducts((prev) =>
        prev.map((product) => {
          const ordered = order.items.find((item) => item.productId === product.id)
          if (!ordered) return product
          return { ...product, stock: Math.max(0, product.stock - ordered.qty) }
        }),
      )
      clearCart()
      return order
    },
    [cartDetailed, clearCart, promo, totals.discount, totals.subtotal],
  )

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }, [])

  const catalogMeta = useMemo(() => getCatalogMeta(products), [products])

  const dashboard = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'cancelled')
    const revenue = activeOrders.reduce((sum, order) => sum + order.total, 0)
    const units = activeOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0),
      0,
    )
    const lowStock = products.filter((product) => product.stock <= 10).sort((a, b) => a.stock - b.stock)
    const productSales = new Map()
    for (const order of activeOrders) {
      for (const item of order.items) {
        const current = productSales.get(item.productId) || { name: item.name, qty: 0, revenue: 0 }
        current.qty += item.qty
        current.revenue += item.lineTotal
        productSales.set(item.productId, current)
      }
    }
    const bestProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    return {
      revenue,
      ordersCount: activeOrders.length,
      avgOrder: activeOrders.length ? revenue / activeOrders.length : 0,
      units,
      lowStock,
      bestProducts,
      pendingOrders: orders.filter((order) => order.status === 'processing').length,
    }
  }, [orders, products])

  const value = {
    ageVerified,
    setAgeVerified,
    cookiesChoice,
    setCookiesChoice,
    products,
    catalogMeta,
    getProduct,
    upsertProduct,
    deleteProduct,
    resetProducts,
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
    orders,
    createOrder,
    updateOrderStatus,
    dashboard,
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
