import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, formatPrice, ORDER_STATUSES } from '../context/StoreContext.jsx'
import { CATEGORIES, BADGES } from '../data/catalog.js'
import Seo from '../components/Seo.jsx'
import ImageUploader from '../components/ImageUploader.jsx'
import GalleryUploader from '../components/GalleryUploader.jsx'
import {
  addRelatedProductId,
  normalizeRelatedProductIds,
  removeRelatedProductId,
  searchRelatedProducts,
} from '../lib/relatedProducts.js'
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
        />
      )}
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
  const sales = useMemo(() => lastSevenDays(orders), [orders])
  const maxSales = Math.max(1, ...sales.map((day) => day.total))
  const recentOrders = orders.slice(0, 4)

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
                  <td className="px-4 py-4 text-muted">{product.type}</td>
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

function OrdersPanel({ orders, updateOrderStatus, markShipped }) {
  return (
    <section className="card mt-8 p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Ventes</p>
          <h2 className="font-display text-xl font-bold text-white">{orders.length} commande{orders.length > 1 ? 's' : ''}</h2>
        </div>
      </div>

      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-white">{order.id}</h3>
                    <span className="rounded-full bg-neon/10 px-3 py-1 text-xs font-semibold text-neon">{statusLabel[order.status]}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {order.customer?.name || 'Client'} · {order.customer?.email || 'email non renseigné'}
                    {order.customer?.phone ? ` · ${order.customer.phone}` : ''} · {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {order.address?.street}, {order.address?.zip} {order.address?.city} · {order.shipping?.label}
                  </p>
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
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
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

              {order.paymentStatus === 'paid' && ['processing', 'shipped'].includes(order.status) && (
                <ShipControl order={order} markShipped={markShipped} />
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

// Saisie du numéro de suivi + envoi de l'e-mail « expédiée » au client.
function ShipControl({ order, markShipped }) {
  const [tracking, setTracking] = useState(order.shipping?.tracking || '')
  const [carrier, setCarrier] = useState(order.shipping?.carrier || '')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const shipped = order.status === 'shipped' || order.status === 'delivered'

  const submit = async () => {
    if (loading) return
    setFeedback(null)
    setLoading(true)
    try {
      await markShipped(order.id, { tracking: tracking.trim(), carrier: carrier.trim() })
      setFeedback({ ok: true, message: 'Commande marquée expédiée — e-mail envoyé au client.' })
    } catch (err) {
      setFeedback({ ok: false, message: err.message || 'Échec de l’envoi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/8 bg-noir/30 p-4 sm:flex-row sm:items-end">
      <label className="block flex-1">
        <span className="mb-1.5 block text-xs font-medium text-muted">N° de suivi</span>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ex : 6A12345678901" className="input" />
      </label>
      <label className="block sm:w-40">
        <span className="mb-1.5 block text-xs font-medium text-muted">Transporteur</span>
        <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Colissimo, Mondial Relay…" className="input" />
      </label>
      <button onClick={submit} disabled={loading} className="btn-primary shrink-0 disabled:opacity-60">
        {loading ? 'Envoi…' : shipped ? 'Renvoyer le suivi' : 'Marquer expédiée & notifier'}
      </button>
      {feedback && (
        <p className={`text-xs ${feedback.ok ? 'text-neon' : 'text-rose-400'} sm:ml-2 sm:self-center`}>{feedback.message}</p>
      )}
    </div>
  )
}

function SettingsPanel({ products, orders, resetProducts, clearAllProducts, setTab, supabaseEnabled }) {
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
        <button
          onClick={() => window.confirm('Restaurer le catalogue initial ?') && resetProducts()}
          className="btn-ghost mt-5 w-full"
        >
          Réinitialiser le catalogue par défaut
        </button>
        <button
          onClick={() => window.confirm('⚠️ Supprimer TOUS les produits du catalogue ? Cette action est irréversible.') && clearAllProducts()}
          className="btn bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400/50 mt-3 w-full active:scale-[0.97] transition-all duration-300"
        >
          Tout supprimer du catalogue
        </button>
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
      .filter((order) => order.status !== 'cancelled')
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
