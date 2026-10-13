import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProductLong,
  buildProductSeoDescription,
  buildProductSeoTitle,
  buildProductShort,
  enrichProductCopy,
  sanitizeProductSpecs,
} from './productCopy.js'

const resistance = {
  name: 'Cartouches Xlim',
  brand: 'OXVA',
  category: 'resistance',
  ohmOptions: ['0.4', '0.8'],
  specs: { Compatibilité: 'Xlim Pro' },
}

test('resistance fallback copy uses the canonical category and compatibility', () => {
  const short = buildProductShort(resistance)
  assert.match(short, /résistance ou cartouche de remplacement/i)
  assert.match(short, /compatible Xlim Pro/i)
  assert.doesNotMatch(short, /un résistance/i)
})

test('resistance long copy lists available ohm values', () => {
  const long = buildProductLong(resistance)
  assert.match(long, /0\.4 Ω et 0\.8 Ω/)
  assert.match(long, /Vérifiez la compatibilité/)
})

test('DIY fallback copy describes preparation without presenting a concentrate as ready to vape', () => {
  const product = {
    name: 'Arôme Fruits Rouges',
    brand: 'THEKLOPE',
    category: 'diy',
    type: 'Arôme concentré',
    volume: '30ml',
    flavors: ['Fruits rouges'],
  }

  const short = buildProductShort(product)
  const long = buildProductLong(product)

  assert.match(short, /produit DIY destiné à la préparation/i)
  assert.match(long, /ne doit jamais être vapoté seul/i)
  assert.doesNotMatch(`${short} ${long}`, /prêt à vapoter/i)
})

test('editorial e-liquid subcategories keep liquid-specific fallback copy', () => {
  const product = {
    name: 'Pêche 10 ml',
    brand: 'Liquidarom',
    category: 'eliquide-fruite',
    type: 'E-liquide',
    flavors: ['Pêche'],
    nicotine: [0, 3],
    specs: { Contenance: '10 ml', Ratio: '70 PG / 30 VG' },
  }

  assert.match(buildProductShort(product), /saveur Pêche/i)
  assert.match(buildProductLong(product), /Taux disponibles : 0 mg et 3 mg/i)
})

test('legacy synthetic product ratings are stripped from every enriched product', () => {
  const product = enrichProductCopy({
    name: 'Produit test',
    brand: 'Marque',
    category: 'accessoire',
    short: 'Description vérifiée.',
    long: 'Description longue vérifiée.',
    rating: 4.9,
    reviews: 999,
  })

  assert.equal('rating' in product, false)
  assert.equal('reviews' in product, false)
})

test('generic universal compatibility claims are removed', () => {
  assert.deepEqual(sanitizeProductSpecs({
    Compatibilité: 'Standard universel',
    Contenance: '3 ml',
  }), { Contenance: '3 ml' })
})

test('hardware fallback copy uses correct French agreement', () => {
  assert.match(buildProductShort({
    name: 'Kit test',
    brand: 'Marque',
    category: 'ecig',
    specs: {},
  }), /cigarette électronique sélectionnée/)
})

// --- Gabarits SEO partagés client / pré-rendu ---------------------------------
test('la méta-description mène par les caractéristiques et écarte la copie générique', () => {
  const description = buildProductSeoDescription({
    name: 'MANGUE ABRICOT',
    brand: 'THEKLOPE',
    type: 'E-liquide',
    nicotine: [0, 3, 6, 12, 16],
    stock: 12,
    short: 'Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.',
    specs: { Contenance: '10 ml', Ratio: '50 PG / 50 VG' },
  })

  assert.match(description, /^MANGUE ABRICOT : E-liquide · 10 ml/)
  assert.match(description, /nicotine 0 à 16 mg/)          // plage, pas la liste complète
  assert.doesNotMatch(description, /sélectionné par THEKLOPE pour sa fiabilité/)
  assert.doesNotMatch(description, /au meilleur prix/)
  // La marque était citée trois fois dans la zone affichée ; marque maison,
  // elle n'a plus à y figurer du tout.
  assert.equal((description.match(/THEKLOPE/g) || []).length, 0)
})

test('la méta-description conserve une description réelle et signale la rupture', () => {
  const description = buildProductSeoDescription({
    name: 'Lady Killer 60 ml',
    brand: 'Adalya',
    type: 'E-liquide',
    stock: 0,
    short: 'Pastèque glacée et fruits rouges, inspiré des recettes chicha.',
  })

  assert.match(description, /Pastèque glacée et fruits rouges/)
  assert.doesNotMatch(description, /En stock/)
})

