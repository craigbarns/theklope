// Maillage interne fiche produit → guides pertinents.
// Renforce l'autorité thématique (SEO) et rassure l'acheteur (conversion).
// Clés = catégorie produit (getProductCategoryKey : eliquide, ecig, pod,
// resistance, accessoire, pack, diy, alternative-puff).

const GUIDES_BY_CATEGORY = {
  eliquide: [
    'choisir-taux-nicotine-e-liquide',
    'comprendre-ratio-pg-vg',
    'saveurs-eliquide-comment-choisir',
    'lire-fiche-eliquide',
  ],
  ecig: [
    'quelle-cigarette-electronique-choisir',
    'pod-ou-cigarette-electronique',
    'autonomie-cigarette-electronique',
    'entretenir-kit-classique-box',
    'erreurs-frequentes-debutant-vape',
  ],
  pod: [
    'pod-ou-cigarette-electronique',
    'entretenir-pod-rechargeable',
    'quelle-cigarette-electronique-choisir',
  ],
  resistance: [
    'comment-choisir-sa-resistance',
    'quand-changer-resistance',
    'comment-amorcer-resistance',
    'compatibilite-resistances-cartouches',
  ],
  accessoire: [
    'quelle-cigarette-electronique-choisir',
    'lexique-vape',
    'entretenir-pod-rechargeable',
  ],
  pack: [
    'quelle-cigarette-electronique-choisir',
    'erreurs-frequentes-debutant-vape',
    'choisir-taux-nicotine-e-liquide',
  ],
  diy: [
    'comprendre-ratio-pg-vg',
    'choisir-taux-nicotine-e-liquide',
    'lire-fiche-eliquide',
  ],
  'alternative-puff': [
    'alternatives-puffs-jetables',
    'quelle-cigarette-electronique-choisir',
    'pod-ou-cigarette-electronique',
  ],
}

// Guides génériques si la catégorie n'a pas de mapping dédié.
const FALLBACK_GUIDE_SLUGS = [
  'quelle-cigarette-electronique-choisir',
  'erreurs-frequentes-debutant-vape',
  'lexique-vape',
]

// Renvoie jusqu'à `limit` guides { slug, title } pertinents pour un produit,
// en ne gardant que ceux réellement présents dans blogPosts.
export function relatedGuidesForProduct(categoryKey, blogPosts = [], limit = 3) {
  const slugs = GUIDES_BY_CATEGORY[categoryKey] || FALLBACK_GUIDE_SLUGS
  const bySlug = new Map(blogPosts.map((p) => [p.slug, p]))
  const guides = []
  for (const slug of slugs) {
    const post = bySlug.get(slug)
    if (post) guides.push({ slug: post.slug, title: post.title })
    if (guides.length >= limit) break
  }
  return guides
}
