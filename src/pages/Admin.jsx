import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, formatPrice, ORDER_STATUSES } from '../context/StoreContext.jsx'
import { CATEGORIES, BADGES } from '../data/catalog.js'
import { findCatalogIssues } from '../data/catalogQuality.js'
import Seo from '../components/Seo.jsx'
import ImageUploader from '../components/ImageUploader.jsx'
import GalleryUploader from '../components/GalleryUploader.jsx'
import {
  addRelatedProductId,
  normalizeRelatedProductIds,
  removeRelatedProductId,
  searchRelatedProducts,
} from '../lib/relatedProducts.js'
import { getPaidOrders } from '../lib/dashboard.js'
import {
  IconArrowRight,
  IconBolt,
  IconCart,
  IconCheck,
  IconClose,
  IconPlus,
  IconSearch,
  IconShield,
  IconTrash,
  IconUser,
} from '../components/icons.jsx'

const PRODUCT_CATEGORIES = CATEGORIES.filter((category) => !['nouveautes', 'meilleures-ventes'].includes(category.slug))
const TABS = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'products', label: 'Produits' },
  { id: 'orders', label: 'Commandes' },
  { id: 'emailing', label: 'Campagnes E-mailing' },
  { id: 'settings', label: 'Pilotage' },
]

const emptyProduct = {
  id: '',
  name: '',
  category: 'eliquide',
  brand: 'THEKLOPE',
  type: 'E-liquide',
  volume: '',
  ohm: '',
  ohmOptions: '',
  price: '',
  oldPrice: '',
  stock: 24,
  badge: '',
  image: '/products/product-placeholder.svg',
  images: '',
  nicotine: '0, 3, 6',
  flavors: '',
  colors: '',
  short: '',
  long: '',
  specsText: 'Origine: France\nConformité: Produit à valider',
  relatedProductIds: [],
}

const DIY_PRODUCT_DEFAULTS = {
  type: 'Produit DIY',
  nicotine: '',
  specsText: 'Composition: À renseigner\nContenance: À renseigner\nConseils: Respecter les indications du fabricant',
}

const statusLabel = Object.fromEntries(ORDER_STATUSES.map((status) => [status.value, status.label]))
const refundStatusLabel = {
  requested: 'Demandé',
  queued: 'En file d’attente',
  pending: 'En attente',
  processing: 'En cours',
  refunded: 'Remboursé',
  failed: 'Échec',
  canceled: 'Annulé par Mollie',
}
const checkoutReviewReasonLabel = {
  ambiguous_payment_creation: 'création du paiement ambiguë',
  payment_not_recoverable_safely: 'ancien paiement introuvable sans risque de doublon',
  multiple_payments_for_order: 'plusieurs paiements Mollie peuvent correspondre à la commande',
  payment_chargeback_detected: 'chargeback Mollie détecté',
  partial_external_refund: 'remboursement Mollie partiel',
  external_refund_proof_incomplete: 'preuve du remboursement Mollie incomplète',
  external_refund_in_progress: 'autre remboursement Mollie déjà en cours',
  refund_intent_exceeds_remaining: 'solde de remboursement modifié',
  legacy_paid_cancelled_unreconciled: 'ancienne annulation payée à réconcilier',
}
// L'expédition, la mise à disposition et la remise passent par
// /api/mark-shipped ; l'annulation passe par /api/cancel-order. Le select ne
// sert qu'à confirmer que le transporteur ou la boutique a remis la commande.
const MANUAL_FULFILLMENT_STATUSES = new Set(['shipped', 'ready_for_pickup'])

export default function Admin() {
  const {
    products,
    catalogMeta,
    orders,
    dashboard,
    upsertProduct,
    deleteProduct,
    resetProducts,
    clearAllProducts,
    updateOrderStatus,
    markShipped,
    supabaseEnabled,
    adminSession,
    adminUser,
    signInAdmin,
    signOutAdmin,
    syncStatus,
    syncError,
    refreshRemoteData,
  } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'overview'
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [actionError, setActionError] = useState('')
  const [mondialRelayStatus, setMondialRelayStatus] = useState(null)
  const [mondialRelayStatusError, setMondialRelayStatusError] = useState('')

  useEffect(() => {
    const token = adminSession?.access_token
    if (!token) {
      setMondialRelayStatus(null)
      setMondialRelayStatusError('')
      return undefined
    }
    const controller = new AbortController()
    const loadStatus = async () => {
      try {
        setMondialRelayStatusError('')
        const response = await fetch('/api/mondial-relay?action=status', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || payload.error) {
          throw new Error(payload.error || 'Configuration Mondial Relay indisponible.')
        }
        setMondialRelayStatus(payload)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setMondialRelayStatusError(error.message || 'Configuration Mondial Relay indisponible.')
        }
      }
    }
    loadStatus()
    return () => controller.abort()
  }, [adminSession?.access_token])

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.brand, product.type, product.category].some((value) =>
        String(value || '').toLowerCase().includes(term),
      ),
    )
  }, [products, query])

  const setTab = (nextTab) => {
    setParams({ tab: nextTab })
    if (nextTab !== 'products') setEditing(null)
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer "${product.name}" du catalogue ?`)) return
    try {
      setActionError('')
      await deleteProduct(product.id)
    } catch (error) {
      setActionError(error.message || 'Suppression impossible.')
    }
  }

  if (supabaseEnabled && !adminSession) {
    return <AdminLogin signInAdmin={signInAdmin} syncError={syncError} />
  }

  return (
    <div className="container-page py-8">
      <Seo title="Admin" description="Dashboard THEKLOPE." noindex />

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon via-anthracite to-noir p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="chip border-neon/30 text-neon">
              <IconShield width={14} height={14} /> Espace admin
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-5xl">Pilotage THEKLOPE</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Gérez le catalogue, suivez les commandes, surveillez le stock et gardez une vision claire des ventes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={refreshRemoteData} className="btn-ghost shrink-0">
              Synchroniser
            </button>
            {supabaseEnabled && (
              <button onClick={signOutAdmin} className="btn-ghost shrink-0">
                Déconnexion
              </button>
            )}
            <Link to="/boutique" className="btn-ghost shrink-0">
              Voir la boutique <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted">
            Source: <strong className="text-white">{supabaseEnabled ? 'Supabase' : 'Local'}</strong> · statut: <strong className="text-neon">{syncStatus}</strong>
          </span>
          {adminUser && <span className="text-faint">{adminUser.email}</span>}
        </div>

        {(syncError || actionError) && (
          <div className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {actionError || syncError}
          </div>
        )}

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === item.id
                  ? 'border-neon bg-neon text-noir'
                  : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/30 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <Overview dashboard={dashboard} orders={orders} products={products} />}
      {tab === 'products' && (
        <ProductsPanel
          products={filteredProducts}
          allProducts={products}
          catalogMeta={catalogMeta}
          editing={editing}
          query={query}
          setEditing={setEditing}
          setQuery={setQuery}
          onDelete={handleDelete}
          onSave={async (product) => {
            try {
              setActionError('')
              await upsertProduct(product)
              setEditing(null)
            } catch (error) {
              if (error.code === 'catalog_conflict') setEditing(null)
              setActionError(error.message || 'Enregistrement impossible.')
            }
          }}
        />
      )}
      {tab === 'orders' && (
        <OrdersPanel
          orders={orders}
          updateOrderStatus={async (orderId, status) => {
            try {
              setActionError('')
              await updateOrderStatus(orderId, status)
            } catch (error) {
              setActionError(error.message || 'Mise à jour impossible.')
            }
          }}
          markShipped={markShipped}
          adminSession={adminSession}
          refreshRemoteData={refreshRemoteData}
          mondialRelayStatus={mondialRelayStatus}
          cancelOrder={adminSession ? async (orderId, reason) => {
            const response = await fetch('/api/cancel-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminSession.access_token}`,
              },
              body: JSON.stringify({ orderId, reason }),
            })
            const payload = await response.json().catch(() => ({}))
            if (!response.ok || payload.error) {
              throw new Error(payload.error || 'Annulation impossible.')
            }
            await refreshRemoteData()
            return payload
          } : null}
        />
      )}
      {tab === 'emailing' && <EmailingPanel />}
      {tab === 'settings' && (
        <SettingsPanel
          products={products}
          orders={orders}
          resetProducts={async () => {
            try {
              setActionError('')
              await resetProducts()
            } catch (error) {
              setActionError(error.message || 'Réinitialisation impossible.')
            }
          }}
          clearAllProducts={async () => {
            try {
              setActionError('')
              await clearAllProducts()
            } catch (error) {
              setActionError(error.message || 'Suppression impossible.')
            }
          }}
          setTab={setTab}
          supabaseEnabled={supabaseEnabled}
          adminSession={adminSession}
          mondialRelayStatus={mondialRelayStatus}
          mondialRelayStatusError={mondialRelayStatusError}
        />
      )}
    </div>
  )
}

