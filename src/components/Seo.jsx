import { useEffect } from 'react'

// Met à jour le titre et la meta description par page (SEO côté client).
export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = `${title} — THEKLOPE`
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
  return null
}
