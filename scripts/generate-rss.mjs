// Génère public/feed.xml (RSS 2.0) à partir des guides publiés.
// Un flux RSS est un signal de fraîcheur exploité par les moteurs génératifs
// (Perplexity, ChatGPT Search) pour découvrir et suivre les nouveaux contenus.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const { BLOG_POSTS } = await import(resolve(root, 'src/data/blog.js'))

const BASE_URL = 'https://www.theklope.com'
const escapeXml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Les 20 guides les plus récents suffisent : un flux est un fil d'actualité,
// pas un sitemap.
const items = [...BLOG_POSTS]
  .sort((a, b) => String(b.isoDate).localeCompare(String(a.isoDate)))
  .slice(0, 20)
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/guides/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${BASE_URL}/guides/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.isoDate).toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>THEKLOPE — Guides vape &amp; tests produits</title>
    <link>${BASE_URL}/guides</link>
    <description>Guides, tests et conseils de la boutique THEKLOPE (Marseille) pour les vapoteurs adultes.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

writeFileSync(resolve(root, 'public/feed.xml'), rss, 'utf8')
console.log(`✓ Flux RSS : ${BLOG_POSTS.length} guides au total, 20 derniers publiés dans public/feed.xml`)
