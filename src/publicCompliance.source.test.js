import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

test('the public shell does not mount exit-intent promotions', async () => {
  const app = await readSource('./App.jsx')

  assert.doesNotMatch(app, /ExitIntentModal/)
})

test('the home page does not mount newsletter or review promotions', async () => {
  const home = await readSource('./pages/Home.jsx')
  const footer = await readSource('./components/Footer.jsx')
  const faq = await readSource('./pages/FAQ.jsx')

  assert.doesNotMatch(home, /\bNewsletter\b/)
  assert.doesNotMatch(home, /\bGoogleReviews\b/)
  assert.doesNotMatch(footer, /STORE_REVIEW_SUMMARY|avis Google|4,7★|411 avis/)
  assert.doesNotMatch(faq, /avis Google|met en avant des avis/)
})

test('the consent manager does not load the removed reviews widget', async () => {
  const manager = await readSource('./components/ConsentManager.jsx')
  const banner = await readSource('./components/CookieBanner.jsx')
  const analytics = await readSource('./lib/analytics.js')

  assert.doesNotMatch(manager, /\bloadElfsight\b/)
  assert.doesNotMatch(manager, /@vercel\/analytics/)
  assert.doesNotMatch(manager, /<Analytics\b/)
  assert.doesNotMatch(banner, /Avis Google via Elfsight/)
  assert.match(analytics, /analytics_storage: 'granted'/)
  assert.match(analytics, /analytics_storage: 'denied'/)
})

test('product pages do not expose urgency countdowns or reference-price comparisons', async () => {
  const product = await readSource('./pages/Product.jsx')
  const productCard = await readSource('./components/ProductCard.jsx')

  assert.doesNotMatch(product, /\bShippingCountdown\b/)
  assert.doesNotMatch(product, /product\.oldPrice/)
  assert.doesNotMatch(productCard, /product\.oldPrice/)
})
