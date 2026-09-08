// =============================================================================
// Test de fumée : rend RÉELLEMENT chaque page de l'application.
// -----------------------------------------------------------------------------
// Pourquoi ce fichier existe : `node --test` ne rend aucun composant et
// `vite build` se contente de transpiler sans exécuter. Une page pouvait donc
// planter au rendu — écran ErrorBoundary pour tous les visiteurs — avec une
// suite de tests verte et un build réussi. C'est arrivé sur la page Paiement
// (un hook lisait une variable d'état déclarée plus bas : « Cannot access
// 'address' before initialization »), et plus aucun paiement n'était possible.
//
// On s'appuie sur l'API SSR de Vite, déjà dans les devDependencies : aucune
// dépendance supplémentaire.
// =============================================================================
import { createServer } from 'vite'
// React et le routeur sont des paquets npm : import direct. Seuls les fichiers
// du projet (JSX) passent par ssrLoadModule, qui les transpile.
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Calque minimal de navigateur. Le code client peut légitimement lire
// window/document au rendu (il ne tourne jamais sous Node en production) ;
// sans ce calque on signalerait des faux positifs au lieu de vrais plantages.
const store = new Map()
globalThis.window = globalThis.window || {
  location: { pathname: '/', href: 'https://www.theklope.com/', search: '', reload() {} },
  localStorage: {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, scrollTo() {},
  setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
}
globalThis.document = globalThis.document || {
  querySelector: () => null, getElementById: () => null,
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  head: { appendChild() {} }, body: { appendChild() {} },
  title: '', addEventListener() {}, removeEventListener() {},
}
globalThis.localStorage = globalThis.window.localStorage

// [libellé, fichier dans src/pages, chemin, motif de route]
const PAGES = [
  ['Accueil', 'Home', '/', '/'],
  ['Boutique', 'Shop', '/boutique', '/boutique'],
  ['Fiche produit', 'Product', '/produit/h40-voopoo', '/produit/:id'],
  ['Panier', 'Cart', '/panier', '/panier'],
  ['Paiement', 'Checkout', '/checkout', '/checkout'],
  ['Retour paiement', 'CheckoutReturn', '/checkout/retour', '/checkout/retour'],
  ['Catégories', 'Categories', '/categories', '/categories'],
  ['Catégorie', 'CategoryPage', '/categorie/e-liquides', '/categorie/:slug'],
  ['Favoris', 'Favorites', '/favoris', '/favoris'],
  ['Guides', 'Blog', '/guides', '/guides'],
  ['Article', 'BlogPost', '/guides/eliquide-sans-nicotine', '/guides/:slug'],
  ['Contact', 'Contact', '/contact', '/contact'],
  ['FAQ', 'FAQ', '/faq', '/faq'],
  ['À propos', 'About', '/a-propos', '/a-propos'],
  ['Configurateur', 'Configurateur', '/configurateur', '/configurateur'],
  ['Calculette DIY', 'CalculetteDiy', '/calculette-diy', '/calculette-diy'],
  ['Admin', 'Admin', '/admin', '/admin'],
  ['404', 'NotFound', '/page-inexistante', '*'],
]

// React avertit que useLayoutEffect ne fait rien côté serveur. C'est attendu
// pour du code prévu pour le navigateur et ça noierait les vrais échecs.
const nativeConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing on the server')) return
  nativeConsoleError(...args)
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let failures = 0
try {
  const { StoreProvider } = await vite.ssrLoadModule('/src/context/StoreContext.jsx')

  for (const [label, file, path, pattern] of PAGES) {
    try {
      const Page = (await vite.ssrLoadModule(`/src/pages/${file}.jsx`)).default
      renderToString(
        React.createElement(MemoryRouter, { initialEntries: [path] },
          React.createElement(StoreProvider, null,
            React.createElement(Routes, null,
              React.createElement(Route, { path: pattern, element: React.createElement(Page, null) }),
              React.createElement(Route, { path: '*', element: React.createElement(Page, null) })))),
      )
      console.log(`  ok   ${label}`)
    } catch (error) {
      console.error(`  ÉCHEC ${label} — ${error.message}`)
      failures += 1
    }
  }
} finally {
  await vite.close()
}

if (failures > 0) {
  console.error(`\n${failures} page(s) plantent au rendu.`)
  process.exit(1)
}
console.log(`\n${PAGES.length} pages rendues sans erreur.`)
