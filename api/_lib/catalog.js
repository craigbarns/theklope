// Récupération des prix produits CÔTÉ SERVEUR.
// Source de vérité : Supabase si configuré (l'admin y édite les prix), sinon le
// catalogue statique en fallback. Sert à recalculer le montant d'une commande
// sans jamais faire confiance aux prix envoyés par le navigateur.
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'
import { resolveVolume } from '../../src/lib/pricing.js'

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
      ohmOptions: p.ohm_options || [],
      volume: resolveVolume(p),
    }]))
  }

  // Fallback : catalogue statique (importé dynamiquement pour ne pas le charger
  // au cold start quand Supabase est la source de vérité).
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
      nicotine: p.nicotine || [],
      flavors: p.flavors || [],
      colors: p.colors || [],
      ohmOptions: p.ohmOptions || [],
    })
  }
  return map
}
