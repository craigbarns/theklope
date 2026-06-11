import { useEffect } from 'react'

// Met à jour le titre, les balises OpenGraph et injecte le JSON-LD structuré pour le SEO/GEO.
export default function Seo({ title, description, schema }) {
  useEffect(() => {
    // 1. Titre de la page
    if (title) document.title = `${title} — THEKLOPE`

    // 2. Balises meta description & OpenGraph
    if (description) {
      updateMeta('description', description)
      updateMeta('og:description', description)
    }
    if (title) {
      updateMeta('og:title', `${title} — THEKLOPE`)
    }
    updateMeta('og:type', 'website')
    updateMeta('og:url', window.location.href)

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
  }, [title, description, schema])

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
