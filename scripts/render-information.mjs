import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Route, Routes } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server.js'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

export const INFORMATION_ROUTES = [
  { path: '/guides', page: 'Blog' },
  { path: '/faq', page: 'FAQ' },
  { path: '/contact', page: 'Contact' },
  ...['mentions-legales', 'cgv', 'confidentialite', 'retour'].map((slug) => ({
    path: `/legal/${slug}`,
    pattern: '/legal/:slug',
    page: 'Legal',
    slug,
  })),
]

// Réutilise les composants de l'application : leur contenu ne doit pas avoir
// une seconde version, abrégée ou périmée, dans le HTML initial.
export async function renderInformationPages() {
  const vite = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
    logLevel: 'error',
  })

  try {
    const pages = new Map()
    for (const route of INFORMATION_ROUTES) {
      const module = await vite.ssrLoadModule(`/src/pages/${route.page}.jsx`)
      const metadata = module.PAGE_META || module.getPageMeta?.(route.slug)
      if (!metadata?.title || !metadata?.description) {
        throw new Error(`Métadonnées manquantes pour ${route.path}`)
      }
      const html = renderToStaticMarkup(
        React.createElement(StaticRouter, { location: route.path },
          React.createElement(Routes, null,
            React.createElement(Route, {
              path: route.pattern || route.path,
              element: React.createElement(module.default),
            }))),
      )
      pages.set(route.path, {
        html,
        metadata,
        schema: module.PAGE_SCHEMA || module.getPageSchema?.(route.slug),
      })
    }
    return pages
  } finally {
    await vite.close()
  }
}
