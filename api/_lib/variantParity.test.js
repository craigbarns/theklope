import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeVariant } from './orderValidation.js'
import { getProductVariantOptions } from '../../src/lib/cart.js'

// Le navigateur décide quelles options proposer ; le serveur décide lesquelles
// accepter au paiement. S'ils divergent, le client remplit un panier qu'il ne
// peut pas payer. C'est arrivé : les saveurs des cartouches et des puffs étaient
// proposées par le navigateur puis refusées par le serveur.
const CATEGORIES = [
  'eliquide', 'eliquide-50ml', 'eliquide-fruite', 'sels-nicotine',
  'diy', 'diy-bases', 'diy-aromes',
  'cartouches', 'cartouches-xros',
  'alternative-puff',
  'ecig', 'pod', 'pack', 'accessoire', 'resistance',
]

const productFor = (category) => ({
  name: `Produit ${category}`,
  category,
  flavors: ['Menthe', 'Fraise'],
  nicotine: [3, 6],
  colors: [],
  ohmOptions: [],
})

for (const field of ['flavor', 'nicotine']) {
  const value = field === 'flavor' ? 'Menthe' : 6

  test(`navigateur et serveur s’accordent sur l’option « ${field} » pour chaque catégorie`, () => {
    for (const category of CATEGORIES) {
      const product = productFor(category)
      const offeredByBrowser = getProductVariantOptions(product, field).length > 0
      const acceptedByServer = normalizeVariant(product, {
        flavor: 'Menthe',
        nicotine: 6,
        [field]: value,
      }).ok

      if (offeredByBrowser) {
        assert.equal(
          acceptedByServer,
          true,
          `${category} : le navigateur propose « ${field} » mais le serveur le refuse au paiement`,
        )
      } else {
        // Une option que le navigateur ne propose pas ne doit pas pouvoir
        // être forcée par une requête directe au serveur.
        const forced = normalizeVariant(product, { [field]: value }).ok
        assert.equal(forced, false, `${category} : « ${field} » non proposé mais accepté par le serveur`)
      }
    }
  })
}

test('les consommables pré-remplis acceptent saveur et nicotine au paiement', () => {
  for (const category of ['cartouches', 'cartouches-xros', 'alternative-puff']) {
    const result = normalizeVariant(productFor(category), { flavor: 'Menthe', nicotine: 6 })
    assert.equal(result.ok, true, `${category} doit être payable avec une saveur`)
    assert.deepEqual(result.variant, { flavor: 'Menthe', nicotine: 6 })
  }
})

test('le matériel refuse toujours une saveur, même forcée', () => {
  for (const category of ['ecig', 'pod', 'resistance']) {
    assert.equal(normalizeVariant(productFor(category), { flavor: 'Menthe' }).ok, false)
  }
})
