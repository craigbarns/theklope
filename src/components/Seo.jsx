import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { markPageSeoReady } from '../lib/pageReadiness.js'

const DEFAULT_SOCIAL_IMAGE = '/og-image.jpg'

// Met à jour le titre, les balises OpenGraph et injecte le JSON-LD structuré pour le SEO/GEO.
export default function Seo({
  title,
  description,
  schema,
  canonical,
  image,
  imageAlt,
  type,
  noindex = false,
}) {
  const location = useLocation()

  useEffect(() => {
    // 0. Indexation : les pages back-office / tunnel ne doivent pas être indexées.
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')

    // 1. Titre de la page
    const fullTitle = title?.endsWith('THEKLOPE') ? title : `${title} — THEKLOPE`
    if (title) document.title = fullTitle

    // 2. Balises meta description & OpenGraph
    if (description) {
      updateMeta('description', description)
      updateMeta('og:description', description)
    }
    if (title) {
      updateMeta('og:title', fullTitle)
      updateMeta('twitter:title', fullTitle)
    }

    // 3. URL canonique (par défaut : origine + chemin, sans query/hash)
    const canonicalUrl = canonical || `${window.location.origin}${window.location.pathname}`
    updateLink('canonical', canonicalUrl)
    const schemaType = schema?.['@type']
    const inferredType = schemaType === 'Product' ? 'product' : schemaType === 'BlogPosting' ? 'article' : 'website'
    const schemaImage = Array.isArray(schema?.image) ? schema.image[0] : schema?.image
    const socialImage = new URL(image || schemaImage || DEFAULT_SOCIAL_IMAGE, window.location.origin).href
    const defaultSocialImage = new URL(DEFAULT_SOCIAL_IMAGE, window.location.origin).href
    updateMeta('og:type', type || inferredType)
    updateMeta('og:url', canonicalUrl)
    updateMeta('og:image', socialImage)
    updateMeta('og:image:secure_url', socialImage)
    updateMeta('og:image:alt', imageAlt || fullTitle || 'THEKLOPE')
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:image', socialImage)
    updateMeta('twitter:image:alt', imageAlt || fullTitle || 'THEKLOPE')
    if (description) updateMeta('twitter:description', description)
    if (socialImage === defaultSocialImage) {
      updateMeta('og:image:width', '1200')
      updateMeta('og:image:height', '630')
    } else {
      removeMeta('og:image:width')
      removeMeta('og:image:height')
    }

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
  }, [title, description, schema, canonical, image, imageAlt, type, noindex, location.pathname])

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

function removeMeta(name) {
  document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.remove()
}
