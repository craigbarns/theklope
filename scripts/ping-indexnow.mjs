// Notifie IndexNow (Bing, Yandex, Naver…) des URLs du sitemap pour un
// ré-indexage quasi immédiat. À lancer après une mise à jour du catalogue :
//   npm run indexnow
//
// La clé publique est hébergée sur public/<KEY>.txt et sert de preuve de
// propriété du domaine auprès d'IndexNow.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const KEY = process.env.INDEXNOW_KEY || 'ac20e41a1cbcd400c6da2ede8c02aa53'
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://www.theklope.com').replace(/\/$/, '')
const host = new URL(BASE_URL).host
const keyLocation = `${BASE_URL}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

async function readSitemapUrls() {
  // Le sitemap live (api/sitemap) reflète tout le catalogue Supabase.
  // On tente d'abord la version en ligne, puis on retombe sur le fichier de
  // secours généré au build si le réseau échoue.
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`, { headers: { Accept: 'application/xml' } })
    if (res.ok) {
      const locs = extractLocs(await res.text())
      if (locs.length) return locs
    }
  } catch {
    // repli silencieux sur le sitemap statique
  }
  return extractLocs(readFileSync(resolve(root, 'public/sitemap-static.xml'), 'utf8'))
}

async function main() {
  const urlList = await readSitemapUrls()
  if (!urlList.length) {
    console.error('Aucune URL trouvée dans public/sitemap-static.xml. Lancez d’abord `npm run sitemap`.')
    process.exit(1)
  }

  // IndexNow accepte jusqu'à 10 000 URLs par requête.
  const payload = { host, key: KEY, keyLocation, urlList }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  if (res.ok || res.status === 202) {
    console.log(`✓ IndexNow : ${urlList.length} URLs soumises à Bing (HTTP ${res.status}).`)
  } else {
    const body = await res.text().catch(() => '')
    console.error(`✗ IndexNow a répondu HTTP ${res.status}. ${body}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Échec IndexNow :', err.message)
  process.exit(1)
})