function AdminLogin({ signInAdmin, syncError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await signInAdmin({ email, password })
    } catch (err) {
      setError(err.message || 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <Seo title="Connexion admin" noindex />
      <div className="w-full max-w-md card p-8">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
          <IconUser width={28} height={28} />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">Connexion admin</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Connectez-vous avec un compte Supabase Auth autorisé dans la liste des administrateurs.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="E-mail admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {(error || syncError) && (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error || syncError}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Connexion...' : 'Entrer dans le dashboard'}
          </button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-faint">
          L’utilisateur doit être créé dans Authentication, puis son identifiant ajouté à la table sécurisée public.admin_users.
        </p>
      </div>
    </div>
  )
}

function Overview({ dashboard, orders, products }) {
  const paidOrders = useMemo(() => getPaidOrders(orders), [orders])
  const sales = useMemo(() => lastSevenDays(paidOrders), [paidOrders])
  const maxSales = Math.max(1, ...sales.map((day) => day.total))
  const recentOrders = paidOrders.slice(0, 4)

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d’affaires" value={formatPrice(dashboard.revenue)} detail={`${dashboard.ordersCount} commande${dashboard.ordersCount > 1 ? 's' : ''}`} />
        <StatCard label="Panier moyen" value={formatPrice(dashboard.avgOrder)} detail={`${dashboard.units} article${dashboard.units > 1 ? 's' : ''} vendu${dashboard.units > 1 ? 's' : ''}`} />
        <StatCard label="Produits actifs" value={products.length} detail={`${dashboard.lowStock.length} alerte${dashboard.lowStock.length > 1 ? 's' : ''} stock`} />
        <StatCard
          label={dashboard.stockIssues > 0 ? 'À traiter' : 'À préparer'}
          value={dashboard.stockIssues > 0 ? dashboard.stockIssues : dashboard.pendingOrders}
          detail={dashboard.stockIssues > 0 ? 'Incident stock payé' : 'Commandes ouvertes'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-2">Ventes</p>
              <h2 className="font-display text-xl font-bold text-white">7 derniers jours</h2>
            </div>
            <IconBolt className="text-neon" />
          </div>
          <div className="flex h-64 items-end gap-3">
            {sales.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                <div className="flex h-48 w-full items-end rounded-2xl border border-white/8 bg-white/[0.03] p-2">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-neon to-electric shadow-glow"
                    style={{ height: `${Math.max(6, (day.total / maxSales) * 100)}%` }}
                    title={formatPrice(day.total)}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-white">{day.label}</p>
                  <p className="text-[11px] text-faint">{formatPrice(day.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-2">Commandes</p>
              <h2 className="font-display text-xl font-bold text-white">Derniers achats</h2>
            </div>
            <IconCart className="text-neon" />
          </div>
          {recentOrders.length ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{order.id}</p>
                      <p className="text-xs text-faint">{order.customer?.name || 'Client'} · {formatDate(order.createdAt)}</p>
                    </div>
                    <p className="font-display font-bold text-neon">{formatPrice(order.total)}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted">{order.items.length} ligne{order.items.length > 1 ? 's' : ''} · {statusLabel[order.status]}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Aucune commande pour le moment" text="Les commandes passées sur le checkout apparaîtront ici." />
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <p className="eyebrow mb-2">Stock</p>
          <h2 className="font-display text-xl font-bold text-white">Alertes prioritaires</h2>
          <div className="mt-5 space-y-3">
            {dashboard.lowStock.slice(0, 6).map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <img src={product.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-faint">{product.brand}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock <= 3 ? 'bg-rose-500 text-white' : 'bg-amber-400 text-noir'}`}>
                  {product.stock}
                </span>
              </div>
            ))}
            {!dashboard.lowStock.length && <EmptyState title="Stock sain" text="Aucune alerte sous 10 unités." compact />}
          </div>
        </section>

        <section className="card p-6">
          <p className="eyebrow mb-2">Top produits</p>
          <h2 className="font-display text-xl font-bold text-white">Meilleures ventes réelles</h2>
          <div className="mt-5 space-y-3">
            {dashboard.bestProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-neon text-sm font-bold text-noir">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-faint">{product.qty} vendu{product.qty > 1 ? 's' : ''}</p>
                </div>
                <span className="font-semibold text-white">{formatPrice(product.revenue)}</span>
              </div>
            ))}
            {!dashboard.bestProducts.length && <EmptyState title="Pas encore de ventes" text="Le classement se construira avec les commandes." compact />}
          </div>
        </section>
      </div>
    </div>
  )
}

function ProductsPanel({ products, allProducts, catalogMeta, editing, query, setEditing, setQuery, onDelete, onSave }) {
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_440px]">
      <section className="card min-w-0 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Catalogue</p>
            <h2 className="font-display text-xl font-bold text-white">{allProducts.length} produits</h2>
          </div>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="input min-w-0 sm:w-64"
            />
            <button onClick={() => setEditing(emptyProduct)} className="btn-primary shrink-0 px-5">
              <IconPlus width={18} height={18} /> Nouveau
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-faint">
              <tr>
                <th className="py-3 pr-4">Produit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Badge</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {products.map((product) => (
                <tr key={product.id} className="align-middle">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{product.name}</p>
                        <p className="text-xs text-faint">{product.brand} · {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted">
                    <div>
                      <span>{product.type}</span>
                      {(['resistance', 'cartouches', 'cartouches-xros'].includes(product.category) ||
                        /\b(r[eé]sistances?|cartouches?|coils?)\b/i.test(product.name || '')) && (
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSave({ ...toFormProduct(product), category: 'resistance', type: 'Résistance' })}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                              product.category === 'resistance'
                                ? 'bg-neon text-noir shadow-sm'
                                : 'bg-white/10 text-ash hover:bg-white/20 hover:text-white'
                            }`}
                            title="Classer en Résistance"
                          >
                            ⚡ Résistance
                          </button>
                          <button
                            type="button"
                            onClick={() => onSave({ ...toFormProduct(product), category: 'cartouches', type: 'Cartouche' })}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                              ['cartouches', 'cartouches-xros'].includes(product.category)
                                ? 'bg-neon text-noir shadow-sm'
                                : 'bg-white/10 text-ash hover:bg-white/20 hover:text-white'
                            }`}
                            title="Classer en Cartouche"
                          >
                            🧪 Cartouche
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-white">{formatPrice(product.price)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= 10 ? 'bg-amber-400 text-noir' : 'bg-white/10 text-white'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted">{product.badge ? BADGES[product.badge]?.label || product.badge : '-'}</td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(toFormProduct(product))} className="btn-ghost min-h-0 px-4 py-2 text-xs">
                        Modifier
                      </button>
                      <button onClick={() => onDelete(product)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-faint hover:border-rose-400/40 hover:text-rose-400" aria-label="Supprimer">
                        <IconTrash width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <EmptyState title="Aucun produit trouvé" text="Ajustez la recherche ou créez un nouveau produit." />}
        </div>
      </section>

      <ProductEditor
        key={editing?.id || 'new-product'}
        product={editing}
        catalogMeta={catalogMeta}
        products={allProducts}
        onCancel={() => setEditing(null)}
        onSave={onSave}
      />
    </div>
  )
}

function ProductEditor({ product, catalogMeta, products, onCancel, onSave }) {
  const [form, setForm] = useState(product || emptyProduct)

  useEffect(() => setForm(product || emptyProduct), [product])

  if (!product) {
    return (
      <aside className="card grid min-h-[520px] place-items-center p-8 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
            <IconPlus />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-white">Sélectionnez un produit</h2>
          <p className="mt-2 text-sm text-muted">Modifiez une fiche existante ou créez une nouvelle référence.</p>
        </div>
      </aside>
    )
  }

  const isExisting = Boolean(product.id)

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const updateCategory = (e) => {
    const category = e.target.value
    setForm((prev) => {
      if (category !== 'diy') return { ...prev, category }
      return {
        ...prev,
        category,
        type: prev.type === emptyProduct.type ? DIY_PRODUCT_DEFAULTS.type : prev.type,
        nicotine: prev.nicotine === emptyProduct.nicotine ? DIY_PRODUCT_DEFAULTS.nicotine : prev.nicotine,
        specsText: prev.specsText === emptyProduct.specsText ? DIY_PRODUCT_DEFAULTS.specsText : prev.specsText,
      }
    })
  }
  const submit = (e) => {
    e.preventDefault()
    const imageList = form.images
      ? form.images.split(',').map((image) => image.trim()).filter(Boolean)
      : []
    const image = form.image || imageList[0] || '/products/product-placeholder.svg'
    onSave({
      ...form,
      originalId: isExisting ? product.id : '',
      image,
      images: imageList.length ? imageList : [image],
      oldPrice: form.oldPrice || null,
      badge: form.badge || null,
      relatedProductIds: normalizeRelatedProductIds(form.relatedProductIds, form.id),
      specs: parseSpecs(form.specsText),
    })
  }

  return (
    <aside className="card min-w-0 sticky top-24 self-start p-5 sm:p-6">
      <form onSubmit={submit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Fiche produit</p>
            <h2 className="font-display text-xl font-bold text-white">{form.id ? 'Modifier' : 'Créer'}</h2>
          </div>
          <button type="button" onClick={onCancel} className="text-faint hover:text-white" aria-label="Fermer">
            <IconClose />
          </button>
        </div>

        <div className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto pr-1">
          <Field label="Nom" value={form.name} onChange={update('name')} required />
          <Field
            label="Identifiant URL"
            value={form.id}
            onChange={update('id')}
            placeholder="auto si vide"
            pattern="[A-Za-z0-9]([A-Za-z0-9._-]{0,158}[A-Za-z0-9])?"
            maxLength={160}
            readOnly={isExisting}
            title="Commence et finit par une lettre ou un chiffre; lettres sans accent, chiffres, points, tirets et underscores uniquement"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marque" value={form.brand} onChange={update('brand')} list="brands" required />
            <Field label="Type" value={form.type} onChange={update('type')} list="types" required />
          </div>
          <datalist id="brands">{catalogMeta.brands.map((brand) => <option key={brand} value={brand} />)}</datalist>
          <datalist id="types">{catalogMeta.types.map((type) => <option key={type} value={type} />)}</datalist>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Catégorie</span>
            <select value={form.category} onChange={updateCategory} className="input">
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category.key} value={category.key}>{category.name}</option>
              ))}
            </select>
          </label>

          {(['resistance', 'cartouches', 'cartouches-xros'].includes(form.category) ||
            /\b(r[eé]sistances?|cartouches?|coils?)\b/i.test(form.name || '')) && (
            <div className="rounded-2xl border border-neon/30 bg-neon/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neon">Classement Consommable</span>
                <span className="text-[10px] text-muted font-mono">{form.category}</span>
              </div>
              <p className="text-xs text-ash/80">Classer ce produit comme Résistance ou Cartouche :</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: 'resistance', type: 'Résistance' }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    form.category === 'resistance'
                      ? 'border-neon bg-neon text-noir font-extrabold shadow-glow'
                      : 'border-white/10 bg-white/5 text-ash hover:border-white/20 hover:text-white'
                  }`}
                >
                  ⚡ Résistance
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: 'cartouches', type: 'Cartouche' }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    ['cartouches', 'cartouches-xros'].includes(form.category)
                      ? 'border-neon bg-neon text-noir font-extrabold shadow-glow'
                      : 'border-white/10 bg-white/5 text-ash hover:border-white/20 hover:text-white'
                  }`}
                >
                  🧪 Cartouche
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="Prix" type="number" step="0.01" min="0" value={form.price} onChange={update('price')} required />
            <Field label="Ancien prix" type="number" step="0.01" min="0" value={form.oldPrice} onChange={update('oldPrice')} />
            <Field label="Stock" type="number" min="0" value={form.stock} onChange={update('stock')} required />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Badge</span>
            <select value={form.badge} onChange={update('badge')} className="input">
              <option value="">Aucun</option>
              {Object.entries(BADGES).map(([key, badge]) => (
                <option key={key} value={key}>{badge.label}</option>
              ))}
            </select>
          </label>
          <p className="-mt-2 text-xs leading-relaxed text-muted">
            La nouveauté créée le plus récemment utilise automatiquement son image principale en haut de l’accueil.
          </p>

          <RelatedProductsPicker
            products={products}
            currentProductId={form.id}
            value={form.relatedProductIds}
            onChange={(relatedProductIds) => setForm((prev) => ({ ...prev, relatedProductIds }))}
          />

          <ImageUploader
            value={form.image}
            onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            productId={form.id}
            productName={form.name}
          />
          <GalleryUploader
            value={form.images}
            onChange={(urls) => setForm((prev) => ({ ...prev, images: urls }))}
            productId={form.id}
            productName={form.name}
          />
          <Field label="Nicotine (mg/ml, si applicable)" value={form.nicotine} onChange={update('nicotine')} placeholder="20 pour un booster, vide sinon" />
          <Field label="Saveurs" value={form.flavors} onChange={update('flavors')} placeholder="Menthe, Classic, Fruits rouges" />
          <Field label="Couleurs" value={form.colors} onChange={update('colors')} placeholder="Noir, Argent, Bleu" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Volume / contenance" value={form.volume || ''} onChange={update('volume')} list="volumes" placeholder="10ml, 200ml, 1L…" />
            <datalist id="volumes">
              {['10ml', '30ml', '50ml', '100ml', '200ml', '500ml', '1L'].map((volume) => <option key={volume} value={volume} />)}
            </datalist>
            <Field label="Ohm (résistance)" value={form.ohm || ''} onChange={update('ohm')} placeholder="0.8Ω, 1.2Ω…" />
          </div>
          <Field
            label="Valeurs Ohm sélectionnables (résistance)"
            value={form.ohmOptions || ''}
            onChange={update('ohmOptions')}
            placeholder="0.15, 0.2, 0.3, 0.45, 0.6"
          />
          <p className="-mt-2 text-xs text-muted">
            Séparez par des virgules. Renseigné = le client choisit sa valeur Ω sur la fiche (comme le taux de nicotine).
          </p>
          <TextArea label="Résumé court" value={form.short} onChange={update('short')} rows={3} required />
          <TextArea label="Description longue" value={form.long} onChange={update('long')} rows={5} />
          <TextArea label="Caractéristiques" value={form.specsText} onChange={update('specsText')} rows={4} />
        </div>

        <button type="submit" className="btn-primary mt-5 w-full">
          <IconCheck width={18} height={18} /> Enregistrer le produit
        </button>
      </form>
    </aside>
  )
}

