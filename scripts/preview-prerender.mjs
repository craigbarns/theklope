import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'

// Le fallback SPA de vite preview sert sinon l'accueil pour /faq, même si
// dist/faq/index.html existe. Conserver l'URL du navigateur et servir le
// fichier pré-rendu, comme le fait l'hébergement statique en production.
export function rewritePrerenderRequest(req, outDir) {
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) return
  let url
  let pathname
  try {
    url = new URL(req.url || '/', 'http://localhost')
    pathname = decodeURIComponent(url.pathname).replace(/\/$/, '')
  } catch {
    return
  }
  const file = resolve(outDir, `.${pathname}`, 'index.html')
  if (!file.startsWith(`${resolve(outDir)}${sep}`) || !existsSync(file)) return
  req.url = `${pathname}/index.html${url.search}`
}

export function prerenderPreview() {
  return {
    name: 'prerender-preview',
    configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        rewritePrerenderRequest(req, outDir)
        next()
      })
    },
  }
}
