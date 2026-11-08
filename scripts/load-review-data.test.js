import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProductReviewSchema } from './load-review-data.mjs'

test('no rating is emitted without real published reviews (anti-fabrication guard)', () => {
  // Aucune donnée → aucun nœud rating.
  assert.deepEqual(buildProductReviewSchema(undefined, []), {})
  // Moins de 3 avis → aucun nœud rating (garde identique à Product.jsx).
  assert.deepEqual(
    buildProductReviewSchema({ review_count: 2, average_rating: 5 }, [
      { rating: 5, author_name: 'A', comment: 'x', created_at: '2026-01-01T00:00:00Z' },
      { rating: 5, author_name: 'B', comment: 'y', created_at: '2026-01-02T00:00:00Z' },
    ]),
    {},
  )
  // Note nulle ou négative → aucun nœud rating.
  assert.deepEqual(buildProductReviewSchema({ review_count: 10, average_rating: 0 }, []), {})
  // Statistique incohérente (count manquant) → aucun nœud rating.
  assert.deepEqual(buildProductReviewSchema({ average_rating: 4.5 }, []), {})
})

test('aggregateRating matches the client shape when the guard passes', () => {
  const schema = buildProductReviewSchema(
    { review_count: 7, average_rating: 4.7 },
    [{ rating: 5, author_name: 'Thomas D.', comment: 'Très bon pod.', created_at: '2026-11-01T12:30:00Z' }],
  )
  assert.equal(schema.aggregateRating['@type'], 'AggregateRating')
  assert.equal(schema.aggregateRating.ratingValue, '4.7')
  assert.equal(schema.aggregateRating.reviewCount, 7)
  assert.equal(schema.aggregateRating.bestRating, '5')
  assert.equal(schema.aggregateRating.worstRating, '1')
  assert.equal(schema.review.length, 1)
  assert.equal(schema.review[0].reviewRating.ratingValue, '5')
  assert.equal(schema.review[0].author.name, 'Thomas D.')
  assert.equal(schema.review[0].reviewBody, 'Très bon pod.')
  assert.equal(schema.review[0].datePublished, '2026-11-01')
})

test('reviews are capped at 5 and missing author falls back to Client vérifié', () => {
  const reviews = Array.from({ length: 8 }, (_, i) => ({
    rating: 4,
    author_name: '',
    comment: `Avis ${i}`,
    created_at: `2026-10-0${(i % 9) + 1}T00:00:00Z`,
  }))
  const schema = buildProductReviewSchema({ review_count: 8, average_rating: 4 }, reviews)
  assert.equal(schema.review.length, 5)
  assert.equal(schema.review[0].author.name, 'Client vérifié')
})
