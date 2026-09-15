import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { BLOG_POSTS } from './data/blog.js'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// Les guides affichaient leur FAQ sans jamais la déclarer à Google : pas de
// FAQPage, donc pas de questions dépliables dans les résultats, donc moins de
// surface affichée là où les guides se trouvent (positions 8 à 14).
test('chaque guide expose sa FAQ sous forme structurée, pas seulement en HTML', () => {
  assert.ok(BLOG_POSTS.length > 0, 'le catalogue de guides ne doit pas être vide')

  for (const post of BLOG_POSTS) {
    assert.ok(Array.isArray(post.faq), `${post.slug} doit exposer un tableau faq`)
    assert.ok(post.faq.length > 0, `${post.slug} doit conserver ses questions`)

    for (const item of post.faq) {
      assert.ok(item.q && typeof item.q === 'string', `${post.slug} : question manquante`)
      assert.ok(item.a && typeof item.a === 'string', `${post.slug} : réponse manquante`)
    }

    // La FAQ reste aussi visible dans la page : le balisage ne doit jamais
    // déclarer à Google des questions que le visiteur ne voit pas.
    assert.ok(
      post.faq.every((item) => String(post.content).includes(item.q)),
      `${post.slug} : chaque question déclarée doit être affichée dans le guide`,
    )
  }
})

test('les deux rendus d’un guide déclarent le balisage FAQPage', async () => {
  const prerender = await readSource('../scripts/prerender.mjs')
  const blogPost = await readSource('./pages/BlogPost.jsx')

  for (const [name, source] of [['prerender.mjs', prerender], ['BlogPost.jsx', blogPost]]) {
    assert.match(source, /'@type': 'FAQPage'/, `${name} doit émettre FAQPage pour un guide`)
    assert.match(source, /acceptedAnswer/, `${name} doit rattacher une réponse à chaque question`)
  }

  // Le pré-rendu est ce que voit Google : son graphe doit porter les trois types.
  assert.match(prerender, /'@type': 'BlogPosting'/)
  assert.match(prerender, /'@type': 'BreadcrumbList'/)
})
