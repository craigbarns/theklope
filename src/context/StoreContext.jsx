import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { getCatalogMeta, getProductCategoryKey, getProductFrom } from '../data/catalog.js'
import { enrichProductCopy } from '../data/productCopy.js'
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js'
import {
  PROMO_CODES,
  FREE_SHIPPING_THRESHOLD,
  computeTotals,
  computeBundleProgress,
  isPromoEligible,
  resolveVolume,
} from '../lib/pricing.js'
import { toAnalyticsItem, trackEvent } from '../lib/analytics.js'
import {
  buildCartAddition,
  buildCartVariantUpdate,
  reconcilePersistedProductVariant,
} from '../lib/cart.js'
import { getPaidOrders } from '../lib/dashboard.js'
import { normalizeRelatedProductIds, removeProductAndReferences } from '../lib/relatedProducts.js'
import { readCatalogBootstrap } from '../lib/catalogBootstrap.js'

const StoreContext = createContext(null)
const DEFAULT_PRODUCT_IMAGE = '/products/product-placeholder.svg'
const INITIAL_CATALOG_BOOTSTRAP = readCatalogBootstrap()

// Le catalogue statique (~300 produits) est lourd : on ne le charge qu'à la
// demande, en fallback, pour ne pas l'embarquer dans le bundle initial.
const loadStaticCatalog = async () => {
  if (import.meta.env.PROD && isSupabaseConfigured) {
    const response = await fetch('/catalog-fallback.json', { cache: 'no-cache' })
    if (!response.ok) throw new Error('Catalogue de secours indisponible.')
    const products = await response.json()
    if (!Array.isArray(products)) throw new Error('Catalogue de secours invalide.')
    return products
  }
  const mod = await import('../data/products.js')
  return mod.PRODUCTS
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const ORDER_STATUSES = [
  { value: 'pending_payment', label: 'En attente de paiement' },
  { value: 'processing', label: 'En préparation' },
  { value: 'ready_for_pickup', label: 'Prête au retrait' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'stock_issue', label: 'Incident stock' },
  { value: 'refund_pending', label: 'Remboursement en cours' },
  { value: 'refunded', label: 'Remboursée' },
  { value: 'refund_failed', label: 'Échec du remboursement' },
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
const PRODUCT_ID_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,158}[A-Za-z0-9])?$/
const catalogConflictError = (message) => Object.assign(new Error(message), { code: 'catalog_conflict' })

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
  const normalized = {
    id,
    name: product.name?.trim() || 'Nouveau produit',
    createdAt: product.createdAt || product.created_at || null,
    updatedAt: product.updatedAt || product.updated_at || null,
    category: product.category || 'eliquide',
    brand: product.brand?.trim() || 'THEKLOPE',
    type: product.type?.trim() || 'Produit',
    volume: (product.volume || '').toString().trim(),
    ohm: (product.ohm || '').toString().trim(),
    ohmOptions: normalizeArray(product.ohmOptions).map((v) => v.toString().trim()).filter(Boolean),
    price: Math.max(0, toNumber(product.price)),
    oldPrice: product.oldPrice ? Math.max(0, toNumber(product.oldPrice)) : null,
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
    relatedProductIds: normalizeRelatedProductIds(product.relatedProductIds, id),
  }
  normalized.category = getProductCategoryKey(normalized)
  if (!['eliquide', 'diy'].includes(normalized.category)) {
    normalized.nicotine = []
    normalized.flavors = []
  }
  return enrichProductCopy(normalized)
}

const productToRow = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  brand: product.brand,
  type: product.type,
  volume: product.volume || null,
  ohm: product.ohm || null,
  ohm_options: product.ohmOptions || [],
  price: product.price,
  old_price: product.oldPrice,
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
  related_product_ids: product.relatedProductIds || [],
})

