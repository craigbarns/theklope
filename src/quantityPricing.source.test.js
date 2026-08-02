import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

test('quantity terms stay factual and limited to product and transaction surfaces', async () => {
  const product = await readSource('./pages/Product.jsx')
  const productCard = await readSource('./components/ProductCard.jsx')
  const home = await readSource('./pages/Home.jsx')
  const category = await readSource('./pages/CategoryPage.jsx')

  assert.match(product, /Tarifs TTC selon la quantité/)
  assert.match(product, /Le total exact est recalculé automatiquement dans le panier/)
  assert.doesNotMatch(product, /prix barré|économisez|plus que|compte à rebours/i)
  assert.doesNotMatch(productCard, /getQuantityPricingRule|Tarif quantité/)
  assert.doesNotMatch(home, /getQuantityPricingRule|Tarif quantité/)
  assert.doesNotMatch(category, /getQuantityPricingRule|Tarif quantité/)
})

test('cart, checkout and payment persistence identify the price rule actually applied', async () => {
  const cart = await readSource('./pages/Cart.jsx')
  const drawer = await readSource('./components/CartDrawer.jsx')
  const checkout = await readSource('./pages/Checkout.jsx')
  const createPayment = await readSource('../api/create-payment.js')

  for (const source of [cart, drawer, checkout]) {
    assert.match(source, /Tarif quantité appliqué/)
    assert.match(source, /totals\.appliedPromo/)
  }
  assert.match(createPayment, /p_promo: totals\.appliedPromo/)
})
