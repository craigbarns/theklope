// Récupération des prix produits CÔTÉ SERVEUR.
// Source de vérité : Supabase si configuré (l'admin y édite les prix), sinon le
// catalogue statique en fallback. Sert à recalculer le montant d'une commande
// sans jamais faire confiance aux prix envoyés par le navigateur.
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'

export async function getProductsByIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))]
  if (unique.length === 0) return new Map()

  if (hasSupabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id,name,price,image,stock,brand,volume,category')
      .in('id', unique)
    if (error) throw error
    return new Map((data || []).map((p) => [p.id, p]))
  }

  // Fallback : catalogue statique (importé dynamiquement pour ne pas le charger
  // au cold start quand Supabase est la source de vérité).
  const mod = await import('../../src/data/products.js')
  const map = new Map()
  for (const p of mod.PRODUCTS) {
    if (unique.includes(p.id)) map.set(p.id, { id: p.id, name: p.name, price: p.price, image: p.image, stock: p.stock, brand: p.brand, volume: p.volume, category: p.category })
  }
  return map
}
