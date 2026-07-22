import { lazy } from 'react'

const CHUNK_RETRY_PREFIX = 'tk_chunk_retry:'

export const isChunkLoadError = (error) => {
  const message = String(error?.message || error || '')
  return /(?:Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed|ChunkLoadError)/i.test(message)
}

const retryKey = () => {
  if (typeof window === 'undefined') return `${CHUNK_RETRY_PREFIX}server`
  return `${CHUNK_RETRY_PREFIX}${window.location.pathname}${window.location.search}`
}

// Après un déploiement, un onglet resté ouvert peut demander un ancien chunk
// qui n'existe plus. Une seule actualisation récupère le nouvel index ; si elle
// échoue encore, l'ErrorBoundary prend la main sans créer de boucle.
export function lazyWithRetry(importer) {
  return lazy(async () => {
    const key = retryKey()
    let module
    try {
      module = await importer()
    } catch (error) {
      if (typeof window !== 'undefined' && isChunkLoadError(error)) {
        let alreadyRetried = false
        try {
          alreadyRetried = window.sessionStorage?.getItem(key) === '1'
          if (!alreadyRetried) window.sessionStorage?.setItem(key, '1')
        } catch {
          // Sans sessionStorage, l'erreur visible est préférable à une boucle.
          alreadyRetried = true
        }

        if (!alreadyRetried) {
          window.location.reload()
          return new Promise(() => {})
        }
      }
      throw error
    }

    try {
      if (typeof window !== 'undefined') window.sessionStorage?.removeItem(key)
    } catch {
      // Le chargement de la route ne dépend pas de la disponibilité du stockage.
    }
    return module
  })
}