test('le titre n’ajoute la marque que si le nom ne la porte pas déjà', () => {
  assert.equal(
    buildProductSeoTitle({ name: 'Drag H40', brand: 'Voopoo' }),
    'Acheter Drag H40 Voopoo | THEKLOPE',
  )
  assert.equal(
    buildProductSeoTitle({ name: 'Drag H40 - Voopoo', brand: 'Voopoo' }),
    'Acheter Drag H40 - Voopoo | THEKLOPE',
  )
})

test('la marque maison n’est jamais répétée dans le titre ni la description', () => {
  const product = { name: 'MANGUE ABRICOT', brand: 'THEKLOPE', type: 'E-liquide', stock: 5 }
  assert.equal(buildProductSeoTitle(product), 'Acheter MANGUE ABRICOT | THEKLOPE')
  assert.doesNotMatch(buildProductSeoDescription(product), /THEKLOPE/)
})

test('résistance sans compatibilité saisie : compatibilité vérifiée fabricant, modèles précis', () => {
  const product = enrichProductCopy({
    id: 'pnpx', name: 'Pnp X Voopoo Pack De 5', brand: 'Voopoo', category: 'accessoire',
    specs: { Compatibilité: 'Standard universel' }, short: '', long: '',
  })
  assert.equal(product.specs.Compatibilité, 'Drag S2, Drag X2, Argus Pro 2')
  assert.match(product.short, /compatible Drag S2, Drag X2, Argus Pro 2/)
  // Une compatibilité saisie à la main n'est jamais écrasée.
  const manual = enrichProductCopy({ id: 'x', name: 'Pnp X Voopoo', category: 'accessoire', specs: { Compatibilité: 'Drag S2' } })
  assert.equal(manual.specs.Compatibilité, 'Drag S2')
})

test('matériel : titre « marque + modèle » avec puissance et batterie', () => {
  const doric = {
    name: 'Doric Pro 60 - Voopoo', brand: 'Voopoo', category: 'ecig', type: 'Cigarette électronique', stock: 10,
    specs: { Charge: 'USB-C', Batterie: '2500 mah', 'Puissance max': '60 watts' },
  }
  assert.equal(buildProductSeoTitle(doric), 'Voopoo Doric Pro 60 : 60 W, 2500 mAh | THEKLOPE')
  assert.equal(buildProductSeoTitle({ ...doric, name: 'Drag H40', specs: {} }), 'Voopoo Drag H40 | THEKLOPE')
  assert.equal(buildProductSeoTitle({ ...doric, name: 'Voopoo Argus G2', specs: {} }), 'Voopoo Argus G2 | THEKLOPE')
  // Les chiffres ne sont ajoutés que si le titre reste court.
  const long = { ...doric, name: 'Argus P1s Kit Complet Edition Limitée Cuir - Voopoo' }
  assert.equal(buildProductSeoTitle(long), 'Voopoo Argus P1s Kit Complet Edition Limitée Cuir | THEKLOPE')
})

test('description Google : 160 caractères au plus, chiffres clés en tête', () => {
  const doric = {
    name: 'Doric Pro 60 - Voopoo', brand: 'Voopoo', category: 'ecig', type: 'Cigarette électronique', stock: 10,
    specs: { Batterie: '2500 mah', 'Puissance max': '60 watts' },
    short: 'Le retour du pod cylindrique et iconique sera apprécié par celles et ceux qui veulent une e-cigarette simple à utiliser et versatile. La puissance est de 60W pour un pod puissant et intuitif. '.repeat(4),
  }
  const description = buildProductSeoDescription(doric)
  assert.ok(description.length <= 160, `${description.length} caractères`)
  assert.match(description, /^Voopoo Doric Pro 60 : cigarette électronique 60 W, batterie 2500 mAh\./)
  assert.doesNotMatch(description, /…|cylindrique/, 'jamais de phrase coupée')
  assert.match(description, /En stock/)

  const liquid = buildProductSeoDescription({
    name: 'Hawai 60 ml - Adalya', brand: 'Adalya', category: 'eliquide', type: 'E-liquide', nicotine: [0], stock: 5,
    short: 'Un cocktail tropical rafraîchissant mêlant ananas, mangue et menthe.',
  })
  assert.ok(liquid.length <= 160)
  assert.match(liquid, /ananas, mangue et menthe/)
})
