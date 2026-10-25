import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { XMLParser } from 'fast-xml-parser'

const DEFAULT_DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value]

// Vérifie les fichiers réellement écrits : un test de rendu de composant seul
// ne détecterait pas une régression du gabarit ou de l'étape postbuild.
export async function verifyInformationHtml(pages, dist = DEFAULT_DIST) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    htmlEntities: true,
    unpairedTags: ['meta', 'link', 'img', 'input', 'br', 'hr'],
    stopNodes: ['*.script', '*.style', '*.noscript'],
  })

  for (const [path, expected] of pages) {
    const html = await readFile(resolve(dist, path.replace(/^\//, ''), 'index.html'), 'utf8')
    assert.ok(html.includes(expected.html), `${path} : contenu du composant absent ou tronqué`)
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path} : un seul titre principal attendu`)
    assert.equal((html.match(/<main\b/g) || []).length, 1, `${path} : un seul repère main attendu`)
    assert.match(html, /href="#contenu"/, `${path} : lien d'évitement absent`)
    assert.match(html, /<main[^>]*id="contenu"/, `${path} : cible du lien d'évitement absente`)

    // fast-xml-parser ne traite pas le doctype HTML comme une déclaration XML.
    // On ne lui confie que head, dont les balises vides sont connues ici.
    const headHtml = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0]
    assert.ok(headHtml, `${path} : en-tête HTML absent`)
    const { head } = parser.parse(headHtml)
    const title = expected.metadata.title.endsWith('THEKLOPE')
      ? expected.metadata.title : `${expected.metadata.title} — THEKLOPE`
    assert.equal(head.title, title, `${path} : titre différent de l'application`)
    const description = asArray(head.meta).find((meta) => meta['@_name'] === 'description')
    assert.equal(description?.['@_content'], expected.metadata.description, `${path} : description différente de l'application`)

    // Lecture des attributs, sans dépendre de leur ordre dans la balise script.
    const scripts = asArray(head.script).filter((script) => script['@_type'] === 'application/ld+json')
    assert.equal(scripts.length, 1, `${path} : un seul bloc JSON-LD attendu`)
    const schema = JSON.parse(scripts[0]['#text'])
    assert.equal(schema['@context'], 'https://schema.org')
    if (expected.schema) {
      const { '@context': _context, '@graph': nodes, ...node } = expected.schema
      for (const expectedNode of nodes || [node]) {
        assert.ok(schema['@graph'].some((actualNode) => isDeepStrictEqual(actualNode, expectedNode)),
          `${path} : balisage ${expectedNode['@type']} différent de l'application`)
      }
    }
  }

  return pages.size
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { renderInformationPages } = await import('./render-information.mjs')
  const count = await verifyInformationHtml(await renderInformationPages())
  console.log(`✓ HTML initial vérifié : ${count} pages d'information complètes, accessibles et cohérentes avec React.`)
}
