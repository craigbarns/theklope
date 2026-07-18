import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { markPageSeoReady } from '../lib/pageReadiness.js'

// Met à jour le titre, les balises OpenGraph et injecte le JSON-LD structuré pour le SEO/GEO.
export default function Seo({ title, description, schema, canonical, noindex = false }) {
  const location = useLocation()

  useEffect(() => {
    // 0. Indexation : les pages back-office / tunnel ne doivent pas être indexées.
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')

    // 1. Titre de la page
    if (title) {
      if (title.endsWith('THEKLOPE')) {
        document.title = title
      } else {
        document.title = `${title} — THEKLOPE`
      }
    }

    // 2. Balises meta description & OpenGraph
    if (description) {
      updateMeta('description', description)
      updateMeta('og:description', description)
    }
    if (title) {
      updateMeta('og:title', `${title} — THEKLOPE`)
    }

    // 3. URL canonique (par défaut : origine + chemin, sans query/hash)
    const canonicalUrl = canonical || `${window.location.origin}${window.location.pathname}`
    updateLink('canonical', canonicalUrl)
    updateMeta('og:type', 'website')
    updateMeta('og:url', canonicalUrl)

    // 3. Structured Data Schema (JSON-LD)
    let scriptTag = document.getElementById('jsonld-schema')
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'jsonld-schema'
        scriptTag.type = 'application/ld+json'
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(schema)
    } else {
      if (scriptTag) {
        scriptTag.remove()
      }
    }

    // Signale que le titre de cette route est final. ConsentManager peut alors
    // envoyer la page_view sans capturer le titre de la route précédente.
    markPageSeoReady(location.pathname)
  }, [title, description, schema, canonical, noindex, location.pathname])

  return null
}

function updateMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    if (name.startsWith('og:')) {
      tag.setAttribute('property', name)
    } else {
      tag.setAttribute('name', name)
    }
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function updateLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}
