// Génère le sitemap de secours à partir du catalogue live pendant le build.
// En production, /sitemap.xml est dynamique via api/sitemap.js.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadProducts } from './load-catalog.mjs'
import { buildSitemapEntries, renderSitemapXml } from './sitemap-data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://www.theklope.com').replace(/\/$/, '')
const products = await loadProducts()
const entries = buildSitemapEntries(products)
const xml = renderSitemapXml(entries, baseUrl)

writeFileSync(resolve(root, 'public/sitemap-static.xml'), xml)
writeFileSync(resolve(root, 'public/catalog-fallback.json'), JSON.stringify(products))
console.log(`✓ sitemap-static.xml généré : ${entries.length} URLs (${products.length} produits)`)
