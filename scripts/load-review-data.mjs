// =============================================================================
// Données d'avis produits pour le pré-rendu (postbuild).
// -----------------------------------------------------------------------------
// Le schema JSON-LD des fiches produit émettait aggregateRating/review UNIQUEMENT
// côté client (Product.jsx, après fetch de /api/product-route). Les crawlers
// sans JS ne voyaient donc jamais les étoiles. Ce module charge au build les
// avis PUBLIÉS depuis Supabase (vue product_review_stats + table product_reviews)
// avec les mêmes identifiants que load-catalog.mjs, pour que le HTML prérendu
// porte exactement les mêmes notes que la version hydratée.
// Garde anti-fabrication : aucune note n'est émise sans avis réel publié
// (review_count >= 3 et note > 0, garde identique à Product.jsx).
// En cas d'indisponibilité (build local sans Supabase) : maps vides, le prerender
// émet simplement un schema sans aggregateRating — aucune régression.
// =============================================================================

// Pure : construit les nœuds { aggregateRating, review } du schema Product à
// partir des données brutes. Testée unitairement ; utilisée par prerender.mjs.
export function buildProductReviewSchema(stats, reviews = []) {
  const reviewCount = Number(stats?.review_count) || 0
  const averageRating = Number(stats?.average_rating) || 0
  // Même garde que src/pages/Product.jsx : pas d'étoile sans au moins 3 avis
  // publiés et une note strictement positive.
  if (reviewCount < 3 || averageRating <= 0) return {}
  const schema = {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
  }
  const published = (Array.isArray(reviews) ? reviews : []).slice(0, 5)
  if (published.length) {
    schema.review = published.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: r.author_name || 'Client vérifié',
      },
      reviewBody: r.comment || '',
      ...(r.created_at ? { datePublished: r.created_at.split('T')[0] } : {}),
    }))
  }
  return schema
}

export async function loadReviewData() {
  const statsByProduct = new Map()
  const reviewsByProduct = new Map()
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { statsByProduct, reviewsByProduct }
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const [{ data: stats }, { data: reviews }] = await Promise.all([
      // Vue créée par la migration 202609060001 : avis published agrégés par produit.
      sb.from('product_review_stats').select('product_id, review_count, average_rating'),
      sb.from('product_reviews')
        .select('product_id, rating, author_name, comment, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
    ])
    for (const row of stats || []) {
      if (row?.product_id) statsByProduct.set(row.product_id, row)
    }
    for (const row of reviews || []) {
      if (!row?.product_id) continue
      const list = reviewsByProduct.get(row.product_id) || []
      list.push(row)
      reviewsByProduct.set(row.product_id, list)
    }
  } catch (e) {
    // Avis indisponibles au build : on prérend sans notes plutôt que d'échouer.
    console.warn(`↪ avis produits indisponibles au build (${e.message}) → schema sans aggregateRating`)
  }
  return { statsByProduct, reviewsByProduct }
}