const productFromRow = (row) =>
  normalizeProduct({
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    type: row.type,
    volume: row.volume,
    ohm: row.ohm,
    ohmOptions: row.ohm_options,
    price: row.price,
    oldPrice: row.old_price,
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
    relatedProductIds: row.related_product_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

const orderFromRow = (row) => ({
  id: row.id,
  createdAt: row.created_at,
  status: row.status,
  paymentStatus: row.payment_status,
  refundStatus: row.refund_status || null,
  refundId: row.refund_id || null,
  refundError: row.refund_error || null,
  checkoutReviewRequiredAt: row.checkout_review_required_at || null,
  checkoutReviewReason: row.checkout_review_reason || null,
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

const verifiedAdminSession = async (supabase, session) => {
  if (!session) return null
  const { data, error } = await supabase.rpc('is_admin')
  if (error || data !== true) return null
  return session
}

export function StoreProvider({ children }) {
  // Vérification d'âge — null = pas encore répondu
  const [ageVerified, setAgeVerified] = useState(() => read('tk_age', null))
  const [cookiesChoice, setCookiesChoice] = useState(() => read('tk_cookies', null))
  const [reviewsChoice, setReviewsChoice] = useState(() => {
    const saved = read('tk_reviews_consent', null)
    return saved ?? read('tk_cookies', null)
  })
  const [products, setProducts] = useState(() => {
    if (INITIAL_CATALOG_BOOTSTRAP.length > 0) return INITIAL_CATALOG_BOOTSTRAP.map(normalizeProduct)

    const saved = read('tk_products', null)
    const hasPacks = Array.isArray(saved) && saved.some((p) => p.category === 'pack')
    // Le cache navigateur n'est une source catalogue qu'en mode local. En
    // production, un cache ancien ne doit jamais réafficher un ancien prix.
    return !isSupabaseConfigured && Array.isArray(saved) && saved.length && hasPacks
      ? saved.map(normalizeProduct)
      : []
  })
  const [orders, setOrders] = useState(() => {
    if (isSupabaseConfigured) return []
    const saved = read('tk_orders', [])
    return Array.isArray(saved) ? saved : []
  })
  const [cart, setCart] = useState(() => read('tk_cart', []))
  const [favorites, setFavorites] = useState(() => read('tk_favorites', []))
  const [promo, setPromo] = useState(() => read('tk_promo', null))
  const [adminSession, setAdminSession] = useState(null)
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local')
  const [syncError, setSyncError] = useState(null)
  // Un cache absent ou incomplet ne prouve pas qu'un produit n'existe pas.
  // Cette valeur ne passe à true qu'après résolution d'une source catalogue.
  const [catalogReady, setCatalogReady] = useState(false)

  // UI
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => localStorage.setItem('tk_age', JSON.stringify(ageVerified)), [ageVerified])
  useEffect(() => localStorage.setItem('tk_cookies', JSON.stringify(cookiesChoice)), [cookiesChoice])
  useEffect(() => localStorage.setItem('tk_reviews_consent', JSON.stringify(reviewsChoice)), [reviewsChoice])
  useEffect(() => {
    if (isSupabaseConfigured) {
      localStorage.removeItem('tk_products')
      return
    }
    localStorage.setItem('tk_products', JSON.stringify(products))
  }, [products])
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Les commandes contiennent des données personnelles et ne doivent jamais
      // survivre à la session admin dans le stockage durable du navigateur.
      localStorage.removeItem('tk_orders')
      return
    }
    localStorage.setItem('tk_orders', JSON.stringify(orders))
  }, [orders])
  useEffect(() => localStorage.setItem('tk_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('tk_favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => localStorage.setItem('tk_promo', JSON.stringify(promo)), [promo])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    let subscription = null
    getSupabase().then((sb) => {
      if (!sb || !active) return
      sb.auth.getSession().then(({ data }) => {
        verifiedAdminSession(sb, data.session).then((session) => {
          if (active) setAdminSession(session)
        })
      })
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        setAdminSession(null)
        setOrders([])
        // Sortir du callback Auth avant d'interroger Supabase evite de bloquer
        // le verrou interne de gestion de session du client.
        setTimeout(() => {
          verifiedAdminSession(sb, session).then((verified) => {
            if (active) setAdminSession(verified)
          })
        }, 0)
      })
      subscription = data.subscription
    })
    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  // Charge le catalogue de référence (statique) en fallback, sans bloquer le bundle initial.
  const loadFallbackCatalog = useCallback(async () => {
    try {
      const catalog = await loadStaticCatalog()
      setProducts(catalog.map(normalizeProduct))
      return true
    } catch {
      return false
    }
  }, [])

  const refreshRemoteData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSyncStatus('local')
      return
    }

    try {
      setCatalogReady(false)
      setSyncStatus('syncing')
      setSyncError(null)

      const sb = await getSupabase()
      if (!sb) {
        const fallbackLoaded = await loadFallbackCatalog()
        setSyncStatus('error')
        setSyncError(
          fallbackLoaded
            ? 'Catalogue distant indisponible. Affichage du catalogue de secours.'
            : 'Catalogue distant et catalogue de secours indisponibles.',
        )
        // Le fallback peut afficher un produit connu, mais son absence ne prouve
        // pas qu'un produit Supabase récent n'existe pas.
        setCatalogReady(false)
        return
      }

      const productsResult = await sb
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsResult.error) throw productsResult.error
      const remoteProducts = (productsResult.data || []).map(productFromRow)
      // Une réponse vide est une source valide (par exemple après une suppression
      // volontaire dans l'admin). Le fallback ne sert qu'aux erreurs réseau.
      setProducts(remoteProducts)

      if (adminSession) {
        const ordersResult = await sb
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })

        if (ordersResult.error) throw ordersResult.error
        setOrders((ordersResult.data || []).map(orderFromRow))
      }

      setSyncStatus('online')
      setCatalogReady(true)
    } catch (error) {
      if (isSupabaseConfigured) setOrders([])
      setSyncError(error.message || 'Synchronisation Supabase impossible.')
      await loadFallbackCatalog()
      setSyncStatus('error')
      setCatalogReady(false)
    }
  }, [adminSession, loadFallbackCatalog])

  // En mode local (sans Supabase), on charge le catalogue de référence si rien en cache.
  useEffect(() => {
    if (isSupabaseConfigured) return undefined

    let active = true
    const initializeLocalCatalog = async () => {
      if (products.length > 0 && INITIAL_CATALOG_BOOTSTRAP.length === 0) {
        if (active) setCatalogReady(true)
        return
      }

      setSyncStatus('syncing')
      const fallbackLoaded = await loadFallbackCatalog()
      if (!active) return

      setSyncStatus(fallbackLoaded ? 'local' : 'error')
      setSyncError(fallbackLoaded ? null : 'Catalogue de secours indisponible.')
      setCatalogReady(fallbackLoaded)
    }

    initializeLocalCatalog()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFallbackCatalog])

  useEffect(() => {
    if (isSupabaseConfigured) refreshRemoteData()
  }, [refreshRemoteData])

  // Le stock est global au produit, même lorsque le panier contient plusieurs
  // variantes. On réconcilie aussi les paniers restaurés depuis localStorage.
  useEffect(() => {
    if (!catalogReady) return
    if (products.length === 0) {
      if (syncStatus === 'online') setCart([])
      return
    }

    setCart((previous) => {
      const usedByProduct = new Map()
      let changed = false
      const next = []

      for (const item of previous) {
        const product = getProductFrom(products, item.productId)
        if (!product) {
          changed = true
          continue
        }

        const alreadyUsed = usedByProduct.get(item.productId) || 0
        const available = Math.max(0, product.stock - alreadyUsed)
        const requested = Math.max(0, Math.floor(Number(item.qty) || 0))
        const qty = Math.min(available, requested)
        if (qty <= 0) {
          changed = true
          continue
        }
        const reconciledVariant = reconcilePersistedProductVariant(product, item.variant)
        if (qty !== item.qty || reconciledVariant.changed) changed = true
        usedByProduct.set(item.productId, alreadyUsed + qty)
        next.push(qty === item.qty && !reconciledVariant.changed
          ? item
          : { ...item, qty, variant: reconciledVariant.variant })
      }

      return changed ? next : previous
    })
  }, [catalogReady, products, syncStatus])

  const getProduct = useCallback((id) => getProductFrom(products, id), [products])

  const signInAdmin = useCallback(async ({ email, password }) => {
    const sb = await getSupabase()
    if (!sb) throw new Error('Supabase n’est pas configuré.')
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
    const verified = await verifiedAdminSession(sb, data.session)
    if (!verified) {
      await sb.auth.signOut()
      throw new Error('Ce compte ne possède pas les droits administrateur.')
    }
    setAdminSession(verified)
    return data
  }, [])

  const signOutAdmin = useCallback(async () => {
    const sb = await getSupabase()
    if (!sb) return
    const { error } = await sb.auth.signOut()
    if (error) throw error
    setAdminSession(null)
    setOrders([])
  }, [])

  // ----- Catalogue admin -----
  const upsertProduct = useCallback(async (input) => {
    const requestedId = String(input.id || '').trim() || slugify(input.name)
    const originalId = String(input.originalId || '').trim()
    if (!PRODUCT_ID_RE.test(requestedId)) {
      throw new Error("L'identifiant URL doit commencer et finir par une lettre ou un chiffre et contenir uniquement des lettres sans accent, chiffres, points, tirets ou underscores.")
    }
    if (originalId && requestedId !== originalId) {
      throw new Error("L'identifiant URL d'un produit existant ne peut pas être modifié.")
    }
    if (!originalId && products.some((product) => product.id === requestedId)) {
      throw new Error('Cet identifiant URL est déjà utilisé par un autre produit.')
    }
    const existingProduct = products.find((product) => product.id === requestedId)
    let nextProduct = normalizeProduct({
      ...input,
      id: requestedId,
      createdAt: existingProduct?.createdAt || input.createdAt || (existingProduct ? null : new Date().toISOString()),
      updatedAt: existingProduct?.updatedAt || input.updatedAt || null,
    })
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const sb = await getSupabase()
      let savedRow
      if (existingProduct) {
        const expectedUpdatedAt = input.updatedAt || existingProduct.updatedAt
        if (!expectedUpdatedAt) {
          await refreshRemoteData()
          throw catalogConflictError('Version catalogue manquante. Les données ont été resynchronisées : rouvrez la fiche, vérifiez puis recommencez.')
        }
        const { data, error } = await sb
          .from('products')
          .update(productToRow(nextProduct))
          .eq('id', requestedId)
          .eq('updated_at', expectedUpdatedAt)
          .select('*')
          .maybeSingle()
        if (error) throw error
        if (!data) {
          await refreshRemoteData()
          throw catalogConflictError('Ce produit a changé depuis l’ouverture de la fiche (stock, prix ou contenu). Les données ont été actualisées : rouvrez la fiche, vérifiez puis recommencez.')
        }
        savedRow = data
      } else {
        const { data, error } = await sb
          .from('products')
          .insert(productToRow(nextProduct))
          .select('*')
          .single()
        if (error) throw error
        savedRow = data
      }
      nextProduct = productFromRow(savedRow)
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
  }, [adminSession, products, refreshRemoteData])

  const deleteProduct = useCallback(async (productId) => {
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const sb = await getSupabase()
      const { data, error } = await sb.rpc('delete_product_safely', {
        p_product_id: productId,
      })
      if (error) throw error
      if (!data?.ok) {
        if (data?.status === 'active_order') {
          throw new Error('Ce produit appartient à une commande active. Terminez ou annulez cette commande avant de supprimer la référence.')
        }
        if (data?.status === 'not_found') {
          await refreshRemoteData()
          throw new Error('Ce produit a déjà été supprimé. Le catalogue a été actualisé.')
        }
        throw new Error(`Suppression refusée (${data?.status || 'unknown'}).`)
      }
    }
    setProducts((prev) => removeProductAndReferences(prev, productId))
    setCart((prev) => prev.filter((item) => item.productId !== productId))
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }, [adminSession, refreshRemoteData])

  const resetProducts = useCallback(async () => {
    const catalog = await loadStaticCatalog()
    const relatedIdsByProduct = new Map(products.map((product) => [product.id, product.relatedProductIds || []]))
    const defaults = catalog.map((product) => normalizeProduct({
      ...product,
      relatedProductIds: relatedIdsByProduct.get(product.id) || [],
    }))
    if (isSupabaseConfigured) {
      if (!adminSession) throw new Error('Connexion admin requise pour modifier Supabase.')
      const sb = await getSupabase()
      const { data: liveRows, error: readError } = await sb
        .from('products')
        .select('id, related_product_ids')
      if (readError) throw readError

      const liveById = new Map((liveRows || []).map((row) => [row.id, row]))
      const updates = defaults.flatMap((product) => {
        const live = liveById.get(product.id)
        if (!live) return []
        const row = productToRow({
          ...product,
          relatedProductIds: live.related_product_ids || product.relatedProductIds,
        })
        // Liste blanche volontairement étroite : brand/category/volume/specs
        // participent aux remises, et les options participent au fulfillment.
        // Une maintenance éditoriale ne touche donc ni au prix, ni au stock,
        // ni à aucun champ capable de modifier le montant ou la variante vendue.
        const safeEditorialFields = {
          name: row.name,
          type: row.type,
          short: row.short,
          long: row.long,
          images: row.images,
          image: row.image,
          related_product_ids: row.related_product_ids,
        }
        return [{ id: product.id, values: safeEditorialFields }]
      })

      // Petits lots pour ne pas saturer l'API Supabase sur un gros catalogue.
      for (let index = 0; index < updates.length; index += 12) {
        const batch = updates.slice(index, index + 12)
        const results = await Promise.all(
          batch.map(({ id, values }) => sb.from('products').update(values).eq('id', id)),
        )
        const failed = results.find((result) => result.error)
        if (failed?.error) throw failed.error
      }
      await refreshRemoteData()
      return
    }
    setProducts(defaults)
  }, [adminSession, products, refreshRemoteData])

  const clearAllProducts = useCallback(async () => {
    if (isSupabaseConfigured) {
      throw new Error('La suppression globale est désactivée sur le catalogue live.')
    }
    setProducts([])
    setCart([])
    setFavorites([])
  }, [])

  // ----- Cart -----
  const addItemsToCart = useCallback((entries = []) => {
    const initial = buildCartAddition({ cart, products, entries })
    if (!initial.ok) return false

    // Une seule mutation : soit toutes les lignes sont encore disponibles, soit
    // le panier reste strictement inchangé.
    setCart((previous) => {
      const current = buildCartAddition({ cart: previous, products, entries })
      return current.ok ? current.cart : previous
    })

    trackEvent('add_to_cart', {
      currency: 'EUR',
      value: initial.prepared.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0),
      items: initial.prepared.map((entry) => toAnalyticsItem(entry.product, entry.qty, entry.variant)),
    })
    setCartOpen(true)
    return true
  }, [cart, products])

  const addToCart = useCallback(
    (productId, qty = 1, variant = {}) => addItemsToCart([{ productId, qty, variant }]),
    [addItemsToCart],
  )

  const updateQty = useCallback((index, qty) => {
    setCart((prev) =>
      prev
        .map((item, idx) => {
          if (idx !== index) return item
          const product = getProductFrom(products, item.productId)
          const usedByOtherVariants = prev.reduce(
            (sum, other, otherIndex) => (
              otherIndex !== index && other.productId === item.productId
                ? sum + (Number(other.qty) || 0)
                : sum
            ),
            0,
          )
          const max = Math.max(0, (Number(product?.stock) || 0) - usedByOtherVariants)
          const next = Math.max(0, Math.floor(Number(qty) || 0))
          return { ...item, qty: Math.min(max, next) }
        })
        .filter((i) => i.qty > 0),
    )
  }, [products])

  const removeItem = useCallback((index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index))
  }, [])

  const updateCartVariant = useCallback((index, variant) => {
    const initial = buildCartVariantUpdate({ cart, products, index, variant })
    if (!initial.ok) return false
    setCart((previous) => {
      const current = buildCartVariantUpdate({ cart: previous, products, index, variant })
      return current.ok ? current.cart : previous
    })
    return true
  }, [cart, products])

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

  // ----- Codes promotionnels -----
  const applyPromo = useCallback((code, { eligibilityLines } = {}) => {
    const clean = (code || '').trim().toUpperCase()
    const definition = PROMO_CODES[clean]
    if (!definition) return { ok: false, message: 'Code promo invalide.' }

    const currentLines = eligibilityLines || cart.map((item) => {
      const product = getProductFrom(products, item.productId)
      return product ? { category: product.category, qty: item.qty } : null
    }).filter(Boolean)

    if (!isPromoEligible(definition, currentLines)) {
      return { ok: false, message: 'Le code PACK15 est réservé à un pack complet configuré sur le site.' }
    }

    setPromo({ code: clean, ...definition })
    return { ok: true, message: `Code « ${clean} » appliqué (${definition.label}).` }
  }, [cart, products])
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
    const lines = cartDetailed.map((i) => ({
      price: i.product.price,
      qty: i.qty,
      brand: i.product.brand,
      volume: resolveVolume(i.product),
      category: i.product.category,
    }))
    const t = computeTotals({ lines, promoCode: promo?.code })
    return {
      subtotal: t.subtotal,
      discount: t.discount,
      discountSource: t.discountSource,
      autoDiscount: t.autoDiscount,
      shipping: t.shipping,
      total: t.total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      bundleProgress: computeBundleProgress(lines),
      promoRejected: t.promoRejected,
    }
  }, [cartDetailed, promo])

  useEffect(() => {
    if (totals.promoRejected) setPromo(null)
  }, [totals.promoRejected])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // ----- Commandes -----
  // NB : la persistance Supabase + le statut « payé » sont gérés CÔTÉ SERVEUR
  // (api/create-payment crée la commande en attente, le webhook Mollie la
  // confirme). Ici on ne fait qu'un enregistrement LOCAL optimiste pour l'UI
  // (confirmation, décrément de stock affiché, vidage du panier). Aucune écriture
  // Supabase n'est faite depuis le navigateur.
  const createOrder = useCallback(
    async ({ id, customer, address, shipping, shippingCost, total }) => {
      const now = new Date().toISOString()
      const order = {
        id: id || 'TK-' + Math.floor(100000 + Math.random() * 899999),
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
          const orderedQty = order.items.reduce(
            (sum, item) => sum + (item.productId === product.id ? item.qty : 0),
            0,
          )
          if (!orderedQty) return product
          return { ...product, stock: Math.max(0, product.stock - orderedQty) }
        }),
      )
      clearCart()
      return order
    },
    [cartDetailed, clearCart, promo, totals.discount, totals.subtotal],
  )

  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (status !== 'delivered') {
      throw new Error('Cette transition de commande doit passer par une action contrôlée.')
    }
    const token = adminSession?.access_token
    if (!token) throw new Error('Connexion admin requise.')
    const res = await fetch('/api/mark-delivered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) throw new Error(data.error || 'Confirmation de remise impossible.')
    const nextStatus = data.status || 'delivered'
    setOrders((prev) => prev.map((order) => (
      order.id === orderId ? { ...order, status: nextStatus } : order
    )))
    return data
  }, [adminSession])

  // Marque une commande « expédiée », enregistre le suivi et notifie le client
  // par e-mail (côté serveur, via le jeton admin).
  const markShipped = useCallback(async (orderId, { tracking = '', carrier = '' } = {}) => {
    const token = adminSession?.access_token
    if (!token) throw new Error('Connexion admin requise.')
    const res = await fetch('/api/mark-shipped', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, tracking, carrier }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) throw new Error(data.error || "Envoi de l'e-mail d'expédition impossible.")
    const nextStatus = data.status || 'shipped'
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              shipping: { ...order.shipping, tracking, carrier },
            }
          : order,
      ),
    )
    return data
  }, [adminSession])

  const catalogMeta = useMemo(() => getCatalogMeta(products), [products])

  const dashboard = useMemo(() => {
    const paidOrders = getPaidOrders(orders)
    const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const units = paidOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0),
      0,
    )
    const lowStock = products.filter((product) => product.stock <= 10).sort((a, b) => a.stock - b.stock)
    const productSales = new Map()
    for (const order of paidOrders) {
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
      ordersCount: paidOrders.length,
      avgOrder: paidOrders.length ? revenue / paidOrders.length : 0,
      units,
      lowStock,
      bestProducts,
      pendingOrders: orders.filter((order) => order.status === 'processing').length,
      stockIssues: orders.filter((order) => order.status === 'stock_issue').length,
    }
  }, [orders, products])

  const value = {
    ageVerified,
    setAgeVerified,
    cookiesChoice,
    setCookiesChoice,
    reviewsChoice,
    setReviewsChoice,
    supabaseEnabled: isSupabaseConfigured,
    adminSession,
    adminUser: adminSession?.user || null,
    signInAdmin,
    signOutAdmin,
    syncStatus,
    syncError,
    catalogReady,
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
    addItemsToCart,
    updateQty,
    updateCartVariant,
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
    markShipped,
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