function OrdersPanel({
  orders,
  updateOrderStatus,
  markShipped,
  cancelOrder,
  adminSession,
  refreshRemoteData,
  mondialRelayStatus,
}) {
  const reviewRequiredCount = orders.filter((order) => order.checkoutReviewRequiredAt).length
  return (
    <section className="card mt-8 p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Ventes</p>
          <h2 className="font-display text-xl font-bold text-white">{orders.length} commande{orders.length > 1 ? 's' : ''}</h2>
        </div>
      </div>

      {reviewRequiredCount > 0 && (
        <p role="alert" className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {reviewRequiredCount} commande{reviewRequiredCount > 1 ? 's nécessitent' : ' nécessite'} une vérification Mollie avant de libérer le stock.
        </p>
      )}

      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-white">{order.id}</h3>
                    <span className="rounded-full bg-neon/10 px-3 py-1 text-xs font-semibold text-neon">
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {order.customer?.name || 'Client'} · {order.customer?.email || 'email non renseigné'}
                    {order.customer?.phone ? ` · ${order.customer.phone}` : ''} · {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {formatOrderDelivery(order)}
                  </p>
                  {order.refundStatus && (
                    <p className="mt-2 text-xs text-amber-200">
                      Remboursement Mollie : {refundStatusLabel[order.refundStatus] || order.refundStatus}
                      {order.refundId ? ` · ${order.refundId}` : ''}
                    </p>
                  )}
                  {order.refundError && (
                    <p role="alert" className="mt-2 max-w-2xl rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                      Échec du remboursement : {order.refundError}
                    </p>
                  )}
                  {order.checkoutReviewRequiredAt && (
                    <p role="alert" className="mt-2 max-w-2xl rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                      Vérification Mollie requise : {checkoutReviewReasonLabel[order.checkoutReviewReason] || 'dossier financier ambigu'}.
                      {order.checkoutReviewReason === 'multiple_payments_for_order'
                        ? ' Toute transition automatique est bloquée : vérifiez et réconciliez chacun des paiements dans Mollie avant de traiter la commande.'
                        : order.checkoutReviewReason === 'payment_chargeback_detected'
                          ? ' Tout traitement automatique (remise, annulation ou remboursement) est bloqué : traitez d’abord le litige directement dans Mollie, puis réconciliez la commande manuellement.'
                        : ' Toute remise au client est bloquée ; utilisez l’action de synchronisation ou d’annulation/remboursement ci-dessous.'}
                    </p>
                  )}
                  {typeof order.address?.deliveryInstructions === 'string' && order.address.deliveryInstructions.trim() && (
                    <div className="mt-3 max-w-2xl rounded-xl border border-neon/20 bg-neon/5 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neon">Instructions client</p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white">
                        {order.address.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="input w-48"
                    disabled={
                      !MANUAL_FULFILLMENT_STATUSES.has(order.status)
                      || Boolean(order.checkoutReviewRequiredAt)
                    }
                    aria-label={`Statut de la commande ${order.id}`}
                  >
                    {MANUAL_FULFILLMENT_STATUSES.has(order.status) ? (
                      ORDER_STATUSES.filter((status) => (
                        status.value === order.status || status.value === 'delivered'
                      )).map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))
                    ) : (
                      <option value={order.status}>{statusLabel[order.status] || order.status}</option>
                    )}
                  </select>
                  <p className="font-display text-xl font-bold text-white">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}-${JSON.stringify(item.variant)}`} className="flex items-center gap-3 rounded-xl border border-white/8 bg-noir/30 p-3">
                    <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-faint">x{item.qty} · {variantLabel(item.variant)}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <dl className="mt-4 grid gap-2 border-t border-white/8 pt-4 text-sm sm:grid-cols-4">
                <MiniTotal label="Sous-total" value={formatPrice(order.subtotal)} />
                <MiniTotal label="Remise" value={order.discount ? `- ${formatPrice(order.discount)}` : '-'} accent={order.discount > 0} />
                <MiniTotal label="Livraison" value={order.shippingCost === 0 ? 'Offerte' : formatPrice(order.shippingCost)} />
                <MiniTotal label="Paiement" value={order.paymentStatus === 'paid' ? 'Payé' : order.paymentStatus} />
              </dl>

              {adminSession
                && order.paymentStatus === 'paid'
                && order.shipping?.id !== 'pickup'
                && !order.checkoutReviewRequiredAt
                && ['processing', 'shipped'].includes(order.status) && (
                <MondialRelayControl
                  order={order}
                  adminSession={adminSession}
                  refreshRemoteData={refreshRemoteData}
                  status={mondialRelayStatus}
                />
              )}

              {order.paymentStatus === 'paid'
                && !order.checkoutReviewRequiredAt
                && ['processing', 'ready_for_pickup', 'shipped'].includes(order.status) && (
                <ShipControl order={order} markShipped={markShipped} />
              )}

              {cancelOrder
                && !['multiple_payments_for_order', 'payment_chargeback_detected'].includes(order.checkoutReviewReason)
                && ['pending_payment', 'processing', 'ready_for_pickup', 'stock_issue', 'refund_pending', 'refund_failed'].includes(order.status) && (
                <CancelOrderControl order={order} cancelOrder={cancelOrder} />
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Aucune vente enregistrée" text="Passez une commande depuis le checkout pour alimenter ce tableau." />
      )}
    </section>
  )
}

function CancelOrderControl({ order, cancelOrder }) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const isPaid = order.paymentStatus === 'paid'
  const isRefundPending = order.status === 'refund_pending'
  const isRefundRetry = order.status === 'refund_failed'

  const submit = async () => {
    if (loading) return
    let reason = 'Synchronisation manuelle du remboursement en cours'
    if (!isRefundPending) {
      reason = window.prompt(
        isPaid
          ? 'Motif du remboursement (visible dans le suivi interne) :'
          : 'Motif de l’annulation (visible dans le suivi interne) :',
      )
      if (reason == null) return
    }
    const confirmed = window.confirm(
      isRefundPending
        ? 'Vérifier maintenant l’état du remboursement chez Mollie ?'
        : isRefundRetry
        ? 'Confirmer une nouvelle tentative de remboursement intégral chez Mollie ?'
        : isPaid
        ? 'Confirmer l’annulation et demander le remboursement intégral chez Mollie ?'
        : 'Confirmer l’annulation de cette commande ?',
    )
    if (!confirmed) return

    setLoading(true)
    setFeedback(null)
    try {
      const result = await cancelOrder(order.id, reason.trim())
      const action = String(result.action || '')
      setFeedback({
        ok: true,
        message: ['refunded', 'already_refunded'].includes(action)
          ? 'Remboursement intégral confirmé par Mollie.'
          : action.startsWith('refund_')
            ? 'Remboursement demandé. Son statut sera synchronisé automatiquement.'
            : 'Commande annulée.',
      })
    } catch (error) {
      setFeedback({ ok: false, message: error.message || 'Annulation impossible.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {isRefundPending
              ? 'Suivi du remboursement'
              : isRefundRetry ? 'Réessayer le remboursement' : 'Annulation contrôlée'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {isRefundPending
              ? 'Relit l’état Mollie et reprend la même tentative idempotente sans créer un second remboursement.'
              : isRefundRetry
              ? 'Lance une nouvelle tentative idempotente. Après trois échecs, vérifiez et traitez le dossier dans Mollie.'
              : isPaid
              ? 'Déclenche un remboursement intégral Mollie et suit son résultat sans modifier le statut à la main.'
              : 'Annule le paiement en attente et libère les réservations associées.'}
          </p>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="btn shrink-0 border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
        >
          {loading
            ? 'Traitement…'
            : isRefundPending
              ? 'Vérifier maintenant'
              : isRefundRetry
              ? 'Réessayer le remboursement'
              : isPaid
                ? 'Annuler et rembourser'
                : 'Annuler la commande'}
        </button>
      </div>
      {feedback && (
        <p role="status" className={`mt-3 text-xs ${feedback.ok ? 'text-neon' : 'text-rose-300'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  )
}

function MondialRelayControl({ order, adminSession, refreshRemoteData, status }) {
  const saved = order.shipping?.mondialRelay || {}
  const [weightGrams, setWeightGrams] = useState(saved.weightGrams || 1000)
  const [deliveryMode, setDeliveryMode] = useState(saved.deliveryMode || '24R')
  const [relayId, setRelayId] = useState(saved.relayId || '')
  const [points, setPoints] = useState([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [createdLabel, setCreatedLabel] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setWeightGrams(saved.weightGrams || 1000)
    setDeliveryMode(saved.deliveryMode || '24R')
    setRelayId(saved.relayId || '')
  }, [saved.deliveryMode, saved.relayId, saved.weightGrams])

  const labelUrl = createdLabel?.labelUrl || saved.labelUrl || ''
  const shipmentNumber = createdLabel?.shipmentNumber || saved.shipmentNumber || order.shipping?.tracking || ''
  const api1Configured = Boolean(status?.api1?.configured)
  const api2Configured = Boolean(status?.api2?.configured)
  const canCreate = order.status === 'processing' && !labelUrl

  const apiCall = async (path, body) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSession.access_token}`,
      },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload.error) {
      const error = new Error(payload.error || 'Action Mondial Relay impossible.')
      error.payload = payload
      throw error
    }
    return payload
  }

  const searchPoints = async () => {
    if (searching) return
    setSearching(true)
    setFeedback(null)
    try {
      const payload = await apiCall('/api/mondial-relay?action=relay-points', {
        postcode: order.address?.zip,
        weightGrams,
      })
      setPoints(payload.points || [])
      setFeedback({
        ok: true,
        message: payload.points?.length
          ? `${payload.points.length} Point${payload.points.length > 1 ? 's' : ''} Relais ou Locker trouvé${payload.points.length > 1 ? 's' : ''}.`
          : 'Aucun Point Relais disponible autour de cette adresse.',
      })
    } catch (error) {
      setFeedback({ ok: false, message: error.message })
    } finally {
      setSearching(false)
    }
  }

  const createLabel = async () => {
    if (creating) return
    if (!window.confirm(
      'Créer cette expédition réelle dans Mondial Relay ? Vérifiez le poids, le mode de livraison et le Point Relais avant de continuer.',
    )) return
    setCreating(true)
    setFeedback(null)
    try {
      const payload = await apiCall('/api/mondial-relay?action=create-label', {
        orderId: order.id,
        weightGrams,
        deliveryMode,
        relayId,
      })
      setCreatedLabel({ labelUrl: payload.labelUrl, shipmentNumber: payload.shipmentNumber })
      setFeedback({
        ok: true,
        message: payload.reused
          ? 'L’étiquette existante a été récupérée sans créer de doublon.'
          : 'Expédition créée. Le numéro de suivi est prêt et le PDF peut être imprimé.',
      })
      await refreshRemoteData()
    } catch (error) {
      if (error.payload?.recoveryRequired && error.payload?.labelUrl) {
        setCreatedLabel({
          labelUrl: error.payload.labelUrl,
          shipmentNumber: error.payload.shipmentNumber,
        })
      }
      setFeedback({ ok: false, message: error.message })
    } finally {
      setCreating(false)
    }
  }

  const loadTracking = async () => {
    if (trackingLoading || !shipmentNumber) return
    setTrackingLoading(true)
    setFeedback(null)
    try {
      const payload = await apiCall('/api/mondial-relay?action=tracking', { shipmentNumber })
      setTrackingData(payload)
      setFeedback({ ok: true, message: payload.summary || 'Suivi Mondial Relay actualisé.' })
    } catch (error) {
      setFeedback({ ok: false, message: error.message })
    } finally {
      setTrackingLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Mondial Relay</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Recherche Point Relais via API 1 · création et PDF 10 × 15 via API 2.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className={`rounded-full border px-2.5 py-1 ${api1Configured ? 'border-neon/30 text-neon' : 'border-amber-300/30 text-amber-200'}`}>
            API 1 {api1Configured ? 'connectée' : 'à configurer'}
          </span>
          <span className={`rounded-full border px-2.5 py-1 ${api2Configured ? 'border-neon/30 text-neon' : 'border-amber-300/30 text-amber-200'}`}>
            API 2 {api2Configured ? status?.api2?.environment : 'à configurer'}
          </span>
        </div>
      </div>

      {labelUrl ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-neon/20 bg-neon/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Expédition {shipmentNumber}</p>
            <p className="mt-1 text-xs text-muted">
              {saved.deliveryMode === '24R' && saved.relayId ? `Point Relais ${saved.relayId} · ` : ''}
              {saved.weightGrams ? `${saved.weightGrams} g` : 'Poids enregistré'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={labelUrl} target="_blank" rel="noreferrer" className="btn-primary shrink-0">
              Télécharger le PDF
            </a>
            <button type="button" onClick={loadTracking} disabled={trackingLoading || !api1Configured} className="btn-ghost shrink-0 disabled:opacity-50">
              {trackingLoading ? 'Actualisation…' : 'Actualiser le suivi'}
            </button>
          </div>
        </div>
      ) : canCreate ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Poids du colis (g)</span>
              <input
                type="number"
                min="10"
                max="30000"
                step="10"
                value={weightGrams}
                onChange={(event) => setWeightGrams(event.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Mode Mondial Relay</span>
              <select
                value={deliveryMode}
                onChange={(event) => {
                  setDeliveryMode(event.target.value)
                  setFeedback(null)
                }}
                className="input"
              >
                <option value="24R">Point Relais / Locker</option>
                <option value="HOM">Domicile (si prévu au contrat)</option>
              </select>
            </label>
            {deliveryMode === '24R' && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Code Point Relais</span>
                <input
                  value={relayId}
                  onChange={(event) => setRelayId(event.target.value.toUpperCase())}
                  placeholder="FR-12345"
                  className="input"
                />
              </label>
            )}
          </div>

          {deliveryMode === '24R' && (
            <div className="mt-3">
              <button type="button" onClick={searchPoints} disabled={searching || !api1Configured} className="btn-ghost disabled:opacity-50">
                {searching ? 'Recherche…' : `Rechercher autour de ${order.address?.zip || 'l’adresse'}`}
              </button>
              {!api1Configured && (
                <p className="mt-2 text-xs text-amber-200">Configure l’API 1 ou saisis manuellement le code du Point Relais choisi avec le client.</p>
              )}
              {points.length > 0 && (
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {points.map((point) => (
                    <label
                      key={point.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${relayId === point.id ? 'border-neon/50 bg-neon/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}
                    >
                      <input
                        type="radio"
                        name={`mondial-relay-${order.id}`}
                        value={point.id}
                        checked={relayId === point.id}
                        onChange={() => setRelayId(point.id)}
                        className="mt-1 accent-emerald-400"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{point.name || point.id}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {[point.address, point.postcode, point.city].filter(Boolean).join(' · ')}
                          {point.distanceMeters ? ` · ${point.distanceMeters < 1000 ? `${point.distanceMeters} m` : `${(point.distanceMeters / 1000).toFixed(1)} km`}` : ''}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-amber-100/80">
                Le checkout actuel n’enregistre pas encore le choix du client : confirme le Point Relais avec lui avant de créer l’expédition.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={createLabel}
            disabled={creating || !api2Configured || (deliveryMode === '24R' && !relayId)}
            className="btn-primary mt-4 disabled:opacity-50"
          >
            {creating ? 'Création en cours…' : 'Créer l’expédition & le PDF'}
          </button>
          {!api2Configured && (
            <p className="mt-2 text-xs text-amber-200">Les identifiants API 2 sont requis pour activer ce bouton.</p>
          )}
        </>
      ) : (
        <p className="mt-4 text-xs text-muted">La commande est déjà expédiée sans étiquette Mondial Relay enregistrée.</p>
      )}

      {trackingData?.events?.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-noir/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">Derniers événements</p>
          <ol className="mt-3 space-y-2">
            {trackingData.events.slice(0, 5).map((event, index) => (
              <li key={`${event.date}-${event.time}-${index}`} className="text-xs text-muted">
                <strong className="text-white">{event.label || 'Mise à jour'}</strong>
                {[event.date, event.time, event.location].filter(Boolean).length > 0
                  ? ` · ${[event.date, event.time, event.location].filter(Boolean).join(' · ')}`
                  : ''}
              </li>
            ))}
          </ol>
        </div>
      )}

      {feedback && (
        <p role="status" className={`mt-3 text-xs ${feedback.ok ? 'text-neon' : 'text-rose-300'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  )
}

// Expédition avec suivi, ou notification distincte de mise à disposition pour
// le retrait boutique. Le statut retourné par le serveur reste la source de vérité.
function ShipControl({ order, markShipped }) {
  const isPickup = order.shipping?.id === 'pickup'
  const [tracking, setTracking] = useState(order.shipping?.tracking || '')
  const [carrier, setCarrier] = useState(order.shipping?.carrier || '')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setTracking(order.shipping?.tracking || '')
    setCarrier(order.shipping?.carrier || '')
  }, [order.shipping?.carrier, order.shipping?.tracking])

  const notified = isPickup
    ? ['ready_for_pickup', 'delivered'].includes(order.status)
    : ['shipped', 'delivered'].includes(order.status)

  const submit = async () => {
    if (loading) return
    setFeedback(null)
    setLoading(true)
    try {
      const result = await markShipped(order.id, { tracking: tracking.trim(), carrier: carrier.trim() })
      if (result.emailSent) {
        setFeedback({
          ok: true,
          message: isPickup
            ? 'Commande prête au retrait — e-mail envoyé au client.'
            : 'Commande expédiée — e-mail envoyé au client.',
        })
      } else if (result.emailAlreadySent) {
        setFeedback({
          ok: true,
          message: isPickup
            ? 'Commande prête au retrait — l’e-mail avait déjà été envoyé.'
            : 'Commande expédiée — l’e-mail avait déjà été envoyé.',
        })
      } else {
        setFeedback({
          ok: false,
          message: isPickup
            ? 'Commande enregistrée comme prête, mais l’e-mail n’est pas parti. Réessayez avec « Renvoyer l’e-mail ».'
            : 'Commande enregistrée comme expédiée, mais l’e-mail n’est pas parti. Réessayez avec « Renvoyer le suivi ».',
        })
      }
    } catch (err) {
      setFeedback({ ok: false, message: err.message || 'Échec de l’envoi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/8 bg-noir/30 p-4 sm:flex-row sm:items-end">
      {isPickup ? (
        <div className="flex-1 text-xs leading-relaxed text-muted">
          Prévenez le client lorsque sa commande est disponible au 188 rue de Rome, Marseille.
        </div>
      ) : (
        <>
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-medium text-muted">N° de suivi</span>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ex : 6A12345678901" className="input" />
          </label>
          <label className="block sm:w-40">
            <span className="mb-1.5 block text-xs font-medium text-muted">Transporteur</span>
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Colissimo, Mondial Relay…" className="input" />
          </label>
        </>
      )}
      <button onClick={submit} disabled={loading} className="btn-primary shrink-0 disabled:opacity-60">
        {loading
          ? 'Envoi…'
          : notified
            ? isPickup ? 'Renvoyer l’e-mail' : 'Renvoyer le suivi'
            : isPickup ? 'Marquer prête & notifier' : 'Marquer expédiée & notifier'}
      </button>
      {feedback && (
        <p className={`text-xs ${feedback.ok ? 'text-neon' : 'text-rose-400'} sm:ml-2 sm:self-center`}>{feedback.message}</p>
      )}
    </div>
  )
}

function SettingsPanel({
  products,
  orders,
  resetProducts,
  clearAllProducts,
  setTab,
  supabaseEnabled,
  adminSession,
  mondialRelayStatus,
  mondialRelayStatusError,
}) {
  const catalogIssues = useMemo(() => findCatalogIssues(products), [products])
  const [testingMondialRelay, setTestingMondialRelay] = useState(false)
  const [mondialRelayTest, setMondialRelayTest] = useState(null)

  const testMondialRelayApi1 = async () => {
    if (!adminSession?.access_token || testingMondialRelay) return
    setTestingMondialRelay(true)
    setMondialRelayTest(null)
    try {
      const response = await fetch('/api/mondial-relay?action=relay-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.access_token}`,
        },
        body: JSON.stringify({ postcode: '13006', weightGrams: 1000 }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload.error) throw new Error(payload.error || 'Test API 1 impossible.')
      setMondialRelayTest({
        ok: true,
        message: `Connexion confirmée : ${payload.points?.length || 0} Point${payload.points?.length > 1 ? 's' : ''} Relais trouvé${payload.points?.length > 1 ? 's' : ''} autour du 13006.`,
      })
    } catch (error) {
      setMondialRelayTest({ ok: false, message: error.message || 'Test API 1 impossible.' })
    } finally {
      setTestingMondialRelay(false)
    }
  }

  const exportData = () => {
    const payload = JSON.stringify({ products, orders, exportedAt: new Date().toISOString() }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `theklope-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <section className="card border-fuchsia-400/25 bg-fuchsia-500/5 p-6 lg:col-span-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow mb-2">Transport</p>
            <h2 className="font-display text-xl font-bold text-white">Mondial Relay</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              L’API 1 recherche les Points Relais et consulte le suivi. L’API 2 crée les expéditions réelles et fournit l’étiquette PDF 10 × 15 depuis chaque commande payée.
            </p>
          </div>
          <div className="grid min-w-64 gap-2 sm:grid-cols-2">
            <ConnectionBadge label="API 1 · Recherche/suivi" ready={mondialRelayStatus?.api1?.configured} loading={!mondialRelayStatus && !mondialRelayStatusError} />
            <ConnectionBadge
              label={`API 2 · Étiquettes${mondialRelayStatus?.api2?.environment ? ` (${mondialRelayStatus.api2.environment})` : ''}`}
              ready={mondialRelayStatus?.api2?.configured}
              loading={!mondialRelayStatus && !mondialRelayStatusError}
            />
          </div>
        </div>
        {mondialRelayStatus?.sender && (
          <p className="mt-4 text-xs text-faint">
            Expéditeur : {mondialRelayStatus.sender.name} · {mondialRelayStatus.sender.postcode} {mondialRelayStatus.sender.city}
          </p>
        )}
        {mondialRelayStatusError && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
            {mondialRelayStatusError}
          </p>
        )}
        {!mondialRelayStatus?.api2?.configured && mondialRelayStatus && (
          <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
            API 2 inactive : dans Connect Mondial Relay, génère les identifiants d’API puis ajoute-les aux secrets serveur. Aucune clé ne doit être préfixée par VITE_ ni envoyée au navigateur.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={testMondialRelayApi1}
            disabled={testingMondialRelay || !mondialRelayStatus?.api1?.configured}
            className="btn-ghost disabled:opacity-50"
          >
            {testingMondialRelay ? 'Test en cours…' : 'Tester la recherche API 1'}
          </button>
          <button type="button" onClick={() => setTab('orders')} className="btn-primary">
            Ouvrir les commandes
          </button>
          {mondialRelayTest && (
            <span role="status" className={`text-xs ${mondialRelayTest.ok ? 'text-neon' : 'text-rose-300'}`}>
              {mondialRelayTest.message}
            </span>
          )}
        </div>
      </section>

      <section className={`card p-6 lg:col-span-3 ${catalogIssues.length ? 'border-rose-400/25 bg-rose-500/5' : 'border-neon/20 bg-neon/5'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Qualité des données</p>
            <h2 className="font-display text-xl font-bold text-white">
              {catalogIssues.length
                ? `${catalogIssues.length} anomalie${catalogIssues.length > 1 ? 's' : ''} à corriger`
                : 'Catalogue cohérent'}
            </h2>
          </div>
          <span className={`chip ${catalogIssues.length ? 'border-rose-400/30 text-rose-300' : 'border-neon/30 text-neon'}`}>
            {products.length} références contrôlées
          </span>
        </div>
        {catalogIssues.length ? (
          <ul className="mt-4 grid gap-2 text-sm text-rose-100/80 md:grid-cols-2">
            {catalogIssues.slice(0, 8).map((issue, index) => (
              <li key={`${issue.code}-${issue.productIds.join('-')}-${index}`} className="rounded-xl border border-rose-400/15 bg-noir/20 px-4 py-3">
                {issue.message}
              </li>
            ))}
            {catalogIssues.length > 8 && (
              <li className="px-4 py-3 text-muted">+ {catalogIssues.length - 8} autre(s) anomalie(s)</li>
            )}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Identifiants, prix actifs, volumes, catégories et doublons ont été vérifiés.</p>
        )}
      </section>

      <section className="card p-6 lg:col-span-2">
        <p className="eyebrow mb-2">Pilotage</p>
        <h2 className="font-display text-xl font-bold text-white">Actions rapides</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button onClick={() => setTab('products')} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-neon/40">
            <IconPlus className="mb-4 text-neon" />
            <p className="font-semibold text-white">Créer une référence</p>
            <p className="mt-1 text-sm text-muted">Ajoutez un produit et publiez-le instantanément dans la boutique.</p>
          </button>
          <button onClick={exportData} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-neon/40">
            <IconArrowRight className="mb-4 text-neon" />
            <p className="font-semibold text-white">Exporter les données</p>
            <p className="mt-1 text-sm text-muted">Téléchargez le catalogue et les commandes au format JSON.</p>
          </button>
        </div>
      </section>

      <section className="card p-6">
        <p className="eyebrow mb-2">Maintenance</p>
        <h2 className="font-display text-xl font-bold text-white">Catalogue</h2>
        <p className="mt-3 text-sm text-muted">
          Le catalogue {supabaseEnabled ? 'Supabase' : 'local'} contient {products.length} produits.
        </p>
        {supabaseEnabled ? (
          <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">
            Les actions globales sont désactivées sur le catalogue live. Modifiez les références une par une ou utilisez une migration contrôlée afin de préserver prix, stock et historique.
          </div>
        ) : (
          <>
            <button
              onClick={() => window.confirm('Restaurer le catalogue local de développement ?') && resetProducts()}
              className="btn-ghost mt-5 w-full"
            >
              Restaurer le catalogue local
            </button>
            <button
              onClick={() => window.confirm('Supprimer tous les produits du catalogue local ?') && clearAllProducts()}
              className="btn mt-3 w-full border border-rose-500/30 bg-rose-500/10 text-rose-400 transition-all duration-300 hover:border-rose-400/50 hover:bg-rose-500/20 active:scale-[0.97]"
            >
              Vider le catalogue local
            </button>
          </>
        )}
      </section>

      <section className="card border-amber-400/20 bg-amber-400/5 p-6 lg:col-span-3">
        <p className="text-sm leading-relaxed text-muted">
          <strong className="text-ash/90">Avant production :</strong> {supabaseEnabled ? 'le catalogue et les commandes sont connectés à Supabase.' : 'cet admin persiste en local dans le navigateur.'}
          Le paiement Mollie est branché ; pensez aux e-mails transactionnels, aux factures, à la vérification d’âge renforcée
          et à la conformité légale complète.
        </p>
      </section>
    </div>
  )
}

function ConnectionBadge({ label, ready, loading }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${loading ? 'border-white/10 bg-white/[0.03]' : ready ? 'border-neon/25 bg-neon/5' : 'border-amber-300/25 bg-amber-300/5'}`}>
      <p className="text-[11px] font-semibold text-white">{label}</p>
      <p className={`mt-0.5 text-[11px] ${loading ? 'text-muted' : ready ? 'text-neon' : 'text-amber-200'}`}>
        {loading ? 'Vérification…' : ready ? 'Configurée' : 'Non configurée'}
      </p>
    </div>
  )
}

function StatCard({ label, value, detail }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  )
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input className="input" {...props} />
    </label>
  )
}

function TextArea({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <textarea className="input min-h-24 resize-y" {...props} />
    </label>
  )
}

function MiniTotal({ label, value, accent }) {
  return (
    <div className="flex justify-between rounded-xl bg-white/[0.03] px-3 py-2">
      <dt className="text-faint">{label}</dt>
      <dd className={accent ? 'font-semibold text-neon' : 'font-semibold text-white'}>{value}</dd>
    </div>
  )
}

function EmptyState({ title, text, compact = false }) {
  return (
    <div className={`grid place-items-center text-center ${compact ? 'py-4' : 'py-14'}`}>
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  )
}

function RelatedProductsPicker({ products, currentProductId, value, onChange }) {
  const [query, setQuery] = useState('')
  const [resultLimit, setResultLimit] = useState(12)
  const selectedIds = normalizeRelatedProductIds(value, currentProductId)
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const matchingProducts = useMemo(
    () => searchRelatedProducts({ products, query, currentProductId, selectedIds }),
    [products, query, currentProductId, selectedIds],
  )
  const results = matchingProducts.slice(0, resultLimit)
  const hasQuery = Boolean(query.trim())

  return (
    <div className="border-y border-white/10 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">Produits associés</span>
        <span className="text-xs font-semibold text-neon">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
      </div>

      <div className="mt-3 space-y-2">
        {selectedIds.map((id) => {
          const selectedProduct = productsById.get(id)
          return (
            <div key={id} className="flex min-w-0 items-center gap-3 border-b border-white/8 pb-2 last:border-b-0 last:pb-0">
              {selectedProduct ? (
                <img src={selectedProduct.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/5 text-xs text-faint">?</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{selectedProduct?.name || id}</p>
                <p className="truncate text-xs text-faint">
                  {selectedProduct ? `${selectedProduct.brand} · ${selectedProduct.type}` : 'Référence introuvable'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(removeRelatedProductId(selectedIds, id, currentProductId))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-faint hover:border-rose-400/40 hover:text-rose-400"
                aria-label={`Retirer ${selectedProduct?.name || id}`}
                title="Retirer"
              >
                <IconTrash width={15} height={15} />
              </button>
            </div>
          )
        })}
        {!selectedIds.length && <p className="py-1 text-sm text-faint">Aucun produit associé.</p>}
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">Rechercher un produit à associer</span>
        <IconSearch width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setResultLimit(12)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault()
          }}
          className="input pl-9"
          placeholder="Rechercher nom, marque ou référence..."
          autoComplete="off"
        />
      </label>

      {hasQuery && (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {results.map((result) => (
            <div key={result.id} className="flex min-w-0 items-center gap-3 border-b border-white/8 pb-2 last:border-b-0 last:pb-0">
              <img src={result.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{result.name}</p>
                <p className="truncate text-xs text-faint">{result.brand} · {result.id}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange(addRelatedProductId(selectedIds, result.id, currentProductId))
                  setQuery('')
                }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neon/30 text-neon hover:bg-neon hover:text-noir"
                aria-label={`Associer ${result.name}`}
                title="Associer"
              >
                <IconPlus width={15} height={15} />
              </button>
            </div>
          ))}
          {!results.length && <p className="py-2 text-sm text-faint">Aucun produit trouvé.</p>}
          {matchingProducts.length > results.length && (
            <button
              type="button"
              onClick={() => setResultLimit((current) => current + 12)}
              className="btn-ghost min-h-0 w-full px-4 py-2 text-xs"
            >
              <IconPlus width={15} height={15} /> Afficher plus
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function toFormProduct(product) {
  return {
    ...product,
    oldPrice: product.oldPrice || '',
    badge: product.badge || '',
    images: (product.images || []).join(', '),
    nicotine: (product.nicotine || []).join(', '),
    flavors: (product.flavors || []).join(', '),
    colors: (product.colors || []).join(', '),
    ohmOptions: (product.ohmOptions || []).join(', '),
    relatedProductIds: normalizeRelatedProductIds(product.relatedProductIds, product.id),
    specsText: Object.entries(product.specs || {}).map(([key, value]) => `${key}: ${value}`).join('\n'),
  }
}

function parseSpecs(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.split(':'))
    .filter(([key, ...rest]) => key?.trim() && rest.join(':').trim())
    .reduce((out, [key, ...rest]) => ({ ...out, [key.trim()]: rest.join(':').trim() }), {})
}

function variantLabel(variant = {}) {
  const parts = []
  if (variant.color) parts.push(variant.color)
  if (variant.flavor) parts.push(variant.flavor)
  if (variant.nicotine != null) parts.push(`${variant.nicotine} mg`)
  if (variant.ohm != null) parts.push(`${variant.ohm} Ω`)
  return parts.length ? parts.join(' · ') : 'Standard'
}

function formatOrderDelivery(order = {}) {
  if (order.shipping?.id === 'pickup') return order.shipping.label || 'Retrait en boutique'
  const city = [order.address?.zip, order.address?.city].filter(Boolean).join(' ')
  const address = [order.address?.street, city].filter(Boolean).join(', ')
  return [address, order.shipping?.label].filter(Boolean).join(' · ') || 'Livraison non renseignée'
}

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function lastSevenDays(orders) {
  const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const next = new Date(date)
    next.setDate(date.getDate() + 1)
    const total = orders
      .filter((order) => {
        const created = new Date(order.createdAt)
        return created >= date && created < next
      })
      .reduce((sum, order) => sum + order.total, 0)
    return {
      key: date.toISOString(),
      label: formatter.format(date),
      total,
    }
  })
}

const EMAIL_TEMPLATE_PREVIEW = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>THEKLOPE Nouveau Site</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;color:#e5e5e5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:30px 10px;">
    <tr><td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#121212;border:1px solid #262626;border-radius:20px;padding:28px;text-align:center;">
        <tr><td>
          <h1 style="color:#fff;font-size:24px;margin:0 0 10px 0;">THE<span style="color:#35FF8A;">KLOPE</span></h1>
          <span style="background:rgba(53,255,138,0.15);border:1px solid #35FF8A;color:#35FF8A;font-size:11px;padding:4px 12px;border-radius:20px;font-weight:700;">🚀 NOUVEAU SITE EN LIGNE</span>
          <h2 style="color:#fff;font-size:20px;margin-top:24px;">Coucou ! Bienvenue sur notre tout nouveau site 🎉</h2>
          <p style="color:#b0b0b0;font-size:14px;line-height:1.6;">Retrouvez toute l'expérience THEKLOPE, une navigation ultra-rapide et vos produits préférés !</p>

          <div style="background:rgba(53,255,138,0.08);border:1px solid rgba(53,255,138,0.3);border-radius:12px;padding:14px;margin:20px 0;">
            <p style="color:#35FF8A;margin:0;font-size:12px;font-weight:bold;text-transform:uppercase;">Code Promo de Bienvenue</p>
            <p style="color:#fff;margin:6px 0 0;font-size:17px;font-weight:bold;">-15% avec le code : <span style="color:#35FF8A;border:1px dashed #35FF8A;padding:2px 8px;border-radius:6px;">BIENVENUE</span></p>
          </div>

          <div style="background:#1a1a1a;border:1px solid #2e2e2e;border-radius:12px;padding:16px;margin-bottom:12px;text-align:left;">
            <p style="color:#35FF8A;margin:0;font-size:11px;font-weight:bold;">FORMAT 10 ML</p>
            <p style="color:#fff;margin:4px 0 0;font-size:16px;font-weight:bold;">E-liquide 10 ml dès <span style="color:#35FF8A;">2.95 €*</span></p>
            <p style="color:#888;margin:4px 0 0;font-size:11px;">* Dès 20 e-liquides achetés (Liquidarom ou Freaks).</p>
          </div>

          <div style="background:#1a1a1a;border:1px solid #2e2e2e;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;">
            <p style="color:#35FF8A;margin:0;font-size:11px;font-weight:bold;">GRAND FORMAT 50 ML</p>
            <p style="color:#fff;margin:4px 0 0;font-size:16px;font-weight:bold;">E-liquide 50 ml dès <span style="color:#35FF8A;">14.92 €*</span></p>
            <p style="color:#888;margin:4px 0 0;font-size:11px;">* Dès 4 e-liquides 50 ml achetés (toutes marques confondues).</p>
          </div>

          <a href="https://www.theklope.com/boutique" target="_blank" style="display:inline-block;background:#35FF8A;color:#0a0a0a;font-weight:bold;padding:14px 28px;border-radius:10px;text-decoration:none;">VOIR LA BOUTIQUE EN LIGNE →</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

function EmailingPanel() {
  const [subject, setSubject] = useState('🎉 Bienvenue sur le nouveau site THEKLOPE ! -15% & Offres e-liquides')
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testError, setTestError] = useState(null)

  const totalClients = 2527

  const handleSendTest = async (e) => {
    e.preventDefault()
    if (!testEmail || !testEmail.includes('@')) {
      setTestError('Veuillez entrer une adresse e-mail de test valide.')
      return
    }
    setSendingTest(true)
    setTestResult(null)
    setTestError(null)

    try {
      const res = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-test',
          to: testEmail,
          subject,
          html: EMAIL_TEMPLATE_PREVIEW,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestResult(`✅ E-mail de test envoyé avec succès à ${testEmail} !`)
      } else {
        setTestError(data.error || "Erreur lors de l'envoi du test.")
      }
    } catch (err) {
      setTestError(err.message || "Erreur lors de l'envoi de test.")
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Gestion de l'Emailing Clients</h2>
          <p className="mt-1 text-sm text-muted">
            Campagne de lancement Nouveau Site — {totalClients} clients inscrits
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/clients_theklope_clean.csv"
            download="clients_theklope_clean.csv"
            className="btn-ghost text-xs"
          >
            📥 Télécharger CSV ({totalClients} clients)
          </a>
          <a
            href="/scripts/email-campaign-nouveau-site.html"
            download="email-campaign-nouveau-site.html"
            className="btn-ghost text-xs"
          >
            📄 Télécharger HTML du mail
          </a>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="eyebrow">Destinataires qualifiés</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{totalClients.toLocaleString('fr-FR')}</p>
          <p className="mt-1 text-xs text-muted">Base clients nettoyée & d'actualité</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Service d'envoi</p>
          <p className="mt-2 text-xl font-bold text-neon">API Resend</p>
          <p className="mt-1 text-xs text-muted">contact@theklope.com</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Offres incluses</p>
          <p className="mt-2 text-sm font-bold text-white">10ml dès 2.95€ · 50ml dès 14.92€</p>
          <p className="mt-1 text-xs text-electric">Code BIENVENUE (-15%)</p>
        </div>
      </div>

      {/* Section Envoi de Test */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-white">1. Envoyer un e-mail de TEST</h3>
        <p className="mt-1 text-xs text-muted">Envoyez d'abord un e-mail de test sur votre propre boîte de réception pour valider le visuel.</p>

        <form onSubmit={handleSendTest} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="votre-email@exemple.com"
            className="flex-1 rounded-xl border border-white/10 bg-carbon px-4 py-2.5 text-sm text-white outline-none focus:border-neon"
            required
          />
          <button type="submit" disabled={sendingTest} className="btn-primary shrink-0 py-2.5">
            {sendingTest ? 'Envoi en cours...' : 'Envoyer e-mail de test'}
          </button>
        </form>

        {testResult && (
          <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            {testResult}
          </div>
        )}
        {testError && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {testError}
          </div>
        )}
      </div>

      {/* Section Aperçu HTML & Objet */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-white">2. Paramètres & Aperçu du mail client</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ash">Objet de l'e-mail (Sujet)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-carbon px-4 py-2.5 text-sm text-white outline-none focus:border-neon"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ash mb-2">Aperçu visuel en temps réel :</label>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2">
              <iframe
                srcDoc={EMAIL_TEMPLATE_PREVIEW}
                title="Aperçu e-mail client"
                className="h-[480px] w-full rounded-xl border-0 bg-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Lancement Global */}
      <div className="card p-6 border-neon/30 bg-neon/5">
        <h3 className="font-display text-lg font-bold text-white">3. Lancement de la campagne à tous les clients ({totalClients})</h3>
        <p className="mt-1 text-xs text-muted">
          Vous pouvez aussi exécuter la commande de diffusion sécurisée par lots dans le terminal avec votre clé Resend :
        </p>

        <div className="mt-4">
          <div className="rounded-xl border border-white/10 bg-carbon p-4 text-xs text-ash space-y-2">
            <p className="font-semibold text-white">Commande d'envoi batch sécurisé Resend :</p>
            <code className="block rounded-lg bg-black/60 p-3 text-neon font-mono select-all overflow-x-auto">
              RESEND_API_KEY="re_votre_cle_resend" node scripts/send-campaign-resend.mjs --send-all
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
