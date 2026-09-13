import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8')

// CONFORMITÉ — article L3513-4 du code de la santé publique : toute publicité,
// directe ou indirecte, en faveur des produits du vapotage est interdite. Aucune
// surface publique ne doit donc annoncer de remise, de pourcentage, de code
// promotionnel ni de tarif dégressif. Le prix de lot lui-même reste licite : seule
// sa mise en avant publicitaire est proscrite.
test('aucune surface publique n’annonce de remise ou de pourcentage promotionnel', async () => {
  const surfaces = {
    'pages/Product.jsx': await readSource('./pages/Product.jsx'),
    'components/ProductCard.jsx': await readSource('./components/ProductCard.jsx'),
    'pages/Home.jsx': await readSource('./pages/Home.jsx'),
    'pages/CategoryPage.jsx': await readSource('./pages/CategoryPage.jsx'),
    'components/Header.jsx': await readSource('./components/Header.jsx'),
    'components/Newsletter.jsx': await readSource('./components/Newsletter.jsx'),
    'pages/Configurateur.jsx': await readSource('./pages/Configurateur.jsx'),
    'data/navigation.js': await readSource('./data/navigation.js'),
  }

  for (const [name, source] of Object.entries(surfaces)) {
    assert.doesNotMatch(source, /-\s?\d{1,2}\s?%/, `${name} ne doit annoncer aucun pourcentage de remise`)
    assert.doesNotMatch(
      source,
      /remise|réduction|dégressif|code promo|BIENVENUE|PACK15|THEKLOPE10/i,
      `${name} ne doit comporter aucune mention promotionnelle`,
    )
  }

  assert.doesNotMatch(
    surfaces['pages/Product.jsx'],
    /getQuantityPricingRule|Tarifs TTC selon la quantité/,
    'la fiche produit ne doit plus afficher de tarif dégressif',
  )
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
