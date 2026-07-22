// =============================================================================
// Instantané du contenu pré-rendu (SEO).
// -----------------------------------------------------------------------------
// Le pré-rendu (scripts/prerender.mjs) injecte un bloc <div data-prerender="seo">
// dans #root de chaque page générée. Au montage, React remplace tout #root ;
// pendant que le catalogue Supabase se charge, la fiche produit n'affichait
// qu'un spinner « Chargement du produit… ». Si Googlebot capture le rendu à ce
// moment-là (XHR lente ou bloquée), la page paraît vide → classée « Soft 404 ».
// On capture donc ce bloc avant le montage pour pouvoir le réafficher dans les
// états de chargement / d'erreur : mêmes contenus pour visiteurs et crawlers.
// =============================================================================

let snapshot = null

export function capturePrerenderSnapshot() {
  if (typeof document === 'undefined') return
  const block = document.querySelector('#root [data-prerender="seo"]')
  const renderedPath = block?.getAttribute('data-prerender-path')
  if (block && (!renderedPath || renderedPath === window.location.pathname)) {
    snapshot = { pathname: window.location.pathname, html: block.innerHTML }
  }
}

// Ne restitue l'instantané que pour l'URL d'atterrissage : après une navigation
// SPA, il décrirait une autre page.
export function getPrerenderSnapshot(pathname) {
  return snapshot && snapshot.pathname === pathname ? snapshot.html : null
}
