import assert from 'node:assert/strict'
import test from 'node:test'

import { CATEGORIES } from './catalog.js'
import { CATEGORY_SEO } from './categorySeo.js'

test('every category has complete SEO content', () => {
  for (const category of CATEGORIES) {
    const seo = CATEGORY_SEO[category.slug]
    assert.ok(seo, `SEO manquant pour ${category.slug}`)
    assert.ok(seo.seoTitle)
    assert.ok(seo.h1)
    assert.ok(seo.metaDescription)
    assert.ok(seo.metaDescription.length <= 160, `Meta description trop longue pour ${category.slug}`)
    assert.ok(seo.sections.length >= 2)
    assert.ok(seo.faq.length >= 2)
  }
})
