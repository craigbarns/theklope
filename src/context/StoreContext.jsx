import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { PRODUCTS as INITIAL_PRODUCTS, getCatalogMeta, getProductFrom } from '../data/products.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

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
  PACK15: { type: 'percent', value: 15, label: '-15% Pack Sur Mesure' },
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

const productToRow = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  brand: product.brand,
  type: product.type,
  price: product.price,
  old_price: product.oldPrice,
  rating: product.rating,
  reviews: product.reviews,
  stock: product.stock,
  badge: product.badge,
  nicotine: product.nicotine,
  flavors: product.flavors,
  colors: product.colors,
  short: product.short,
  long: product.long,
  specs: product.specs,
  images: product.images,
  image: product.image,
})

const productFromRow = (row) =>
  normalizeProduct({
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    type: row.type,
    price: row.price,
    oldPrice: row.old_price,
    rating: row.rating,
    reviews: row.reviews,
    stock: row.stock,
    badge: row.badge,
    nicotine: row.nicotine,
    flavors: row.flavors,
    colors: row.colors,
    short: row.short,
    long: row.long,
    specs: row.specs,
    images: row.images,
    image: row.image,
  })

const orderToRow = (order) => ({
  id: order.id,
  created_at: order.createdAt,
  status: order.status,
  payment_status: order.paymentStatus,
  customer: order.customer,
  address: order.address,
  shipping: order.shipping,
  subtotal: order.subtotal,
  discount: order.discount,
  shipping_cost: order.shippingCost,
  total: order.total,
  promo: order.promo,
})

const orderItemToRow = (orderId, item) => ({
  order_id: orderId,
  product_id: item.productId,
  name: item.name,
  image: item.image,
  price: item.price,
  qty: item.qty,
  variant: item.variant,
  line_total: item.lineTotal,
})

const orderFromRow = (row) => ({
  id: row.id,
  createdAt: row.created_at,
  status: row.status,
  paymentStatus: row.payment_status,
  customer: row.customer || {},
  address: row.address || {},
  shipping: row.shipping || {},
  subtotal: Number(row.subtotal || 0),
  discount: Number(row.discount || 0),
  shippingCost: Number(row.shipping_cost || 0),
  total: Number(row.total || 0),
  promo: row.promo,
  items: (row.order_items || []).map((item) => ({
    productId: item.product_id,
    name: item.name,
    image: item.image,
    price: Number(item.price || 0),
    qty: Number(item.qty || 0),
    variant: item.variant || {},
    lineTotal: Number(item.line_total || 0),
  })),
})

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
  const [adminSession, setAdminSession] = useState(null)
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local')
  const [syncError, setSyncError] = useState(null)

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

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAdminSession(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const refreshRemoteData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSyncStatus('local')
      return
    }

    try {
      setSyncStatus('syncing')
      setSyncError(null)

      const productsResult = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsResult.error) throw productsResult.error
      setProducts((productsResult.data || []).map(productFromRow))

      if (adminSession) {
        const ordersResult = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })

        if (ordersResult.error) throw ordersResult.error
        setOrders((ordersResult.data || []).map(orderFromRow))
      }

      setSyncStatus('online')
    } catch (error) {
      setSyncStatus('error')
      setSyncError(error.message || 'Synchronisation Supabase impossible.')
    }
  }, [adminSession])

  useEffect(() => {
    refreshRemoteData()
  }, [refreshRemoteData])

  const getProduct = useCallback((id) => getProductFrom(products, id), [products])

  const signInAdmin = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured) throw new Error('Supabase n’est pas configuré.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setAdminSession(data.session)
    return data
  }, [])

  const signOutAdmin = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setAdminSession(null)
    setOrders([])
  }, [])

  // ----- Catalogue admin -----
  const upsertProduct = useCallback(async (input) => {
    const nextProduct = normalizeProduct(input)
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const { error } = await supabase.from('products').upsert(productToRow(nextProduct))
      if (error) throw error
      setSyncStatus('online')
      setSyncError(null)
    }
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === nextProduct.id)
      return exists
        ? prev.map((p) => (p.id === nextProduct.id ? nextProduct : p))
        : [nextProduct, ...prev]
    })
    return nextProduct
  }, [adminSession])

  const deleteProduct = useCallback(async (productId) => {
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setCart((prev) => prev.filter((item) => item.productId !== productId))
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }, [adminSession])

  const resetProducts = useCallback(async () => {
    const defaults = INITIAL_PRODUCTS.map(normalizeProduct)
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const { error } = await supabase.from('products').upsert(defaults.map(productToRow))
      if (error) throw error
    }
    setProducts(defaults)
  }, [adminSession])

  const clearAllProducts = useCallback(async () => {
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const { error } = await supabase.from('products').delete().neq('id', '')
      if (error) throw error
    }
    setProducts([])
    setCart([])
    setFavorites([])
  }, [adminSession])

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
    const rawSubtotal = cartDetailed.reduce((s, i) => s + i.lineTotal, 0)
    const subtotal = Math.round(rawSubtotal * 100) / 100
    let discount = 0
    let shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    if (promo) {
      if (promo.type === 'percent') {
        discount = Math.round(((subtotal * promo.value) / 100) * 100) / 100
      }
      if (promo.type === 'shipping') shipping = 0
    }
    const total = Math.round((Math.max(0, subtotal - discount) + shipping) * 100) / 100
    return { subtotal, discount, shipping, total, freeShippingThreshold: FREE_SHIPPING_THRESHOLD }
  }, [cartDetailed, promo])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // ----- Commandes admin -----
  const createOrder = useCallback(
    async ({ customer, address, shipping, shippingCost, total }) => {
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

      if (isSupabaseConfigured) {
        const { error } = await supabase.rpc('submit_order', {
          order_payload: orderToRow(order),
          items_payload: order.items.map((item) => orderItemToRow(order.id, item)),
        })
        if (error) throw error
        setSyncStatus('online')
        setSyncError(null)
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
    [cartDetailed, clearCart, products, promo, totals.discount, totals.subtotal],
  )

  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
    }
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }, [adminSession])

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
    supabaseEnabled: isSupabaseConfigured,
    adminSession,
    adminUser: adminSession?.user || null,
    signInAdmin,
    signOutAdmin,
    syncStatus,
    syncError,
    refreshRemoteData,
    products,
    catalogMeta,
    getProduct,
    upsertProduct,
    deleteProduct,
    resetProducts,
    clearAllProducts,
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
