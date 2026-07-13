import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Charge le catalogue produits au build. Source de vérité = Supabase (les prix /
// stocks y sont édités depuis l'admin) si les identifiants sont présents ; sinon
// repli sur le catalogue statique. Garantit que le sitemap et le pré-rendu
// reflètent le catalogue RÉELLEMENT vendu (mêmes prix que le client paie).
export async function loadProducts() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const isDeploymentBuild = Boolean(process.env.VERCEL || process.env.VERCEL_ENV)

  if (url && key) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (Array.isArray(data) && data.length > 0) {
        console.log(`↪ catalogue : ${data.length} produits chargés depuis Supabase`)
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          brand: row.brand,
          type: row.type,
          volume: row.volume,
          ohm: row.ohm,
          price: row.price,
          oldPrice: row.old_price,
          rating: row.rating,
          reviews: row.reviews,
          stock: row.stock,
          badge: row.badge,
          nicotine: row.nicotine,
          flavors: row.flavors,
          colors: row.colors,
          ohmOptions: row.ohm_options,
          short: row.short,
          long: row.long,
          specs: row.specs,
          images: row.images,
          image: row.image,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      }
      throw new Error('Le catalogue Supabase est vide')
    } catch (e) {
      if (isDeploymentBuild) {
        throw new Error(`Catalogue Supabase indisponible pendant le déploiement : ${e.message}`)
      }
      console.warn(`↪ Supabase indisponible au build (${e.message}) → repli sur le catalogue statique`)
    }
  }

  if (isDeploymentBuild) {
    const missing = [
      !url && 'VITE_SUPABASE_URL',
      !key && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ')
    throw new Error(`Catalogue live requis pendant le déploiement. Variable(s) manquante(s) : ${missing}`)
  }

  console.warn('↪ build local sans Supabase → repli sur le catalogue statique')
  const mod = await import(resolve(root, 'src/data/products.js'))
  return mod.PRODUCTS
}
