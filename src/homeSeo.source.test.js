import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

const HOME_TITLE = 'Cigarette Électronique Marseille — Magasin 188 rue de Rome | THEKLOPE'
const HOME_DESCRIPTION = 'Magasin de cigarettes électroniques au 188 rue de Rome, Marseille 6e (Castellane). E-liquides, pods, résistances et puffs. Retrait gratuit en 1h, livraison offerte dès 29 €.'

// Trois fichiers décrivent l'accueil : le pré-rendu (ce que voit Google), le
// composant React (ce que voit le navigateur) et le squelette index.html. Ils
// avaient divergé, et le pré-rendu écrasait silencieusement les deux autres.
test('l’accueil annonce le même titre et la même description partout', async () => {
  const sources = {
    'scripts/prerender.mjs': await readSource('../scripts/prerender.mjs'),
    'src/pages/Home.jsx': await readSource('./pages/Home.jsx'),
    'index.html': await readSource('../index.html'),
  }

  for (const [name, source] of Object.entries(sources)) {
    assert.ok(source.includes(HOME_TITLE), `${name} doit porter le titre d’accueil canonique`)
    assert.ok(source.includes(HOME_DESCRIPTION), `${name} doit porter la description d’accueil canonique`)
  }
})

// Ces deux enseignes concurrentes généraient ~3 000 impressions pour 1 clic :
// elles écrasaient le taux de clic global sans rien rapporter.
test('aucune surface SEO ne cite d’enseigne concurrente ni ne se déclare n°1', async () => {
  const sources = [
    await readSource('../scripts/prerender.mjs'),
    await readSource('./pages/Home.jsx'),
    await readSource('../index.html'),
    await readSource('../public/llms.txt'),
  ]

  for (const source of sources) {
    assert.doesNotMatch(source, /petit vapoteur/i, 'aucune mention d’une enseigne concurrente')
    assert.doesNotMatch(source, /taklope/i, 'aucune mention d’une enseigne concurrente')
    assert.doesNotMatch(source, /alternative n°\s?1|numéro\s?1|n°\s?1 /i, 'aucune revendication de premier rang')
  }
})
