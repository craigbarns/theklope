import { useMemo } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { CATEGORIES } from '../data/catalog.js'
import NotFound from '../pages/NotFound.jsx'

export default function SmartRedirect() {
  const location = useLocation()
  const { products } = useStore()

  const destination = useMemo(() => {
    let path = location.pathname.toLowerCase()

    // 1. Nettoyer le préfixe de langue /fr/ si présent
    if (path.startsWith('/fr/')) {
      path = path.substring(3)
    }
    if (path === '/fr') {
      path = '/'
    }

    // 2. Redirections de pages statiques classiques de PrestaShop
    if (['/contact-us', '/contactez-nous'].includes(path)) {
      return '/contact'
    }
    if (['/mon-compte', '/my-account', '/authentication', '/connexion'].includes(path)) {
      return '/'
    }
    if (path === '/search') {
      return '/boutique'
    }
    if (path === '/cart') {
      return '/panier'
    }

    // 3. Pages CMS PrestaShop (ex: /content/2-mentions-legales)
    const cmsMatch = path.match(/\/content\/(\d+)-([a-z0-9-]+)/)
    if (cmsMatch) {
      const id = cmsMatch[1]
      if (id === '2') return '/legal/mentions-legales'
      if (id === '3') return '/legal/cgv'
      if (id === '8') return '/legal/confidentialite'
      if (id === '5') return '/legal/retour'
      if (id === '1') return '/livraison-retours'
      return '/'
    }

    // 4. Produits PrestaShop (ex: /144-pocke-x.html ou /144-pocke-x)
    // Structure classique : /{id}-{slug}.html
    const productMatch = path.match(/^\/?(\d+)-([a-z0-9-]+)(?:\.html)?$/)
    if (productMatch) {
      const legacyId = productMatch[1]
      const slug = productMatch[2]

      // Chercher le produit dont l'identifiant se termine par -{legacyId}
      const foundProduct = products.find((p) => p.id === `${slug}-${legacyId}` || p.id.endsWith(`-${legacyId}`))
      if (foundProduct) {
        return `/produit/${foundProduct.id}`
      }

      // Si le slug correspond à une catégorie connue (ex: /3-cigarettes-electroniques)
      const foundCategory = CATEGORIES.find((c) => c.slug === slug)
      if (foundCategory) {
        return `/categorie/${foundCategory.slug}`
      }
    }

    // Aucun redirect trouvé
    return null
  }, [location.pathname, products])

  if (destination) {
    console.log(`[SmartRedirect] Redirecting legacy URL ${location.pathname} to ${destination}`)
    return <Navigate to={destination} replace />
  }

  return <NotFound />
}
