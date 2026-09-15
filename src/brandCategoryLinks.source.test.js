import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { CATEGORIES, findBrandCategory } from './data/catalog.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// Les 17 pages de marque ont un contenu propre mais n'étaient liées que depuis
// /categories. Sans lien interne contextuel, Google ne leur transmet presque pas
// d'autorité : ~5 100 impressions pour 11 clics, positions 27 à 42.
test('la marque d’un produit se résout vers sa page quand elle existe', () => {
  const brandCategories = CATEGORIES.filter((c) => String(c.slug).startsWith('marque-'))
  assert.ok(brandCategories.length > 0, 'des catégories de marque doivent exister')

  for (const category of brandCategories) {
    assert.equal(
      findBrandCategory(category.name)?.slug,
      category.slug,
      `${category.name} doit se résoudre vers ${category.slug}`,
    )
  }

  // Les écarts de graphie entre catalogue et catégories ne doivent pas casser
  // le lien : le catalogue écrit « Tjuice », la catégorie « T-Juice ».
  assert.equal(findBrandCategory('Tjuice')?.slug, 'marque-tjuice')
  assert.equal(findBrandCategory('VAPORESSO')?.slug, 'marque-vaporesso')

  // Une marque sans page dédiée ne doit jamais produire de lien mort.
  assert.equal(findBrandCategory('THEKLOPE'), null)
  assert.equal(findBrandCategory(''), null)
  assert.equal(findBrandCategory(undefined), null)
})

test('les deux rendus d’une fiche produit lient la marque vers sa page', async () => {
  const product = await readSource('./pages/Product.jsx')
  const prerender = await readSource('../scripts/prerender.mjs')

  // Le pré-rendu est ce que Google lit en premier : sans le lien là, l'autorité
  // interne ne circule pas, même si l'application l'affiche après hydratation.
  assert.match(prerender, /findBrandCategory/, 'le pré-rendu doit résoudre la marque')
  assert.match(
    prerender,
    /href="\/categorie\/\$\{esc\(brandCategory\.slug\)\}"/,
    'le pré-rendu doit émettre le lien vers la page de marque',
  )

  assert.match(product, /findBrandCategory/, 'la fiche produit doit résoudre la marque')
  assert.match(
    product,
    /to=\{`\/categorie\/\$\{brandCategory\.slug\}`\}/,
    'la fiche produit doit lier la marque',
  )
})
