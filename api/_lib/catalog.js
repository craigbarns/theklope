// Récupération des prix produits CÔTÉ SERVEUR.
// Source de vérité : Supabase si configuré (l'admin y édite les prix), sinon le
// catalogue statique en fallback. Sert à recalculer le montant d'une commande
// sans jamais faire confiance aux prix envoyés par le navigateur.
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'
import { resolveVolume } from '../../src/lib/pricing.js'

export function canUseStaticCatalogFallback(env = process.env) {
  const production = env.VERCEL_ENV
    ? env.VERCEL_ENV === 'production'
    : env.NODE_ENV === 'production'
  return !production && env.ALLOW_STATIC_CATALOG_FALLBACK === 'true'
}

export async function getProductsByIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))]
  if (unique.length === 0) return new Map()

  if (hasSupabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id,name,price,image,stock,brand,volume,category,specs,nicotine,flavors,colors,ohm_options')
      .in('id', unique)
    if (error) throw error
    // Volume dérivé de specs.Contenance si le champ volume est vide (sinon les
    // remises dégressives ne tomberaient jamais côté serveur).
    return new Map((data || []).map((p) => [p.id, {
      ...p,
      catalogVolume: p.volume ?? null,
      ohmOptions: p.ohm_options || [],
      volume: resolveVolume(p),
    }]))
  }

  // Never price an order from the bundled snapshot in production: it can lag
  // behind admin edits to prices and stock. Local fixtures require an explicit
  // opt-in so a missing service role cannot silently become a stale checkout.
  if (!canUseStaticCatalogFallback()) {
    throw new Error('Catalogue de paiement indisponible : Supabase serveur requis.')
  }

  // Explicit development/test fallback (dynamically imported to keep the
  // production cold start small).
  const mod = await import('../../src/data/products.js')
  const map = new Map()
  for (const p of mod.PRODUCTS) {
    if (unique.includes(p.id)) map.set(p.id, {
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      stock: p.stock,
      brand: p.brand,
      volume: resolveVolume(p),
      category: p.category,
      specs: p.specs || {},
      catalogVolume: p.volume ?? null,
      nicotine: p.nicotine || [],
      flavors: p.flavors || [],
      colors: p.colors || [],
      ohmOptions: p.ohmOptions || [],
    })
  }
  return map
}
