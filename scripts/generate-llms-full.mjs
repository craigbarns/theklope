import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const { loadProducts } = await import(resolve(root, 'scripts/load-catalog.mjs'))
const { enrichProductCopy } = await import(resolve(root, 'src/data/productCopy.js'))
const { CATEGORIES, getProductCategoryKey, productMatchesCategory } = await import(resolve(root, 'src/data/catalog.js'))
const PRODUCTS = (await loadProducts()).map((product) => enrichProductCopy({
  ...product,
  category: getProductCategoryKey(product),
}))
const { BLOG_POSTS } = await import(resolve(root, 'src/data/blog.js'))
const { STATIC_SEO_PAGES } = await import(resolve(root, 'src/data/staticSeoPages.js'))

const BASE_URL = 'https://www.theklope.com'
const normalizedText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const productLabel = (product) => normalizedText(product.name).includes(normalizedText(product.brand))
  ? product.name
  : `${product.name} - ${product.brand}`

let md = `# THEKLOPE - Full Database & Specifications
> Fichier complet destiné aux modèles d'IA et moteurs de recherche génératifs (GEO). Contient les informations d'établissement, les guides de conformité, le catalogue produit complet et les règles de prix de la boutique.

## 1. Informations de l'Établissement & Contact
- **Nom commercial** : THEKLOPE
- **Adresse de la boutique physique** : 188 rue de Rome, 13006 Marseille, France
- **Téléphone** : +33 4 91 55 55 55
- **E-mail de support** : contact@theklope.com
- **Site officiel** : ${BASE_URL}
- **RCS** : Marseille 815 155 973
- **TVA** : FR58 815 155 973

## 2. Conformité Vapotage & Avertissements
- **Limite d'âge** : Vente strictement réservée aux personnes majeures de 18 ans et plus.
- **Nicotine** : Substance addictive présente dans certains produits. Utilisation déconseillée aux non-fumeurs.
- **Absence de promesse médicale** : THEKLOPE ne présente pas la vape comme solution thérapeutique de sevrage tabagique. En cas d'objectif de sevrage, consulter un professionnel de santé.

## 3. Tarifs, Lots et Codes Promotionnels
- **Code promo BIENVENUE** : -15% sur la première commande.
- **Code promo THEKLOPE10** : -10% sur l'ensemble du panier.
- **Code promo PACK15** : -15% sur une composition complète éligible avec matériel, accessoire et e-liquide.
- **Livraison gratuite** : Offerte dès 49€ d'achat en France métropolitaine.
- **Calculateur DIY** : Outil en ligne disponible sur ${BASE_URL}/calculette-diy pour formuler les proportions (base, booster, arômes).

## 4. Catalogue Complet des Produits (instantané du build)
Ci-dessous, la liste des matériels, e-liquides et accessoires actifs lors du dernier build. Le prix et la disponibilité sont revérifiés côté serveur au paiement :

`

// Group products by category
for (const cat of CATEGORIES) {
  // Exclude virtual categories like new/best from list
  if (['new', 'best'].includes(cat.key)) continue
  
  const catProducts = PRODUCTS.filter(p => productMatchesCategory(p, cat.key))
  if (catProducts.length === 0) continue
  
  md += `### Catégorie : ${cat.name} (${cat.tagline})\n`
  for (const p of catProducts) {
    const specsStr = Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join(', ')
    const stockStatus = p.stock > 0 ? `En stock (quantité: ${p.stock})` : 'Rupture de stock'
    const details = [p.short, specsStr ? `[Fiche technique: ${specsStr}]` : ''].filter(Boolean).join(' ')
    md += `- [${productLabel(p)}](${BASE_URL}/produit/${p.id}) : ${p.price.toFixed(2)}€ (${stockStatus})${details ? ` - ${details}` : ''}\n`
  }
  md += `\n`
}

md += `## 5. Guides & Articles de Blog
`
for (const b of BLOG_POSTS) {
  md += `- [${b.title}](${BASE_URL}/guides/${b.slug}) : ${b.description || ''}\n`
}

writeFileSync(resolve(root, 'public/llms-full.txt'), md)
console.log(`✓ llms-full.txt généré avec ${PRODUCTS.length} produits.`)
