import assert from 'node:assert/strict'
import test from 'node:test'
import { XMLParser } from 'fast-xml-parser'
import { BLOG_POSTS } from '../src/data/blog.js'
import { STORE_PHONE } from '../src/data/localBusiness.js'
import { renderInformationPages } from './render-information.mjs'

const pages = await renderInformationPages()
const parser = new XMLParser({
  htmlEntities: true,
  unpairedTags: ['img', 'input', 'br'],
})
const textContent = (html) => {
  const strings = []
  const visit = (value) => {
    if (typeof value === 'string') strings.push(value)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(parser.parse(html))
  return strings.join(' ').replace(/\s+/g, ' ')
}

test('guide index contains links to every published article before JavaScript', () => {
  const { html } = pages.get('/guides')
  for (const post of BLOG_POSTS) {
    assert.ok(html.includes(`href="/guides/${post.slug}"`), `lien absent : ${post.slug}`)
  }
  assert.match(html, /<label[^>]*>.*?Rechercher un guide.*?<input[^>]*type="search"/s)
  assert.match(html, /aria-pressed="true"/)
  assert.equal((html.match(/loading="lazy"/g) || []).length, BLOG_POSTS.length - 2)
})

test('FAQ exposes every structured question and answer in native HTML accordions', () => {
  const { html, schema } = pages.get('/faq')
  const text = textContent(html)
  assert.equal(schema['@type'], 'FAQPage')
  assert.equal(schema.mainEntity.length, 24)
  assert.equal((html.match(/<details\b/g) || []).length, schema.mainEntity.length)
  for (const question of schema.mainEntity) {
    assert.ok(text.includes(question.name), `question absente : ${question.name}`)
    assert.ok(text.includes(question.acceptedAnswer.text), `réponse absente : ${question.name}`)
  }
})

test('contact page provides usable coordinates and protects the inactive form', () => {
  const { html, schema } = pages.get('/contact')
  const text = textContent(html)
  assert.ok(html.includes(`href="tel:${STORE_PHONE}"`))
  assert.ok(text.includes('188 Rue de Rome, 13006 Marseille'))
  assert.ok(text.includes('Lundi – Vendredi'))
  assert.match(html, /<form[^>]*method="post"[^>]*action="\/api\/contact"/)
  assert.match(html, /<fieldset[^>]*\bdisabled=/)
  assert.match(html, /<noscript>.*?mailto:contact@theklope\.com/s)
  assert.match(html, /role="status" aria-live="polite"/)
  assert.equal(schema['@graph'].find((node) => node['@type'] === 'LocalBusiness').telephone, STORE_PHONE)
})

test('legal pages expose their full existing text without changing its content', () => {
  for (const slug of ['mentions-legales', 'cgv', 'confidentialite', 'retour']) {
    const page = pages.get(`/legal/${slug}`)
    assert.ok(textContent(page.html).length > 500, `contenu incomplet : ${slug}`)
    assert.ok(page.metadata.title && page.metadata.description)
  }
  assert.match(textContent(pages.get('/legal/mentions-legales').html), /815 155 973/)
  assert.match(textContent(pages.get('/legal/cgv').html), /Garantie légale de conformité/)
})
