// =============================================================================
// Catalogue THEKLOPE — 308 produits réels.
// -----------------------------------------------------------------------------
// Ce module ne contient QUE le gros tableau de produits + son post-traitement.
// Il est lourd : importez-le dynamiquement (await import('../data/products.js')).
// Les constantes et helpers légers sont dans `catalog.js`.
// =============================================================================

export const PRODUCTS = [
  {
    "id": "act-1-0",
    "name": "ACT 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 248,
    "stock": 73,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ACT 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ACT 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ACT 1.jpg"
    ],
    "image": "/products/ACT 1.jpg"
  },
  {
    "id": "act-2-1",
    "name": "ACT 2",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 141,
    "stock": 139,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ACT 2"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ACT 2, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ACT 2.jpg"
    ],
    "image": "/products/ACT 2.jpg"
  },
  {
    "id": "act-3-2",
    "name": "ACT 3",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 155,
    "stock": 127,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ACT 3"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ACT 3, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ACT 3.jpg"
    ],
    "image": "/products/ACT 3.jpg"
  },
  {
    "id": "aegis-boost-3",
    "name": "AEGIS BOOST",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 227,
    "stock": 60,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez AEGIS BOOST, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/AEGIS BOOST.jpg"
    ],
    "image": "/products/AEGIS BOOST.jpg"
  },
  {
    "id": "aegis-max-4",
    "name": "AEGIS MAX",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": 71.9,
    "rating": 4.5,
    "reviews": 180,
    "stock": 80,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez AEGIS MAX, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/AEGIS MAX.jpg"
    ],
    "image": "/products/AEGIS MAX.jpg"
  },
  {
    "id": "aegis-mini-5-5",
    "name": "AEGIS MINI 5",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 65,
    "stock": 140,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez AEGIS MINI 5, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/AEGIS MINI 5.jpg"
    ],
    "image": "/products/AEGIS MINI 5.jpg"
  },
  {
    "id": "aegis-mini-6",
    "name": "AEGIS MINI",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 173,
    "stock": 34,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez AEGIS MINI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/AEGIS MINI.jpg"
    ],
    "image": "/products/AEGIS MINI.jpg"
  },
  {
    "id": "aio-7",
    "name": "AIO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 78,
    "stock": 48,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "AIO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez AIO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/AIO.jpg"
    ],
    "image": "/products/AIO.jpg"
  },
  {
    "id": "alabama-8",
    "name": "ALABAMA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 126,
    "stock": 124,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ALABAMA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ALABAMA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ALABAMA.jpg"
    ],
    "image": "/products/ALABAMA.jpg"
  },
  {
    "id": "alezan-1-9",
    "name": "ALEZAN 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 152,
    "stock": 132,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ALEZAN 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ALEZAN 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ALEZAN-1.jpg"
    ],
    "image": "/products/ALEZAN-1.jpg"
  },
  {
    "id": "alezan-10",
    "name": "ALEZAN",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 41,
    "stock": 82,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ALEZAN"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ALEZAN, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ALEZAN.jpg"
    ],
    "image": "/products/ALEZAN.jpg"
  },
  {
    "id": "armour-ultra-11",
    "name": "ARMOUR ULTRA",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 67,
    "stock": 105,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ARMOUR ULTRA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/ARMOUR ULTRA.jpg"
    ],
    "image": "/products/ARMOUR ULTRA.jpg"
  },
  {
    "id": "barbapapa-1-12",
    "name": "BARBAPAPA 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 192,
    "stock": 28,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BARBAPAPA 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BARBAPAPA 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BARBAPAPA-1.jpg"
    ],
    "image": "/products/BARBAPAPA-1.jpg"
  },
  {
    "id": "barbapapa-13",
    "name": "BARBAPAPA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 249,
    "stock": 68,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BARBAPAPA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BARBAPAPA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BARBAPAPA.jpg"
    ],
    "image": "/products/BARBAPAPA.jpg"
  },
  {
    "id": "berry-fresh-1-14",
    "name": "BERRY FRESH 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.6,
    "reviews": 131,
    "stock": 90,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BERRY FRESH 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BERRY FRESH 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BERRY FRESH-1.jpg"
    ],
    "image": "/products/BERRY FRESH-1.jpg"
  },
  {
    "id": "berry-fresh-15",
    "name": "BERRY FRESH",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 134,
    "stock": 129,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BERRY FRESH"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BERRY FRESH, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BERRY FRESH.jpg"
    ],
    "image": "/products/BERRY FRESH.jpg"
  },
  {
    "id": "blond-miel-noir-16",
    "name": "BLOND MIEL NOIR",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 184,
    "stock": 8,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLOND MIEL NOIR"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLOND MIEL NOIR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLOND MIEL NOIR.jpg"
    ],
    "image": "/products/BLOND MIEL NOIR.jpg"
  },
  {
    "id": "blond-torrefie-17",
    "name": "BLOND TORREFIE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 157,
    "stock": 82,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLOND TORREFIE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLOND TORREFIE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLOND TORREFIE.jpg"
    ],
    "image": "/products/BLOND TORREFIE.jpg"
  },
  {
    "id": "bloody-lime-18",
    "name": "BLOODY LIME",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 136,
    "stock": 120,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLOODY LIME"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLOODY LIME, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLOODY LIME.jpg"
    ],
    "image": "/products/BLOODY LIME.jpg"
  },
  {
    "id": "bloody-summer-19",
    "name": "BLOODY SUMMER",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 77,
    "stock": 56,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLOODY SUMMER"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLOODY SUMMER, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLOODY SUMMER.jpg"
    ],
    "image": "/products/BLOODY SUMMER.jpg"
  },
  {
    "id": "blue-cloud-1-20",
    "name": "BLUE CLOUD 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 204,
    "stock": 79,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLUE CLOUD 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLUE CLOUD 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLUE CLOUD-1.jpg"
    ],
    "image": "/products/BLUE CLOUD-1.jpg"
  },
  {
    "id": "blue-cloud-21",
    "name": "BLUE CLOUD",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 67,
    "stock": 109,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLUE CLOUD"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLUE CLOUD, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLUE CLOUD.jpg"
    ],
    "image": "/products/BLUE CLOUD.jpg"
  },
  {
    "id": "blue-granite-22",
    "name": "BLUE GRANITE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 205,
    "stock": 7,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BLUE GRANITE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BLUE GRANITE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BLUE GRANITE.jpg"
    ],
    "image": "/products/BLUE GRANITE.jpg"
  },
  {
    "id": "boston-menthol-23",
    "name": "BOSTON MENTHOL",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 176,
    "stock": 33,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BOSTON MENTHOL"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BOSTON MENTHOL, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BOSTON MENTHOL.jpg"
    ],
    "image": "/products/BOSTON MENTHOL.jpg"
  },
  {
    "id": "breakfast-1-24",
    "name": "BREAKFAST 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 234,
    "stock": 32,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BREAKFAST 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BREAKFAST 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BREAKFAST-1.jpg"
    ],
    "image": "/products/BREAKFAST-1.jpg"
  },
  {
    "id": "breakfast-25",
    "name": "BREAKFAST",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 219,
    "stock": 82,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BREAKFAST"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BREAKFAST, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BREAKFAST.jpg"
    ],
    "image": "/products/BREAKFAST.jpg"
  },
  {
    "id": "bubble-gum-26",
    "name": "BUBBLE GUM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 150,
    "stock": 48,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "BUBBLE GUM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BUBBLE GUM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/BUBBLE GUM.jpg"
    ],
    "image": "/products/BUBBLE GUM.jpg"
  },
  {
    "id": "bvc-ce5-27",
    "name": "BVC CE5",
    "category": "accessoire",
    "brand": "THEKLOPE",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 246,
    "stock": 8,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BVC CE5, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/BVC CE5.jpg"
    ],
    "image": "/products/BVC CE5.jpg"
  },
  {
    "id": "bvc-nautilus-28",
    "name": "BVC NAUTILUS",
    "category": "accessoire",
    "brand": "THEKLOPE",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 102,
    "stock": 87,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez BVC NAUTILUS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/BVC NAUTILUS.jpg"
    ],
    "image": "/products/BVC NAUTILUS.jpg"
  },
  {
    "id": "caffe-latte-29",
    "name": "CAFFE LATTE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 181,
    "stock": 145,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CAFFE LATTE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CAFFE LATTE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CAFFE LATTE.jpg"
    ],
    "image": "/products/CAFFE LATTE.jpg"
  },
  {
    "id": "canialle-30",
    "name": "CANIALLE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 85,
    "stock": 108,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CANIALLE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CANIALLE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CANIALLE.jpg"
    ],
    "image": "/products/CANIALLE.jpg"
  },
  {
    "id": "cassis-exquis-31",
    "name": "CASSIS EXQUIS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 75,
    "stock": 103,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CASSIS EXQUIS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CASSIS EXQUIS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CASSIS EXQUIS.jpg"
    ],
    "image": "/products/CASSIS EXQUIS.jpg"
  },
  {
    "id": "cassis-mangue-32",
    "name": "CASSIS MANGUE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 243,
    "stock": 7,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CASSIS MANGUE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CASSIS MANGUE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CASSIS MANGUE.jpg"
    ],
    "image": "/products/CASSIS MANGUE.jpg"
  },
  {
    "id": "cerise-fruits-du-dragon-33",
    "name": "CERISE FRUITS DU DRAGON",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 179,
    "stock": 116,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CERISE FRUITS DU DRAGON"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CERISE FRUITS DU DRAGON, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CERISE FRUITS DU DRAGON.jpg"
    ],
    "image": "/products/CERISE FRUITS DU DRAGON.jpg"
  },
  {
    "id": "cerise-fruit-du-dragon-34",
    "name": "CERISE FRUIT DU DRAGON",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 40,
    "stock": 46,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CERISE FRUIT DU DRAGON"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CERISE FRUIT DU DRAGON, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CERISE-FRUIT DU DRAGON.jpg"
    ],
    "image": "/products/CERISE-FRUIT DU DRAGON.jpg"
  },
  {
    "id": "cherry-frost-50ml-35",
    "name": "CHERRY FROST 50ML",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.8,
    "reviews": 211,
    "stock": 143,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "CHERRY FROST"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CHERRY FROST 50ML, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CHERRY FROST 50ML.jpg"
    ],
    "image": "/products/CHERRY FROST 50ML.jpg"
  },
  {
    "id": "chubby-berries-36",
    "name": "CHUBBY BERRIES",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 24,
    "stock": 134,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CHUBBY BERRIES"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CHUBBY BERRIES, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CHUBBY BERRIES.jpg"
    ],
    "image": "/products/CHUBBY BERRIES.jpg"
  },
  {
    "id": "citron-cassis-37",
    "name": "CITRON CASSIS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 56,
    "stock": 74,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CITRON CASSIS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CITRON CASSIS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CITRON CASSIS.jpg"
    ],
    "image": "/products/CITRON CASSIS.jpg"
  },
  {
    "id": "citron-fizz-38",
    "name": "CITRON FIZZ",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 65,
    "stock": 68,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CITRON FIZZ"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CITRON FIZZ, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CITRON FIZZ.jpg"
    ],
    "image": "/products/CITRON FIZZ.jpg"
  },
  {
    "id": "citron-orange-mandarine-39",
    "name": "CITRON ORANGE MANDARINE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 119,
    "stock": 98,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CITRON ORANGE MANDARINE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CITRON ORANGE MANDARINE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CITRON ORANGE MANDARINE.jpg"
    ],
    "image": "/products/CITRON ORANGE MANDARINE.jpg"
  },
  {
    "id": "classico-m-40",
    "name": "CLASSICO M",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 99,
    "stock": 83,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CLASSICO M"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CLASSICO M, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CLASSICO M.jpg"
    ],
    "image": "/products/CLASSICO M.jpg"
  },
  {
    "id": "clone-41",
    "name": "CLONE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 100,
    "stock": 91,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CLONE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CLONE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CLONE.jpg"
    ],
    "image": "/products/CLONE.jpg"
  },
  {
    "id": "coco-miam-42",
    "name": "COCO MIAM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 134,
    "stock": 67,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "COCO MIAM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez COCO MIAM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/COCO MIAM.jpg"
    ],
    "image": "/products/COCO MIAM.jpg"
  },
  {
    "id": "coco-miam-43",
    "name": "COCO MIAM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 70,
    "stock": 118,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "COCO MIAM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez COCO MIAM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/COCO-MIAM.jpg"
    ],
    "image": "/products/COCO-MIAM.jpg"
  },
  {
    "id": "cola-liquidarom-44",
    "name": "COLA LIQUIDAROM",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 149,
    "stock": 78,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "COLA LIQUIDAROM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez COLA LIQUIDAROM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/COLA LIQUIDAROM.jpg"
    ],
    "image": "/products/COLA LIQUIDAROM.jpg"
  },
  {
    "id": "cola-45",
    "name": "COLA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 247,
    "stock": 75,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "COLA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez COLA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/COLA.jpg"
    ],
    "image": "/products/COLA.jpg"
  },
  {
    "id": "corne-de-gazelle-46",
    "name": "CORNE DE GAZELLE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 113,
    "stock": 82,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CORNE DE GAZELLE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CORNE DE GAZELLE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CORNE DE GAZELLE.jpg"
    ],
    "image": "/products/CORNE DE GAZELLE.jpg"
  },
  {
    "id": "crapule-47",
    "name": "CRAPULE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 201,
    "stock": 51,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CRAPULE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CRAPULE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CRAPULE.jpg"
    ],
    "image": "/products/CRAPULE.jpg"
  },
  {
    "id": "crazy-mango-48",
    "name": "CRAZY MANGO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 160,
    "stock": 136,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CRAZY MANGO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CRAZY MANGO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CRAZY MANGO.jpg"
    ],
    "image": "/products/CRAZY MANGO.jpg"
  },
  {
    "id": "crumble-49",
    "name": "CRUMBLE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 156,
    "stock": 56,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "CRUMBLE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez CRUMBLE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/CRUMBLE.jpg"
    ],
    "image": "/products/CRUMBLE.jpg"
  },
  {
    "id": "cartouches-xros-series-3ml-4pcs-vaporesso-50",
    "name": "Cartouches XROS Series 3ml (4pcs) Vaporesso",
    "category": "pod",
    "brand": "Vaporesso",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 139,
    "stock": 36,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Cartouches XROS Series 3ml (4pcs) Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Cartouches XROS Series 3ml (4pcs) - Vaporesso.jpg"
    ],
    "image": "/products/Cartouches XROS Series 3ml (4pcs) - Vaporesso.jpg"
  },
  {
    "id": "drag-s3-51",
    "name": "DRAG S3",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 238,
    "stock": 29,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DRAG S3"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DRAG S3, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DRAG S3.jpg"
    ],
    "image": "/products/DRAG S3.jpg"
  },
  {
    "id": "drag-x3-52",
    "name": "DRAG X3",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 177,
    "stock": 69,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DRAG X3"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DRAG X3, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DRAG X3.jpg"
    ],
    "image": "/products/DRAG X3.jpg"
  },
  {
    "id": "drag-x2-53",
    "name": "DRAG X2",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 223,
    "stock": 119,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DRAG X2"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DRAG X2, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DRAG x2.jpg"
    ],
    "image": "/products/DRAG x2.jpg"
  },
  {
    "id": "dragon-54",
    "name": "DRAGON",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 117,
    "stock": 107,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DRAGON"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DRAGON, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DRAGON.jpg"
    ],
    "image": "/products/DRAGON.jpg"
  },
  {
    "id": "druginbus-55",
    "name": "DRUGINBUS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 189,
    "stock": 97,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DRUGINBUS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DRUGINBUS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DRUGINBUS.jpg"
    ],
    "image": "/products/DRUGINBUS.jpg"
  },
  {
    "id": "dual-coil-56",
    "name": "DUAL COIL",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 101,
    "stock": 86,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "DUAL COIL"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez DUAL COIL, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/DUAL COIL.jpg"
    ],
    "image": "/products/DUAL COIL.jpg"
  },
  {
    "id": "eclair-au-cafe-57",
    "name": "ECLAIR AU CAFE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 123,
    "stock": 26,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ECLAIR AU CAFE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ECLAIR AU CAFE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ECLAIR AU CAFE.jpg"
    ],
    "image": "/products/ECLAIR AU CAFE.jpg"
  },
  {
    "id": "famous-58",
    "name": "FAMOUS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 187,
    "stock": 37,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FAMOUS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FAMOUS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FAMOUS.jpg"
    ],
    "image": "/products/FAMOUS.jpg"
  },
  {
    "id": "fire-moon-59",
    "name": "FIRE MOON",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 137,
    "stock": 149,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FIRE MOON"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FIRE MOON, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FIRE MOON.jpg"
    ],
    "image": "/products/FIRE MOON.jpg"
  },
  {
    "id": "force-couleur-60",
    "name": "FORCE COULEUR",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 160,
    "stock": 17,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FORCE COULEUR"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FORCE COULEUR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FORCE COULEUR.jpg"
    ],
    "image": "/products/FORCE COULEUR.jpg"
  },
  {
    "id": "force-61",
    "name": "FORCE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 30,
    "stock": 6,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FORCE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FORCE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FORCE.jpg"
    ],
    "image": "/products/FORCE.jpg"
  },
  {
    "id": "fraise-sauvage-62",
    "name": "FRAISE SAUVAGE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 204,
    "stock": 109,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FRAISE SAUVAGE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FRAISE SAUVAGE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FRAISE SAUVAGE.jpg"
    ],
    "image": "/products/FRAISE SAUVAGE.jpg"
  },
  {
    "id": "framboise-63",
    "name": "FRAMBOISE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.8,
    "reviews": 102,
    "stock": 145,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FRAMBOISE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FRAMBOISE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FRAMBOISE.jpg"
    ],
    "image": "/products/FRAMBOISE.jpg"
  },
  {
    "id": "fruits-rouges-a-la-reglisse-64",
    "name": "FRUITS ROUGES A LA REGLISSE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 168,
    "stock": 78,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "FRUITS ROUGES A LA REGLISSE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez FRUITS ROUGES A LA REGLISSE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/FRUITS ROUGES A LA REGLISSE.jpg"
    ],
    "image": "/products/FRUITS ROUGES A LA REGLISSE.jpg"
  },
  {
    "id": "galette-des-rois-65",
    "name": "GALETTE DES ROIS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 217,
    "stock": 143,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GALETTE DES ROIS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GALETTE DES ROIS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GALETTE DES ROIS.jpg"
    ],
    "image": "/products/GALETTE DES ROIS.jpg"
  },
  {
    "id": "granite-melon-66",
    "name": "GRANITE MELON",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 223,
    "stock": 110,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GRANITE MELON"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GRANITE MELON, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GRANITE MELON.jpg"
    ],
    "image": "/products/GRANITE MELON.jpg"
  },
  {
    "id": "grege-1-67",
    "name": "GREGE 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 66,
    "stock": 5,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GREGE 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GREGE 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GREGE-1.jpg"
    ],
    "image": "/products/GREGE-1.jpg"
  },
  {
    "id": "grege-68",
    "name": "GREGE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 180,
    "stock": 61,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GREGE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GREGE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GREGE.jpg"
    ],
    "image": "/products/GREGE.jpg"
  },
  {
    "id": "gt-core-69",
    "name": "GT CORE",
    "category": "accessoire",
    "brand": "THEKLOPE",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 240,
    "stock": 108,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GT CORE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/GT CORE.jpg"
    ],
    "image": "/products/GT CORE.jpg"
  },
  {
    "id": "gtx-70",
    "name": "GTX",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.3,
    "reviews": 217,
    "stock": 91,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GTX"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GTX, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GTX.jpg"
    ],
    "image": "/products/GTX.jpg"
  },
  {
    "id": "guapore-71",
    "name": "GUAPORE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 186,
    "stock": 144,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "GUAPORE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez GUAPORE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/GUAPORE.jpg"
    ],
    "image": "/products/GUAPORE.jpg"
  },
  {
    "id": "haghnar-72",
    "name": "HAGHNAR",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 76,
    "stock": 130,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "HAGHNAR"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez HAGHNAR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/HAGHNAR.jpg"
    ],
    "image": "/products/HAGHNAR.jpg"
  },
  {
    "id": "hizagiri-73",
    "name": "HIZAGIRI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 152,
    "stock": 144,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "HIZAGIRI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez HIZAGIRI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/HIZAGIRI.jpg"
    ],
    "image": "/products/HIZAGIRI.jpg"
  },
  {
    "id": "hogano-74",
    "name": "HOGANO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 23,
    "stock": 90,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "HOGANO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez HOGANO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/HOGANO.jpg"
    ],
    "image": "/products/HOGANO.jpg"
  },
  {
    "id": "huallaga-75",
    "name": "HUALLAGA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 239,
    "stock": 51,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "HUALLAGA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez HUALLAGA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/HUALLAGA.jpg"
    ],
    "image": "/products/HUALLAGA.jpg"
  },
  {
    "id": "irrow-76",
    "name": "IRROW",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 32,
    "stock": 109,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "IRROW"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez IRROW, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/IRROW.jpg"
    ],
    "image": "/products/IRROW.jpg"
  },
  {
    "id": "japura-77",
    "name": "JAPURA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.8,
    "reviews": 162,
    "stock": 64,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "JAPURA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez JAPURA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/JAPURA.jpg"
    ],
    "image": "/products/JAPURA.jpg"
  },
  {
    "id": "kami-78",
    "name": "KAMI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 155,
    "stock": 63,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "KAMI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez KAMI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/KAMI.jpg"
    ],
    "image": "/products/KAMI.jpg"
  },
  {
    "id": "katana-79",
    "name": "KATANA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 29,
    "stock": 40,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "KATANA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez KATANA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/KATANA.jpg"
    ],
    "image": "/products/KATANA.jpg"
  },
  {
    "id": "king-3bk-80",
    "name": "KING 3BK",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 24,
    "stock": 58,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "KING 3BK"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez KING 3BK, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/KING 3BK.jpg"
    ],
    "image": "/products/KING 3BK.jpg"
  },
  {
    "id": "kit-zelos-81",
    "name": "KIT ZELOS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 161,
    "stock": 103,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "KIT ZELOS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez KIT ZELOS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/KIT ZELOS.jpg"
    ],
    "image": "/products/KIT ZELOS.jpg"
  },
  {
    "id": "kuroko-82",
    "name": "KUROKO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 83,
    "stock": 139,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "KUROKO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez KUROKO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/KUROKO.jpg"
    ],
    "image": "/products/KUROKO.jpg"
  },
  {
    "id": "kit-aegis-legend-5-et-z-subohm-5-geekvape-83",
    "name": "Kit Aegis Legend 5 Et Z Subohm 5 GeekVape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 30,
    "stock": 90,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Aegis Legend 5 Et Z Subohm 5 GeekVape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Aegis Legend 5 et Z Subohm 5 - GeekVape.jpg"
    ],
    "image": "/products/Kit Aegis Legend 5 et Z Subohm 5 - GeekVape.jpg"
  },
  {
    "id": "kit-aegis-max-2-max-100-geekvape-84",
    "name": "Kit Aegis Max 2 (Max 100) GeekVape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": 71.9,
    "rating": 4.5,
    "reviews": 16,
    "stock": 126,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Aegis Max 2 (Max 100) GeekVape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Aegis Max 2 (Max 100) - GeekVape.jpg"
    ],
    "image": "/products/Kit Aegis Max 2 (Max 100) - GeekVape.jpg"
  },
  {
    "id": "kit-armour-g-mtl-vaporesso-85",
    "name": "Kit Armour G MTL Vaporesso",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 198,
    "stock": 32,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Armour G MTL Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Armour G MTL - Vaporesso.jpg"
    ],
    "image": "/products/Kit Armour G MTL - Vaporesso.jpg"
  },
  {
    "id": "kit-armour-gs-dtl-vaporesso-86",
    "name": "Kit Armour GS DTL Vaporesso",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 236,
    "stock": 5,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Armour GS DTL Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Armour GS  DTL - Vaporesso.jpg"
    ],
    "image": "/products/Kit Armour GS  DTL - Vaporesso.jpg"
  },
  {
    "id": "kit-coolfire-z60-avec-zlide-top-innokin-87",
    "name": "Kit CoolFire Z60 Avec Zlide Top Innokin",
    "category": "ecig",
    "brand": "Innokin",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 184,
    "stock": 28,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit CoolFire Z60 Avec Zlide Top Innokin, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit CoolFire Z60 avec Zlide Top - Innokin.png"
    ],
    "image": "/products/Kit CoolFire Z60 avec Zlide Top - Innokin.png"
  },
  {
    "id": "kit-coolfire-z80-zenith-ii-innokin-88",
    "name": "Kit Coolfire Z80 Zenith II Innokin",
    "category": "ecig",
    "brand": "Innokin",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": 47.9,
    "rating": 4.5,
    "reviews": 243,
    "stock": 71,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Coolfire Z80 Zenith II Innokin, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Coolfire Z80 Zenith II - Innokin.jpg"
    ],
    "image": "/products/Kit Coolfire Z80 Zenith II - Innokin.jpg"
  },
  {
    "id": "kit-digi-max-geekvape-89",
    "name": "Kit Digi Max GeekVape",
    "category": "eliquide",
    "brand": "Geekvape",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 175,
    "stock": 44,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Kit Digi Max GeekVape"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Digi Max GeekVape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Kit Digi Max - GeekVape.jpg"
    ],
    "image": "/products/Kit Digi Max - GeekVape.jpg"
  },
  {
    "id": "kit-gtx-one-pro-vaporesso-90",
    "name": "Kit GTX One Pro Vaporesso",
    "category": "eliquide",
    "brand": "Vaporesso",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 92,
    "stock": 144,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Kit GTX One Pro Vaporesso"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit GTX One Pro Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Kit GTX One Pro - Vaporesso.jpg"
    ],
    "image": "/products/Kit GTX One Pro - Vaporesso.jpg"
  },
  {
    "id": "kit-q16-pro-plus-justfog-91",
    "name": "Kit Q16 Pro Plus Justfog",
    "category": "ecig",
    "brand": "Justfog",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 197,
    "stock": 68,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Q16 Pro Plus Justfog, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Q16 Pro Plus - Justfog.jpg"
    ],
    "image": "/products/Kit Q16 Pro Plus - Justfog.jpg"
  },
  {
    "id": "kit-soul-2-geekvape-92",
    "name": "Kit Soul 2 GeekVape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": 47.9,
    "rating": 4.8,
    "reviews": 66,
    "stock": 45,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kit Soul 2 GeekVape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Kit Soul 2 - GeekVape.jpg"
    ],
    "image": "/products/Kit Soul 2 - GeekVape.jpg"
  },
  {
    "id": "la-derniere-seance-1-93",
    "name": "LA DERNIERE SEANCE 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 198,
    "stock": 52,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LA DERNIERE SEANCE 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LA DERNIERE SEANCE 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LA DERNIERE SEANCE-1.jpg"
    ],
    "image": "/products/LA DERNIERE SEANCE-1.jpg"
  },
  {
    "id": "la-derniere-seance-94",
    "name": "LA DERNIERE SEANCE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 175,
    "stock": 22,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LA DERNIERE SEANCE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LA DERNIERE SEANCE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LA DERNIERE SEANCE.jpg"
    ],
    "image": "/products/LA DERNIERE SEANCE.jpg"
  },
  {
    "id": "la-petite-chose-95",
    "name": "LA PETITE CHOSE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 189,
    "stock": 55,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LA PETITE CHOSE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LA PETITE CHOSE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LA PETITE CHOSE.jpg"
    ],
    "image": "/products/LA PETITE CHOSE.jpg"
  },
  {
    "id": "lady-shigeri-96",
    "name": "LADY SHIGERI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 14,
    "stock": 56,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LADY SHIGERI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LADY SHIGERI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LADY SHIGERI.jpg"
    ],
    "image": "/products/LADY SHIGERI.jpg"
  },
  {
    "id": "lava-red-97",
    "name": "LAVA RED",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 177,
    "stock": 68,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LAVA RED"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LAVA RED, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LAVA RED.jpg"
    ],
    "image": "/products/LAVA RED.jpg"
  },
  {
    "id": "le-mille-feuille-98",
    "name": "LE MILLE FEUILLE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.5,
    "reviews": 20,
    "stock": 73,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LE MILLE FEUILLE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LE MILLE FEUILLE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LE MILLE FEUILLE.jpg"
    ],
    "image": "/products/LE MILLE FEUILLE.jpg"
  },
  {
    "id": "le-neutre-99",
    "name": "LE NEUTRE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 127,
    "stock": 117,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LE NEUTRE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LE NEUTRE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LE NEUTRE.jpg"
    ],
    "image": "/products/LE NEUTRE.jpg"
  },
  {
    "id": "le-the-a-la-menthe-100",
    "name": "LE THE A LA MENTHE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 76,
    "stock": 136,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LE THE A LA MENTHE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LE THE A LA MENTHE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LE THE A LA MENTHE.jpg"
    ],
    "image": "/products/LE THE A LA MENTHE.jpg"
  },
  {
    "id": "le-tiramisu-101",
    "name": "LE TIRAMISU",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 212,
    "stock": 125,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LE TIRAMISU"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LE TIRAMISU, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LE TIRAMISU.jpg"
    ],
    "image": "/products/LE TIRAMISU.jpg"
  },
  {
    "id": "lemon-tart-dinner-lady-102",
    "name": "LEMON TART DINNER LADY",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 37,
    "stock": 18,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LEMON TART DINNER LADY"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LEMON TART DINNER LADY, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LEMON TART DINNER LADY.jpg"
    ],
    "image": "/products/LEMON TART DINNER LADY.jpg"
  },
  {
    "id": "lemonade-on-ice-103",
    "name": "LEMONADE ON ICE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 119,
    "stock": 24,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LEMONADE ON ICE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LEMONADE ON ICE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LEMONADE ON ICE.jpg"
    ],
    "image": "/products/LEMONADE ON ICE.jpg"
  },
  {
    "id": "liquidarom-mojito-fraise-104",
    "name": "LIQUIDAROM MOJITO FRAISE",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 247,
    "stock": 37,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LIQUIDAROM MOJITO FRAISE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LIQUIDAROM MOJITO FRAISE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LIQUIDAROM MOJITO FRAISE.jpg"
    ],
    "image": "/products/LIQUIDAROM MOJITO FRAISE.jpg"
  },
  {
    "id": "luxe-2-105",
    "name": "LUXE 2",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 98,
    "stock": 86,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "LUXE 2"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez LUXE 2, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/LUXE 2.jpg"
    ],
    "image": "/products/LUXE 2.jpg"
  },
  {
    "id": "liquidarom-fraise-00-mg-ml-106",
    "name": "Liquidarom Fraise (00 Mg ML)",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 157,
    "stock": 137,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Liquidarom Fraise (00  ML)"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Liquidarom Fraise (00 Mg ML), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Liquidarom - Fraise (00 mg-mL).png"
    ],
    "image": "/products/Liquidarom - Fraise (00 mg-mL).png"
  },
  {
    "id": "liquidarom-fraise-kiwi-paste-que-00-mg-ml-10-ml-107",
    "name": "Liquidarom Fraise Kiwi Pastèque (00 Mg ML, 10 ML)",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 94,
    "stock": 32,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Liquidarom Fraise Kiwi Pastèque (00  ML, 10 ML)"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Liquidarom Fraise Kiwi Pastèque (00 Mg ML, 10 ML), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Liquidarom - Fraise Kiwi Pastèque (00 mg-mL, 10 mL).png"
    ],
    "image": "/products/Liquidarom - Fraise Kiwi Pastèque (00 mg-mL, 10 mL).png"
  },
  {
    "id": "liquidarom-framboise-bleue-00-mg-ml-10-ml-108",
    "name": "Liquidarom Framboise Bleue (00 Mg ML, 10 ML)",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 67,
    "stock": 30,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Liquidarom Framboise Bleue (00  ML, 10 ML)"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Liquidarom Framboise Bleue (00 Mg ML, 10 ML), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Liquidarom - Framboise bleue (00 mg-mL, 10 mL).png"
    ],
    "image": "/products/Liquidarom - Framboise bleue (00 mg-mL, 10 mL).png"
  },
  {
    "id": "macada-miam-109",
    "name": "MACADA MIAM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 44,
    "stock": 9,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MACADA MIAM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MACADA MIAM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MACADA MIAM.jpg"
    ],
    "image": "/products/MACADA MIAM.jpg"
  },
  {
    "id": "macada-miam-110",
    "name": "MACADA MIAM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 146,
    "stock": 98,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MACADA MIAM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MACADA MIAM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MACADA-MIAM.jpg"
    ],
    "image": "/products/MACADA-MIAM.jpg"
  },
  {
    "id": "machado-111",
    "name": "MACHADO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 240,
    "stock": 43,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MACHADO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MACHADO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MACHADO.jpg"
    ],
    "image": "/products/MACHADO.jpg"
  },
  {
    "id": "major-112",
    "name": "MAJOR",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.3,
    "reviews": 101,
    "stock": 45,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MAJOR"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MAJOR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MAJOR.jpg"
    ],
    "image": "/products/MAJOR.jpg"
  },
  {
    "id": "malaisian-bomb-1-113",
    "name": "MALAISIAN BOMB 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 156,
    "stock": 115,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MALAISIAN BOMB 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MALAISIAN BOMB 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MALAISIAN BOMB-1.jpg"
    ],
    "image": "/products/MALAISIAN BOMB-1.jpg"
  },
  {
    "id": "malaisian-bomb-114",
    "name": "MALAISIAN BOMB",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 207,
    "stock": 15,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MALAISIAN BOMB"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MALAISIAN BOMB, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MALAISIAN BOMB.jpg"
    ],
    "image": "/products/MALAISIAN BOMB.jpg"
  },
  {
    "id": "mangue-abricot-115",
    "name": "MANGUE ABRICOT",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 192,
    "stock": 110,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MANGUE ABRICOT"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MANGUE ABRICOT, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MANGUE-ABRICOT.jpg"
    ],
    "image": "/products/MANGUE-ABRICOT.jpg"
  },
  {
    "id": "mantaro-116",
    "name": "MANTARO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 101,
    "stock": 103,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MANTARO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MANTARO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MANTARO.jpg"
    ],
    "image": "/products/MANTARO.jpg"
  },
  {
    "id": "mawashi-117",
    "name": "MAWASHI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 113,
    "stock": 136,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MAWASHI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MAWASHI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MAWASHI.jpg"
    ],
    "image": "/products/MAWASHI.jpg"
  },
  {
    "id": "meche-t2-118",
    "name": "MECHE T2",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 171,
    "stock": 37,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MECHE T2"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MECHE T2, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MECHE T2.jpg"
    ],
    "image": "/products/MECHE T2.jpg"
  },
  {
    "id": "menthe-chlorophylle-119",
    "name": "MENTHE CHLOROPHYLLE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 22,
    "stock": 69,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE CHLOROPHYLLE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE CHLOROPHYLLE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE CHLOROPHYLLE.jpg"
    ],
    "image": "/products/MENTHE CHLOROPHYLLE.jpg"
  },
  {
    "id": "menthe-fraiche-1-120",
    "name": "MENTHE FRAICHE 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 153,
    "stock": 16,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE FRAICHE 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE FRAICHE 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE FRAICHE-1.jpg"
    ],
    "image": "/products/MENTHE FRAICHE-1.jpg"
  },
  {
    "id": "menthe-fraiche-121",
    "name": "MENTHE FRAICHE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 155,
    "stock": 72,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE FRAICHE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE FRAICHE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE FRAICHE.jpg"
    ],
    "image": "/products/MENTHE FRAICHE.jpg"
  },
  {
    "id": "menthe-hollywood-122",
    "name": "MENTHE HOLLYWOOD",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 86,
    "stock": 57,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE HOLLYWOOD"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE HOLLYWOOD, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE HOLLYWOOD.jpg"
    ],
    "image": "/products/MENTHE HOLLYWOOD.jpg"
  },
  {
    "id": "menthe-hollywoood-123",
    "name": "MENTHE HOLLYWOOOD",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 44,
    "stock": 7,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE HOLLYWOOOD"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE HOLLYWOOOD, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE HOLLYWOOOD.jpg"
    ],
    "image": "/products/MENTHE HOLLYWOOOD.jpg"
  },
  {
    "id": "menthe-polaire-124",
    "name": "MENTHE POLAIRE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 70,
    "stock": 33,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MENTHE POLAIRE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MENTHE POLAIRE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MENTHE POLAIRE.jpg"
    ],
    "image": "/products/MENTHE POLAIRE.jpg"
  },
  {
    "id": "minasawa-125",
    "name": "MINASAWA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 164,
    "stock": 77,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MINASAWA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MINASAWA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MINASAWA.jpg"
    ],
    "image": "/products/MINASAWA.jpg"
  },
  {
    "id": "mozambique-126",
    "name": "MOZAMBIQUE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 68,
    "stock": 140,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MOZAMBIQUE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MOZAMBIQUE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MOZAMBIQUE.jpg"
    ],
    "image": "/products/MOZAMBIQUE.jpg"
  },
  {
    "id": "myrtille-givre-127",
    "name": "MYRTILLE GIVRE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 81,
    "stock": 120,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "MYRTILLE GIVRE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez MYRTILLE GIVRE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/MYRTILLE GIVRE.jpg"
    ],
    "image": "/products/MYRTILLE GIVRE.jpg"
  },
  {
    "id": "mistyk-128",
    "name": "Mistyk",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 176,
    "stock": 50,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Mistyk"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mistyk, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Mistyk.jpg"
    ],
    "image": "/products/Mistyk.jpg"
  },
  {
    "id": "nagashi-129",
    "name": "NAGASHI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 46,
    "stock": 36,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "NAGASHI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez NAGASHI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/NAGASHI.jpg"
    ],
    "image": "/products/NAGASHI.jpg"
  },
  {
    "id": "neutre-130",
    "name": "NEUTRE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 39,
    "stock": 111,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "NEUTRE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez NEUTRE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/NEUTRE.jpg"
    ],
    "image": "/products/NEUTRE.jpg"
  },
  {
    "id": "noisette-131",
    "name": "NOISETTE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 187,
    "stock": 125,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "NOISETTE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez NOISETTE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/NOISETTE.jpg"
    ],
    "image": "/products/NOISETTE.jpg"
  },
  {
    "id": "oni-132",
    "name": "ONI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 230,
    "stock": 28,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ONI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ONI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ONI.jpg"
    ],
    "image": "/products/ONI.jpg"
  },
  {
    "id": "opera-133",
    "name": "OPERA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 82,
    "stock": 136,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "OPERA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez OPERA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/OPERA.jpg"
    ],
    "image": "/products/OPERA.jpg"
  },
  {
    "id": "p-tit-beurre-134",
    "name": "P'TIT BEURRE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 239,
    "stock": 21,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "P'TIT BEURRE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez P'TIT BEURRE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/P'TIT BEURRE.jpg"
    ],
    "image": "/products/P'TIT BEURRE.jpg"
  },
  {
    "id": "pain-d-epices-135",
    "name": "PAIN D'EPICES",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 218,
    "stock": 106,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PAIN D'EPICES"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PAIN D'EPICES, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PAIN D'EPICES.jpg"
    ],
    "image": "/products/PAIN D'EPICES.jpg"
  },
  {
    "id": "paloma-136",
    "name": "PALOMA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 233,
    "stock": 19,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PALOMA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PALOMA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PALOMA.jpg"
    ],
    "image": "/products/PALOMA.jpg"
  },
  {
    "id": "paris-brest-137",
    "name": "PARIS BREST",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 54,
    "stock": 102,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PARIS BREST"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PARIS BREST, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PARIS BREST.jpg"
    ],
    "image": "/products/PARIS BREST.jpg"
  },
  {
    "id": "peau-de-peche-138",
    "name": "PEAU DE PECHE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 146,
    "stock": 23,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PEAU DE PECHE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PEAU DE PECHE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PEAU DE PECHE.jpg"
    ],
    "image": "/products/PEAU DE PECHE.jpg"
  },
  {
    "id": "peche-abricot-139",
    "name": "PECHE ABRICOT",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 128,
    "stock": 32,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PECHE ABRICOT"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PECHE ABRICOT, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PECHE-ABRICOT.jpg"
    ],
    "image": "/products/PECHE-ABRICOT.jpg"
  },
  {
    "id": "perle-de-coco-140",
    "name": "PERLE DE COCO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 204,
    "stock": 97,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PERLE DE COCO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PERLE DE COCO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PERLE DE COCO.jpg"
    ],
    "image": "/products/PERLE DE COCO.jpg"
  },
  {
    "id": "phoenix-141",
    "name": "PHOENIX",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 28,
    "stock": 35,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PHOENIX"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PHOENIX, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PHOENIX.jpg"
    ],
    "image": "/products/PHOENIX.jpg"
  },
  {
    "id": "player-142",
    "name": "PLAYER",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 59,
    "stock": 57,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PLAYER"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PLAYER, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PLAYER.jpg"
    ],
    "image": "/products/PLAYER.jpg"
  },
  {
    "id": "pocke-x-1-143",
    "name": "POCKE X 1",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 62,
    "stock": 122,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez POCKE X 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/POCKE X-1.jpg"
    ],
    "image": "/products/POCKE X-1.jpg"
  },
  {
    "id": "pocke-x-144",
    "name": "POCKE X",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": 47.9,
    "rating": 4.7,
    "reviews": 90,
    "stock": 120,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez POCKE X, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/POCKE X.jpg"
    ],
    "image": "/products/POCKE X.jpg"
  },
  {
    "id": "purple-beach-145",
    "name": "PURPLE BEACH",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 86,
    "stock": 149,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "PURPLE BEACH"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez PURPLE BEACH, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/PURPLE BEACH.jpg"
    ],
    "image": "/products/PURPLE BEACH.jpg"
  },
  {
    "id": "q16-pro-146",
    "name": "Q16 PRO",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 37,
    "stock": 113,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Q16 PRO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Q16 PRO.jpg"
    ],
    "image": "/products/Q16 PRO.jpg"
  },
  {
    "id": "q16-147",
    "name": "Q16",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 106,
    "stock": 24,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Q16, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/Q16.jpg"
    ],
    "image": "/products/Q16.jpg"
  },
  {
    "id": "ragnarok-148",
    "name": "RAGNAROK",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 166,
    "stock": 88,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "RAGNAROK"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez RAGNAROK, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/RAGNAROK.jpg"
    ],
    "image": "/products/RAGNAROK.jpg"
  },
  {
    "id": "red-astaire-50-ml-149",
    "name": "RED ASTAIRE 50 ML",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 10,
    "stock": 55,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "RED ASTAIRE 50 ML"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez RED ASTAIRE 50 ML, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/RED ASTAIRE 50 ML.jpg"
    ],
    "image": "/products/RED ASTAIRE 50 ML.jpg"
  },
  {
    "id": "red-pearl-150",
    "name": "RED PEARL",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 240,
    "stock": 10,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "RED PEARL"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez RED PEARL, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/RED PEARL.jpg"
    ],
    "image": "/products/RED PEARL.jpg"
  },
  {
    "id": "relax-151",
    "name": "RELAX",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 207,
    "stock": 92,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "RELAX"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez RELAX, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/RELAX.jpg"
    ],
    "image": "/products/RELAX.jpg"
  },
  {
    "id": "ry4-152",
    "name": "RY4",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 197,
    "stock": 36,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "RY4"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez RY4, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/RY4.jpg"
    ],
    "image": "/products/RY4.jpg"
  },
  {
    "id": "re-sistances-j-series-5pcs-geekvape-153",
    "name": "Résistances J Series (5pcs) GeekVape",
    "category": "eliquide",
    "brand": "Geekvape",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 88,
    "stock": 133,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Résistances J Series (5pcs) GeekVape"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Résistances J Series (5pcs) GeekVape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/Résistances  J Series (5pcs) - GeekVape.jpg"
    ],
    "image": "/products/Résistances  J Series (5pcs) - GeekVape.jpg"
  },
  {
    "id": "sacripant-154",
    "name": "SACRIPANT",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.8,
    "reviews": 164,
    "stock": 77,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SACRIPANT"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SACRIPANT, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SACRIPANT.jpg"
    ],
    "image": "/products/SACRIPANT.jpg"
  },
  {
    "id": "seiryuto-155",
    "name": "SEIRYUTO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 89,
    "stock": 36,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SEIRYUTO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SEIRYUTO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SEIRYUTO.jpg"
    ],
    "image": "/products/SEIRYUTO.jpg"
  },
  {
    "id": "senois-1-156",
    "name": "SENOIS 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 175,
    "stock": 58,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SENOIS 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SENOIS 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SENOIS-1.jpg"
    ],
    "image": "/products/SENOIS-1.jpg"
  },
  {
    "id": "senois-157",
    "name": "SENOIS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 191,
    "stock": 79,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SENOIS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SENOIS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SENOIS.jpg"
    ],
    "image": "/products/SENOIS.jpg"
  },
  {
    "id": "shaken-158",
    "name": "SHAKEN",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 165,
    "stock": 50,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SHAKEN"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SHAKEN, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SHAKEN.jpg"
    ],
    "image": "/products/SHAKEN.jpg"
  },
  {
    "id": "shigeri-159",
    "name": "SHIGERI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 229,
    "stock": 46,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SHIGERI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SHIGERI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SHIGERI.jpg"
    ],
    "image": "/products/SHIGERI.jpg"
  },
  {
    "id": "shinigami-160",
    "name": "SHINIGAMI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 93,
    "stock": 26,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SHINIGAMI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SHINIGAMI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SHINIGAMI.jpg"
    ],
    "image": "/products/SHINIGAMI.jpg"
  },
  {
    "id": "spartacus-161",
    "name": "SPARTACUS",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.9,
    "reviews": 63,
    "stock": 11,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SPARTACUS"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SPARTACUS, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SPARTACUS.jpg"
    ],
    "image": "/products/SPARTACUS.jpg"
  },
  {
    "id": "spring-break-162",
    "name": "SPRING BREAK",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 69,
    "stock": 21,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SPRING BREAK"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SPRING BREAK, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SPRING BREAK.jpg"
    ],
    "image": "/products/SPRING BREAK.jpg"
  },
  {
    "id": "stop-it-1-163",
    "name": "STOP IT 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 152,
    "stock": 61,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "STOP IT 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez STOP IT 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/STOP IT-1.jpg"
    ],
    "image": "/products/STOP IT-1.jpg"
  },
  {
    "id": "stop-it-164",
    "name": "STOP IT",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 26,
    "stock": 21,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "STOP IT"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez STOP IT, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/STOP IT.jpg"
    ],
    "image": "/products/STOP IT.jpg"
  },
  {
    "id": "subzero-1-165",
    "name": "SUBZERO 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 81,
    "stock": 134,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUBZERO 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUBZERO 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUBZERO-1.jpg"
    ],
    "image": "/products/SUBZERO-1.jpg"
  },
  {
    "id": "subzero-166",
    "name": "SUBZERO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 136,
    "stock": 66,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUBZERO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUBZERO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUBZERO.jpg"
    ],
    "image": "/products/SUBZERO.jpg"
  },
  {
    "id": "summer-time-167",
    "name": "SUMMER TIME",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 135,
    "stock": 6,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUMMER TIME"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUMMER TIME, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUMMER TIME.jpg"
    ],
    "image": "/products/SUMMER TIME.jpg"
  },
  {
    "id": "sun-bay-168",
    "name": "SUN BAY",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.5,
    "reviews": 81,
    "stock": 129,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUN BAY"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUN BAY, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUN BAY.jpg"
    ],
    "image": "/products/SUN BAY.jpg"
  },
  {
    "id": "sunset-lover-169",
    "name": "SUNSET LOVER",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 122,
    "stock": 25,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUNSET LOVER"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUNSET LOVER, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUNSET LOVER.jpg"
    ],
    "image": "/products/SUNSET LOVER.jpg"
  },
  {
    "id": "supreme-170",
    "name": "SUPREME",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 68,
    "stock": 89,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "SUPREME"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez SUPREME, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/SUPREME.jpg"
    ],
    "image": "/products/SUPREME.jpg"
  },
  {
    "id": "tennessee-171",
    "name": "TENNESSEE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 20,
    "stock": 23,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TENNESSEE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TENNESSEE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TENNESSEE.jpg"
    ],
    "image": "/products/TENNESSEE.jpg"
  },
  {
    "id": "the-pink-fat-gum-172",
    "name": "THE PINK FAT GUM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 17,
    "stock": 91,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "THE PINK FAT GUM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez THE PINK FAT GUM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/THE PINK FAT GUM.jpg"
    ],
    "image": "/products/THE PINK FAT GUM.jpg"
  },
  {
    "id": "the-thing-173",
    "name": "THE THING",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 69,
    "stock": 72,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "THE THING"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez THE THING, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/THE THING.jpg"
    ],
    "image": "/products/THE THING.jpg"
  },
  {
    "id": "treboulette-174",
    "name": "TREBOULETTE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 103,
    "stock": 52,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TREBOULETTE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TREBOULETTE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TREBOULETTE.jpg"
    ],
    "image": "/products/TREBOULETTE.jpg"
  },
  {
    "id": "tribeca-1-175",
    "name": "TRIBECA 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.8,
    "reviews": 118,
    "stock": 13,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TRIBECA 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TRIBECA 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TRIBECA-1.jpg"
    ],
    "image": "/products/TRIBECA-1.jpg"
  },
  {
    "id": "tribeca-176",
    "name": "TRIBECA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 46,
    "stock": 34,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TRIBECA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TRIBECA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TRIBECA.jpg"
    ],
    "image": "/products/TRIBECA.jpg"
  },
  {
    "id": "tropical-tempest-1-177",
    "name": "TROPICAL TEMPEST 1",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 111,
    "stock": 48,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TROPICAL TEMPEST 1"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TROPICAL TEMPEST 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TROPICAL TEMPEST-1.jpg"
    ],
    "image": "/products/TROPICAL TEMPEST-1.jpg"
  },
  {
    "id": "tropical-tempest-178",
    "name": "TROPICAL TEMPEST",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 143,
    "stock": 55,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TROPICAL TEMPEST"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TROPICAL TEMPEST, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TROPICAL TEMPEST.jpg"
    ],
    "image": "/products/TROPICAL TEMPEST.jpg"
  },
  {
    "id": "tropikania-179",
    "name": "TROPIKANIA",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 85,
    "stock": 133,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "TROPIKANIA"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez TROPIKANIA, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/TROPIKANIA.jpg"
    ],
    "image": "/products/TROPIKANIA.jpg"
  },
  {
    "id": "uraken-180",
    "name": "URAKEN",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 99,
    "stock": 81,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "URAKEN"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez URAKEN, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/URAKEN.jpg"
    ],
    "image": "/products/URAKEN.jpg"
  },
  {
    "id": "ushiro-181",
    "name": "USHIRO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 187,
    "stock": 22,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "USHIRO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez USHIRO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/USHIRO.jpg"
    ],
    "image": "/products/USHIRO.jpg"
  },
  {
    "id": "valkyrie-182",
    "name": "VALKYRIE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.4,
    "reviews": 51,
    "stock": 46,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "VALKYRIE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VALKYRIE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/VALKYRIE.jpg"
    ],
    "image": "/products/VALKYRIE.jpg"
  },
  {
    "id": "vanille-custard-183",
    "name": "VANILLE CUSTARD",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 46,
    "stock": 45,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "VANILLE CUSTARD"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VANILLE CUSTARD, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/VANILLE CUSTARD.jpg"
    ],
    "image": "/products/VANILLE CUSTARD.jpg"
  },
  {
    "id": "verveine-des-alpes-184",
    "name": "VERVEINE DES ALPES",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 23,
    "stock": 128,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "VERVEINE DES ALPES"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VERVEINE DES ALPES, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/VERVEINE DES ALPES.jpg"
    ],
    "image": "/products/VERVEINE DES ALPES.jpg"
  },
  {
    "id": "verveine-pamplemousse-rose-185",
    "name": "VERVEINE PAMPLEMOUSSE ROSE",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 181,
    "stock": 9,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "VERVEINE PAMPLEMOUSSE ROSE"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VERVEINE PAMPLEMOUSSE ROSE, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/VERVEINE PAMPLEMOUSSE ROSE.jpg"
    ],
    "image": "/products/VERVEINE PAMPLEMOUSSE ROSE.jpg"
  },
  {
    "id": "vinci-pnp-186",
    "name": "VINCI PNP",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 48,
    "stock": 99,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VINCI PNP, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/VINCI PNP.jpg"
    ],
    "image": "/products/VINCI PNP.jpg"
  },
  {
    "id": "voopoo-tpp-187",
    "name": "VOOPOO TPP",
    "category": "accessoire",
    "brand": "Voopoo",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 84,
    "stock": 37,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez VOOPOO TPP, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/VOOPOO TPP.jpg"
    ],
    "image": "/products/VOOPOO TPP.jpg"
  },
  {
    "id": "yamakasi-188",
    "name": "YAMAKASI",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 105,
    "stock": 99,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "YAMAKASI"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez YAMAKASI, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/YAMAKASI.jpg"
    ],
    "image": "/products/YAMAKASI.jpg"
  },
  {
    "id": "yuko-189",
    "name": "YUKO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.6,
    "reviews": 240,
    "stock": 62,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "YUKO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez YUKO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/YUKO.jpg"
    ],
    "image": "/products/YUKO.jpg"
  },
  {
    "id": "zenith-pro-190",
    "name": "ZENITH PRO",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 103,
    "stock": 34,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ZENITH PRO"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ZENITH PRO, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ZENITH PRO.jpg"
    ],
    "image": "/products/ZENITH PRO.jpg"
  },
  {
    "id": "zenith-191",
    "name": "ZENITH",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 54,
    "stock": 79,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ZENITH"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ZENITH, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ZENITH.jpg"
    ],
    "image": "/products/ZENITH.jpg"
  },
  {
    "id": "zeus-subohm-192",
    "name": "ZEUS SUBOHM",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 164,
    "stock": 95,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "ZEUS SUBOHM"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez ZEUS SUBOHM, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ZEUS SUBOHM.jpg"
    ],
    "image": "/products/ZEUS SUBOHM.jpg"
  },
  {
    "id": "liquidarom-framboise-00-mg-ml-10-ml-193",
    "name": "Liquidarom Framboise (00 Mg ML, 10 ML)",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 70,
    "stock": 112,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Liquidarom Framboise (00  ML, 10 ML)"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Liquidarom Framboise (00 Mg ML, 10 ML), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/____Liquidarom - Framboise (00 mg-mL, 10 mL).png"
    ],
    "image": "/products/____Liquidarom - Framboise (00 mg-mL, 10 mL).png"
  },
  {
    "id": "california-10ml-194",
    "name": "California 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 24,
    "stock": 108,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "California"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez California 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-california-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-california-10ml.png"
  },
  {
    "id": "fr-k-10ml-195",
    "name": "Fr K 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 106,
    "stock": 30,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fr K"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fr K 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-fr-k-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-fr-k-10ml.png"
  },
  {
    "id": "fr-m-10ml-196",
    "name": "Fr M 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.5,
    "reviews": 98,
    "stock": 126,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fr M"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fr M 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-fr-m-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-fr-m-10ml.png"
  },
  {
    "id": "fr-w-10ml-197",
    "name": "Fr W 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 196,
    "stock": 133,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fr W"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fr W 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-fr-w-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-fr-w-10ml.png"
  },
  {
    "id": "fr4-10ml-198",
    "name": "Fr4 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 108,
    "stock": 49,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fr4"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fr4 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-fr4-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-fr4-10ml.png"
  },
  {
    "id": "fr5-10ml-199",
    "name": "Fr5 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 117,
    "stock": 21,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fr5"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fr5 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-fr5-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-fr5-10ml.png"
  },
  {
    "id": "malawia-10ml-200",
    "name": "Malawia 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 217,
    "stock": 69,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Malawia"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Malawia 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-malawia-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-malawia-10ml.png"
  },
  {
    "id": "usa-mix-10ml-201",
    "name": "Usa Mix 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 226,
    "stock": 149,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Usa Mix"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Usa Mix 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-classique-usa-mix-10ml.png"
    ],
    "image": "/products/alfaliquid-classique-usa-mix-10ml.png"
  },
  {
    "id": "fraicheur-menthe-fraiche-10ml-202",
    "name": "Fraicheur Menthe Fraiche 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 179,
    "stock": 136,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fraicheur Menthe Fraiche"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraicheur Menthe Fraiche 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-fraicheur-menthe-fraiche-10ml.png"
    ],
    "image": "/products/alfaliquid-fraicheur-menthe-fraiche-10ml.png"
  },
  {
    "id": "fraicheur-menthe-glaciale-10ml-203",
    "name": "Fraicheur Menthe Glaciale 10ml",
    "category": "eliquide",
    "brand": "Alfaliquid",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 183,
    "stock": 125,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fraicheur Menthe Glaciale"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraicheur Menthe Glaciale 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/alfaliquid-fraicheur-menthe-glaciale-10ml.png"
    ],
    "image": "/products/alfaliquid-fraicheur-menthe-glaciale-10ml.png"
  },
  {
    "id": "anis-51-10ml-204",
    "name": "Anis 51 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 130,
    "stock": 94,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Anis 51"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Anis 51 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/anis-51-10ml.jpg"
    ],
    "image": "/products/anis-51-10ml.jpg"
  },
  {
    "id": "anis-51-50ml-0mg-205",
    "name": "Anis 51 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.6,
    "reviews": 149,
    "stock": 111,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Anis 51"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Anis 51 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/anis-51-50ml-0mg.jpg"
    ],
    "image": "/products/anis-51-50ml-0mg.jpg"
  },
  {
    "id": "bairy-50ml-206",
    "name": "Bairy 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 174,
    "stock": 67,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Bairy"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Bairy 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/bairy-50ml-.jpg"
    ],
    "image": "/products/bairy-50ml-.jpg"
  },
  {
    "id": "berry-fresh-10ml-207",
    "name": "Berry Fresh 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 150,
    "stock": 73,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Berry Fresh"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Berry Fresh 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/berry-fresh-10ml.jpg"
    ],
    "image": "/products/berry-fresh-10ml.jpg"
  },
  {
    "id": "blondy-50ml-208",
    "name": "Blondy 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 46,
    "stock": 140,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Blondy"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Blondy 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/blondy-50ml-.jpg"
    ],
    "image": "/products/blondy-50ml-.jpg"
  },
  {
    "id": "cafe-liquid-arom-209",
    "name": "Cafe Liquid Arom",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 172,
    "stock": 45,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Cafe Liquid Arom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Cafe Liquid Arom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/cafe-liquid-arom.jpg"
    ],
    "image": "/products/cafe-liquid-arom.jpg"
  },
  {
    "id": "caffe-latte-50ml-0mg-210",
    "name": "Caffe Latte 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.3,
    "reviews": 95,
    "stock": 85,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Caffe Latte"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Caffe Latte 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/caffe-latte-50ml-0mg.jpg"
    ],
    "image": "/products/caffe-latte-50ml-0mg.jpg"
  },
  {
    "id": "caramel-toffee-10ml-211",
    "name": "Caramel Toffee 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 90,
    "stock": 58,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Caramel Toffee"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Caramel Toffee 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/caramel-toffee-10ml.jpg"
    ],
    "image": "/products/caramel-toffee-10ml.jpg"
  },
  {
    "id": "apex-5ml-par-2-vaporesso-212",
    "name": "Apex 5ml Par 2 Vaporesso",
    "category": "accessoire",
    "brand": "Vaporesso",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 16,
    "stock": 135,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Apex 5ml Par 2 Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/cartouches-apex-5ml-par-2-vaporesso.jpg"
    ],
    "image": "/products/cartouches-apex-5ml-par-2-vaporesso.jpg"
  },
  {
    "id": "argus-pod-3ml-3pcs-voopoo-213",
    "name": "Argus Pod 3ml 3pcs Voopoo",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 62,
    "stock": 109,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Argus Pod 3ml 3pcs Voopoo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/cartouches-argus-pod-3ml-3pcs-voopoo.jpg"
    ],
    "image": "/products/cartouches-argus-pod-3ml-3pcs-voopoo.jpg"
  },
  {
    "id": "luxe-q2-3ml-4pcs-vaporesso-214",
    "name": "Luxe Q2 3ml 4pcs Vaporesso",
    "category": "accessoire",
    "brand": "Vaporesso",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 205,
    "stock": 53,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Luxe Q2 3ml 4pcs Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/cartouches-luxe-q2-3ml-4pcs-vaporesso.png"
    ],
    "image": "/products/cartouches-luxe-q2-3ml-4pcs-vaporesso.png"
  },
  {
    "id": "soul-par-2-geekvape-215",
    "name": "Soul Par 2 Geekvape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 121,
    "stock": 71,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Soul Par 2 Geekvape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/cartouches-soul-par-2-geekvape.jpg"
    ],
    "image": "/products/cartouches-soul-par-2-geekvape.jpg"
  },
  {
    "id": "cerise-griotte-10ml-216",
    "name": "Cerise Griotte 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 21,
    "stock": 28,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Cerise Griotte"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Cerise Griotte 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/cerise-griotte-10ml.jpg"
    ],
    "image": "/products/cerise-griotte-10ml.jpg"
  },
  {
    "id": "cerise-griotte-50ml-0mg-217",
    "name": "Cerise Griotte 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 203,
    "stock": 72,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Cerise Griotte"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Cerise Griotte 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/cerise-griotte-50ml-0mg.jpg"
    ],
    "image": "/products/cerise-griotte-50ml-0mg.jpg"
  },
  {
    "id": "citron-lime-10ml-218",
    "name": "Citron Lime 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 126,
    "stock": 71,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Citron Lime"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Citron Lime 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/citron-lime-10ml.jpg"
    ],
    "image": "/products/citron-lime-10ml.jpg"
  },
  {
    "id": "citron-lime-50ml-0mg-1-219",
    "name": "Citron Lime 50ml 0mg (1)",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 184,
    "stock": 146,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Citron Lime   (1)"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Citron Lime 50ml 0mg (1), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/citron-lime-50ml-0mg (1).jpg"
    ],
    "image": "/products/citron-lime-50ml-0mg (1).jpg"
  },
  {
    "id": "citron-lime-50ml-0mg-220",
    "name": "Citron Lime 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.4,
    "reviews": 132,
    "stock": 7,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Citron Lime"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Citron Lime 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/citron-lime-50ml-0mg.jpg"
    ],
    "image": "/products/citron-lime-50ml-0mg.jpg"
  },
  {
    "id": "citron-pasteque-50ml-ice-cool-by-liquidarom-221",
    "name": "Citron Pasteque 50ml Ice Cool By Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 17,
    "stock": 130,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Citron Pasteque  Ice Cool By Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Citron Pasteque 50ml Ice Cool By Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/citron-pasteque-50ml-ice-cool-by-liquidarom.jpg"
    ],
    "image": "/products/citron-pasteque-50ml-ice-cool-by-liquidarom.jpg"
  },
  {
    "id": "coup-de-coeur-60ml-petit-nuage-222",
    "name": "Coup De Coeur 60ml Petit Nuage",
    "category": "eliquide",
    "brand": "Petit Nuage",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 40,
    "stock": 82,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Coup De Coeur  Petit Nuage"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Coup De Coeur 60ml Petit Nuage, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "60 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/coup-de-coeur-60ml-petit-nuage.jpg"
    ],
    "image": "/products/coup-de-coeur-60ml-petit-nuage.jpg"
  },
  {
    "id": "dragigus-10ml-x10-223",
    "name": "Dragigus 10ml X10",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 149,
    "stock": 116,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Dragigus  X10"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Dragigus 10ml X10, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/dragigus-10ml-x10.jpg"
    ],
    "image": "/products/dragigus-10ml-x10.jpg"
  },
  {
    "id": "dragoo-50ml-224",
    "name": "Dragoo 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 185,
    "stock": 22,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Dragoo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Dragoo 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/dragoo-50ml-.jpg"
    ],
    "image": "/products/dragoo-50ml-.jpg"
  },
  {
    "id": "caramel-10ml-liquidarom-225",
    "name": "Caramel 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 23,
    "stock": 40,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Caramel  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Caramel 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-caramel-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-caramel-10ml-liquidarom.jpg"
  },
  {
    "id": "fruits-rouges-10ml-liquidarom-226",
    "name": "Fruits Rouges 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 180,
    "stock": 88,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fruits Rouges  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fruits Rouges 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-fruits-rouges-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-fruits-rouges-10ml-liquidarom.jpg"
  },
  {
    "id": "fruits-rouges-givres-10ml-liquidarom-227",
    "name": "Fruits Rouges Givres 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 246,
    "stock": 19,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fruits Rouges Givres  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fruits Rouges Givres 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-fruits-rouges-givres-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-fruits-rouges-givres-10ml-liquidarom.jpg"
  },
  {
    "id": "gold-blend-10ml-liquidarom-228",
    "name": "Gold Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 228,
    "stock": 95,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Gold Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gold Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-gold-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-gold-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "grenade-fruit-du-dragon-10ml-liquidarom-229",
    "name": "Grenade Fruit Du Dragon 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 166,
    "stock": 144,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Grenade Fruit Du Dragon  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Grenade Fruit Du Dragon 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-grenade-fruit-du-dragon-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-grenade-fruit-du-dragon-10ml-liquidarom.jpg"
  },
  {
    "id": "k-blend-10ml-liquidarom-230",
    "name": "K Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 56,
    "stock": 133,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "K Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez K Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-k-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-k-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "m-blend-liquidarom-231",
    "name": "M Blend Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.7,
    "reviews": 192,
    "stock": 139,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "M Blend Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez M Blend Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-m-blend-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-m-blend-liquidarom.jpg"
  },
  {
    "id": "menthe-fraiche-10ml-liquidarom-232",
    "name": "Menthe Fraiche 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 236,
    "stock": 65,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Menthe Fraiche  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Menthe Fraiche 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-menthe-fraiche-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-menthe-fraiche-10ml-liquidarom.jpg"
  },
  {
    "id": "menthe-hollywood-10ml-liquidarom-233",
    "name": "Menthe Hollywood 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 51,
    "stock": 108,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Menthe Hollywood  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Menthe Hollywood 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-menthe-hollywood-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-menthe-hollywood-10ml-liquidarom.jpg"
  },
  {
    "id": "menthe-polaire-10ml-liquidarom-234",
    "name": "Menthe Polaire 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 27,
    "stock": 62,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Menthe Polaire  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Menthe Polaire 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-menthe-polaire-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-menthe-polaire-10ml-liquidarom.jpg"
  },
  {
    "id": "mojito-10ml-liquidarom-235",
    "name": "Mojito 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 71,
    "stock": 45,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Mojito  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mojito 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-mojito-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-mojito-10ml-liquidarom.jpg"
  },
  {
    "id": "noisette-10ml-liquidarom-236",
    "name": "Noisette 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 216,
    "stock": 29,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Noisette  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Noisette 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-noisette-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-noisette-10ml-liquidarom.jpg"
  },
  {
    "id": "peche-10ml-liquidarom-237",
    "name": "Peche 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 137,
    "stock": 130,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Peche  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Peche 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-peche-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-peche-10ml-liquidarom.jpg"
  },
  {
    "id": "phm-blend-10ml-liquidarom-238",
    "name": "Phm Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": 6.9,
    "rating": 4.8,
    "reviews": 131,
    "stock": 17,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Phm Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Phm Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-phm-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-phm-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "robusto-blend-10ml-liquidarom-239",
    "name": "Robusto Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 125,
    "stock": 43,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Robusto Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Robusto Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-robusto-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-robusto-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "silver-blend-10ml-liquidarom-240",
    "name": "Silver Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 28,
    "stock": 8,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Silver Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Silver Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-silver-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-silver-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "usa-mix-blend-10ml-liquidarom-241",
    "name": "Usa Mix Blend 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 136,
    "stock": 110,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Usa Mix Blend  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Usa Mix Blend 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-usa-mix-blend-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-usa-mix-blend-10ml-liquidarom.jpg"
  },
  {
    "id": "vanille-custard-10ml-liquidarom-242",
    "name": "Vanille Custard 10ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 213,
    "stock": 13,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Vanille Custard  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Vanille Custard 10ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/e-liquide-vanille-custard-10ml-liquidarom.jpg"
    ],
    "image": "/products/e-liquide-vanille-custard-10ml-liquidarom.jpg"
  },
  {
    "id": "eclats-de-noisettes-50ml-0mg-243",
    "name": "Eclats De Noisettes 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 39,
    "stock": 90,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Eclats De Noisettes"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Eclats De Noisettes 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/eclats-de-noisettes-50ml-0mg.jpg"
    ],
    "image": "/products/eclats-de-noisettes-50ml-0mg.jpg"
  },
  {
    "id": "etoiles-filantes-60ml-petit-nuage-244",
    "name": "Etoiles Filantes 60ml Petit Nuage",
    "category": "eliquide",
    "brand": "Petit Nuage",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 102,
    "stock": 60,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Etoiles Filantes  Petit Nuage"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Etoiles Filantes 60ml Petit Nuage, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "60 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/etoiles-filantes-60ml-petit-nuage.jpg"
    ],
    "image": "/products/etoiles-filantes-60ml-petit-nuage.jpg"
  },
  {
    "id": "extra-fruits-rouges-50ml-ice-cool-by-liquid-arom-245",
    "name": "Extra Fruits Rouges 50ml Ice Cool By Liquid Arom",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.5,
    "reviews": 131,
    "stock": 74,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Extra Fruits Rouges  Ice Cool By Liquid Arom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Extra Fruits Rouges 50ml Ice Cool By Liquid Arom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/extra-fruits-rouges-50ml-ice-cool-by-liquid-arom.jpg"
    ],
    "image": "/products/extra-fruits-rouges-50ml-ice-cool-by-liquid-arom.jpg"
  },
  {
    "id": "fraise-framboise-basilic-50ml-ice-cool-by-liquidarom-246",
    "name": "Fraise Framboise Basilic 50ml Ice Cool By Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 25,
    "stock": 54,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Fraise Framboise Basilic  Ice Cool By Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraise Framboise Basilic 50ml Ice Cool By Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraise-framboise-basilic-50ml-ice-cool-by-liquidarom.jpg"
    ],
    "image": "/products/fraise-framboise-basilic-50ml-ice-cool-by-liquidarom.jpg"
  },
  {
    "id": "fraise-fruit-du-dragon-10ml-247",
    "name": "Fraise Fruit Du Dragon 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 161,
    "stock": 25,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fraise Fruit Du Dragon"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraise Fruit Du Dragon 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraise-fruit-du-dragon-10ml.jpg"
    ],
    "image": "/products/fraise-fruit-du-dragon-10ml.jpg"
  },
  {
    "id": "fraise-gariguette-10ml-248",
    "name": "Fraise Gariguette 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 10,
    "stock": 8,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fraise Gariguette"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraise Gariguette 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraise-gariguette-10ml.jpg"
    ],
    "image": "/products/fraise-gariguette-10ml.jpg"
  },
  {
    "id": "fraise-gariguette-50ml-0mg-249",
    "name": "Fraise Gariguette 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 212,
    "stock": 48,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Fraise Gariguette"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraise Gariguette 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraise-gariguette-50ml-0mg.jpg"
    ],
    "image": "/products/fraise-gariguette-50ml-0mg.jpg"
  },
  {
    "id": "fraise-liquidarom-250",
    "name": "Fraise Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 161,
    "stock": 39,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fraise Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraise Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraise-liquidarom.jpg"
    ],
    "image": "/products/fraise-liquidarom.jpg"
  },
  {
    "id": "fraizy-50ml-251",
    "name": "Fraizy 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 143,
    "stock": 73,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Fraizy"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fraizy 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fraizy-50ml-.jpg"
    ],
    "image": "/products/fraizy-50ml-.jpg"
  },
  {
    "id": "framboise-rubis-50ml-0mg-252",
    "name": "Framboise Rubis 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 188,
    "stock": 15,
    "badge": "nouveau",
    "nicotine": [
      0
    ],
    "flavors": [
      "Framboise Rubis"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Framboise Rubis 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/framboise-rubis-50ml-0mg.jpg"
    ],
    "image": "/products/framboise-rubis-50ml-0mg.jpg"
  },
  {
    "id": "freeze-dragon-serpent-50ml-liquideo-253",
    "name": "Freeze Dragon Serpent 50ml Liquideo",
    "category": "eliquide",
    "brand": "Liquideo",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 186,
    "stock": 123,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Freeze Dragon Serpent  Liquideo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Freeze Dragon Serpent 50ml Liquideo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/freeze-dragon-serpent-50ml-liquideo.png"
    ],
    "image": "/products/freeze-dragon-serpent-50ml-liquideo.png"
  },
  {
    "id": "freeze-fruit-du-serpent-50ml-liquideo-254",
    "name": "Freeze Fruit Du Serpent 50ml Liquideo",
    "category": "eliquide",
    "brand": "Liquideo",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 114,
    "stock": 114,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Freeze Fruit Du Serpent  Liquideo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Freeze Fruit Du Serpent 50ml Liquideo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/freeze-fruit-du-serpent-50ml-liquideo.jpg"
    ],
    "image": "/products/freeze-fruit-du-serpent-50ml-liquideo.jpg"
  },
  {
    "id": "friskoo-50ml-255",
    "name": "Friskoo 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.9,
    "reviews": 249,
    "stock": 7,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Friskoo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Friskoo 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/friskoo-50ml.jpg"
    ],
    "image": "/products/friskoo-50ml.jpg"
  },
  {
    "id": "fruit-du-dragon-fruits-rouges-50ml-ice-cool-by-liquidarom-256",
    "name": "Fruit Du Dragon Fruits Rouges 50ml Ice Cool By Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 150,
    "stock": 145,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Fruit Du Dragon Fruits Rouges  Ice Cool By Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fruit Du Dragon Fruits Rouges 50ml Ice Cool By Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fruit-du-dragon-fruits-rouges-50ml-ice-cool-by-liquidarom.jpg"
    ],
    "image": "/products/fruit-du-dragon-fruits-rouges-50ml-ice-cool-by-liquidarom.jpg"
  },
  {
    "id": "fruits-rouges-des-bois-10ml-257",
    "name": "Fruits Rouges Des Bois 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 49,
    "stock": 133,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Fruits Rouges Des Bois"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Fruits Rouges Des Bois 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/fruits-rouges-des-bois-10ml.jpg"
    ],
    "image": "/products/fruits-rouges-des-bois-10ml.jpg"
  },
  {
    "id": "ice-cool-cactus-aloe-vera-fruit-du-dragon-50ml-liquidarom-258",
    "name": "Ice Cool Cactus Aloe Vera Fruit Du Dragon 50ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 249,
    "stock": 136,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Ice Cool Cactus Aloe Vera Fruit Du Dragon  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Ice Cool Cactus Aloe Vera Fruit Du Dragon 50ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ice-cool-cactus-aloe-vera-fruit-du-dragon-50ml-liquidarom.jpg"
    ],
    "image": "/products/ice-cool-cactus-aloe-vera-fruit-du-dragon-50ml-liquidarom.jpg"
  },
  {
    "id": "ice-cool-framboise-bleue-et-pitaya-50ml-liquidarom-259",
    "name": "Ice Cool Framboise Bleue Et Pitaya 50ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 229,
    "stock": 71,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Ice Cool Framboise Bleue Et Pitaya  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Ice Cool Framboise Bleue Et Pitaya 50ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ice-cool-framboise-bleue-et-pitaya-50ml-liquidarom.jpg"
    ],
    "image": "/products/ice-cool-framboise-bleue-et-pitaya-50ml-liquidarom.jpg"
  },
  {
    "id": "ice-cool-kiwi-banane-50ml-liquidarom-260",
    "name": "Ice Cool Kiwi Banane 50ml Liquidarom",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.4,
    "reviews": 115,
    "stock": 77,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Ice Cool Kiwi Banane  Liquidarom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Ice Cool Kiwi Banane 50ml Liquidarom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/ice-cool-kiwi-banane-50ml-liquidarom.jpg"
    ],
    "image": "/products/ice-cool-kiwi-banane-50ml-liquidarom.jpg"
  },
  {
    "id": "jolie-blonde-50ml-liquideo-261",
    "name": "Jolie Blonde 50ml Liquideo",
    "category": "eliquide",
    "brand": "Liquideo",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 183,
    "stock": 6,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Jolie Blonde  Liquideo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Jolie Blonde 50ml Liquideo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/jolie-blonde-50ml-liquideo.jpg"
    ],
    "image": "/products/jolie-blonde-50ml-liquideo.jpg"
  },
  {
    "id": "kiss-full-50ml-liquideo-262",
    "name": "Kiss Full 50ml Liquideo",
    "category": "eliquide",
    "brand": "Liquideo",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 93,
    "stock": 27,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Kiss Full  Liquideo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Kiss Full 50ml Liquideo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/kiss-full-50ml-liquideo.jpg"
    ],
    "image": "/products/kiss-full-50ml-liquideo.jpg"
  },
  {
    "id": "aegis-legend-3-200w-avec-z-fli-55ml-geekvape-1-263",
    "name": "Aegis Legend 3 200w Avec Z Fli 55ml Geekvape (1)",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 190,
    "stock": 97,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Aegis Legend 3 200w Avec Z Fli 55ml Geekvape (1), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-aegis-legend-3-200w-avec-z-fli-55ml-geekvape (1).jpg"
    ],
    "image": "/products/kit-aegis-legend-3-200w-avec-z-fli-55ml-geekvape (1).jpg"
  },
  {
    "id": "aegis-legend-3-200w-avec-z-fli-55ml-geekvape-264",
    "name": "Aegis Legend 3 200w Avec Z Fli 55ml Geekvape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": 71.9,
    "rating": 4.9,
    "reviews": 53,
    "stock": 92,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Aegis Legend 3 200w Avec Z Fli 55ml Geekvape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-aegis-legend-3-200w-avec-z-fli-55ml-geekvape.jpg"
    ],
    "image": "/products/kit-aegis-legend-3-200w-avec-z-fli-55ml-geekvape.jpg"
  },
  {
    "id": "aegis-solo-3-geekvape-265",
    "name": "Aegis Solo 3 Geekvape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 44.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 139,
    "stock": 15,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Aegis Solo 3 Geekvape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-aegis-solo-3-geekvape.jpg"
    ],
    "image": "/products/kit-aegis-solo-3-geekvape.jpg"
  },
  {
    "id": "apex-vaporesso-266",
    "name": "Apex Vaporesso",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 110,
    "stock": 111,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Apex Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-apex-vaporesso.jpg"
    ],
    "image": "/products/kit-apex-vaporesso.jpg"
  },
  {
    "id": "armour-max-220w-avec-itank-2-8ml-vaporesso-noir-267",
    "name": "Armour Max 220w Avec Itank 2 8ml Vaporesso NOIR",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 232,
    "stock": 17,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Armour Max 220w Avec Itank 2 8ml Vaporesso NOIR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-armour-max-220w-avec-itank-2-8ml-vaporesso NOIR.jpg"
    ],
    "image": "/products/kit-armour-max-220w-avec-itank-2-8ml-vaporesso NOIR.jpg"
  },
  {
    "id": "armour-max-220w-avec-itank-2-8ml-vaporesso-silver-268",
    "name": "Armour Max 220w Avec Itank 2 8ml Vaporesso SILVER",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": 71.9,
    "rating": 4.8,
    "reviews": 193,
    "stock": 82,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Armour Max 220w Avec Itank 2 8ml Vaporesso SILVER, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-armour-max-220w-avec-itank-2-8ml-vaporesso SILVER.jpg"
    ],
    "image": "/products/kit-armour-max-220w-avec-itank-2-8ml-vaporesso SILVER.jpg"
  },
  {
    "id": "armour-s-100w-avec-itank-2-5ml-vaporesso-noir-269",
    "name": "Armour S 100w Avec Itank 2 5ml Vaporesso Noir",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 159,
    "stock": 47,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Armour S 100w Avec Itank 2 5ml Vaporesso Noir, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-armour-s-100w-avec-itank-2-5ml-vaporesso noir.jpg"
    ],
    "image": "/products/kit-armour-s-100w-avec-itank-2-5ml-vaporesso noir.jpg"
  },
  {
    "id": "armour-s-100w-avec-itank-2-5ml-vaporesso-silver-270",
    "name": "Armour S 100w Avec Itank 2 5ml Vaporesso Silver",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 57,
    "stock": 49,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Armour S 100w Avec Itank 2 5ml Vaporesso Silver, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-armour-s-100w-avec-itank-2-5ml-vaporesso silver.jpg"
    ],
    "image": "/products/kit-armour-s-100w-avec-itank-2-5ml-vaporesso silver.jpg"
  },
  {
    "id": "doric-astra-2500mah-voopoo-271",
    "name": "Doric Astra 2500mah Voopoo",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 228,
    "stock": 130,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Doric Astra 2500mah Voopoo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-doric-astra-2500mah-voopoo.jpg"
    ],
    "image": "/products/kit-doric-astra-2500mah-voopoo.jpg"
  },
  {
    "id": "gen-80s-avec-itank-2-noir-272",
    "name": "Gen 80s Avec Itank 2 Noir",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": 47.9,
    "rating": 4.4,
    "reviews": 218,
    "stock": 94,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen 80s Avec Itank 2 Noir, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-80s-avec-itank-2 noir.jpg"
    ],
    "image": "/products/kit-gen-80s-avec-itank-2 noir.jpg"
  },
  {
    "id": "gen-80s-avec-itank-2-silver-273",
    "name": "Gen 80s Avec Itank 2 Silver",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 111,
    "stock": 121,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen 80s Avec Itank 2 Silver, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-80s-avec-itank-2-silver.jpg"
    ],
    "image": "/products/kit-gen-80s-avec-itank-2-silver.jpg"
  },
  {
    "id": "gen-max-220w-avec-itank-t-vaporesso-noir-274",
    "name": "Gen Max 220w Avec Itank T Vaporesso NOIR",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 58,
    "stock": 26,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen Max 220w Avec Itank T Vaporesso NOIR, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-max-220w-avec-itank-t-vaporesso NOIR.jpg"
    ],
    "image": "/products/kit-gen-max-220w-avec-itank-t-vaporesso NOIR.jpg"
  },
  {
    "id": "gen-max-220w-avec-itank-t-vaporessosilver-275",
    "name": "Gen Max 220w Avec Itank T VaporessoSILVER",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 59.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 161,
    "stock": 145,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen Max 220w Avec Itank T VaporessoSILVER, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-max-220w-avec-itank-t-vaporessoSILVER.jpg"
    ],
    "image": "/products/kit-gen-max-220w-avec-itank-t-vaporessoSILVER.jpg"
  },
  {
    "id": "gen-se-80w-avec-itank-t-noir-276",
    "name": "Gen Se 80w Avec Itank T Noir",
    "category": "ecig",
    "brand": "THEKLOPE",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": 47.9,
    "rating": 4.8,
    "reviews": 193,
    "stock": 20,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen Se 80w Avec Itank T Noir, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-se-80w-avec-itank-t noir.jpg"
    ],
    "image": "/products/kit-gen-se-80w-avec-itank-t noir.jpg"
  },
  {
    "id": "gen-se-80w-avec-itank-t-vaporesso-silver-277",
    "name": "Gen Se 80w Avec Itank T Vaporesso Silver",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 14,
    "stock": 145,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gen Se 80w Avec Itank T Vaporesso Silver, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gen-se-80w-avec-itank-t-vaporesso silver.jpg"
    ],
    "image": "/products/kit-gen-se-80w-avec-itank-t-vaporesso silver.jpg"
  },
  {
    "id": "gtx-one-go-40-vaporesso-278",
    "name": "Gtx One Go 40 Vaporesso",
    "category": "ecig",
    "brand": "Vaporesso",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 62,
    "stock": 71,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gtx One Go 40 Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-gtx-one-go-40-vaporesso.jpg"
    ],
    "image": "/products/kit-gtx-one-go-40-vaporesso.jpg"
  },
  {
    "id": "argus-g2-mini-1500mah-voopoo-offre-groupee-1-1-279",
    "name": "Argus G2 Mini 1500mah Voopoo Offre Groupee 1 1",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 37,
    "stock": 25,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Argus G2 Mini 1500mah Voopoo Offre Groupee 1 1, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-pod-argus-g2-mini-1500mah-voopoo-offre-groupee-1-1.jpg"
    ],
    "image": "/products/kit-pod-argus-g2-mini-1500mah-voopoo-offre-groupee-1-1.jpg"
  },
  {
    "id": "drag-s2-avec-pnp-x-voopoo-new-colors-280",
    "name": "Drag S2 Avec Pnp X Voopoo New Colors",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": 29.9,
    "rating": 4.4,
    "reviews": 207,
    "stock": 61,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Drag S2 Avec Pnp X Voopoo New Colors, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-pod-drag-s2-avec-pnp-x-voopoo-new-colors.jpg"
    ],
    "image": "/products/kit-pod-drag-s2-avec-pnp-x-voopoo-new-colors.jpg"
  },
  {
    "id": "drag-x2-avec-pnp-x-voopoo-1-281",
    "name": "Drag X2 Avec Pnp X Voopoo (1)",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 48,
    "stock": 84,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Drag X2 Avec Pnp X Voopoo (1), un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-pod-drag-x2-avec-pnp-x-voopoo (1).jpg"
    ],
    "image": "/products/kit-pod-drag-x2-avec-pnp-x-voopoo (1).jpg"
  },
  {
    "id": "drag-x2-avec-pnp-x-voopoo-282",
    "name": "Drag X2 Avec Pnp X Voopoo",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 152,
    "stock": 67,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Drag X2 Avec Pnp X Voopoo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-pod-drag-x2-avec-pnp-x-voopoo.jpg"
    ],
    "image": "/products/kit-pod-drag-x2-avec-pnp-x-voopoo.jpg"
  },
  {
    "id": "luxe-xr-max-2800mah-vaporesso-283",
    "name": "Luxe Xr Max 2800mah Vaporesso",
    "category": "pod",
    "brand": "Vaporesso",
    "type": "Pod",
    "price": 29.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 182,
    "stock": 72,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Luxe Xr Max 2800mah Vaporesso, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-pod-luxe-xr-max-2800mah-vaporesso.jpg"
    ],
    "image": "/products/kit-pod-luxe-xr-max-2800mah-vaporesso.jpg"
  },
  {
    "id": "vinci-spark-100-avec-uforce-x-nano-voopoo-284",
    "name": "Vinci Spark 100 Avec Uforce X Nano Voopoo",
    "category": "pod",
    "brand": "Voopoo",
    "type": "Pod",
    "price": 24.9,
    "oldPrice": 29.9,
    "rating": 4.4,
    "reviews": 117,
    "stock": 30,
    "badge": "promo",
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Vinci Spark 100 Avec Uforce X Nano Voopoo, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/kit-vinci-spark-100-avec-uforce-x-nano-voopoo.jpg"
    ],
    "image": "/products/kit-vinci-spark-100-avec-uforce-x-nano-voopoo.jpg"
  },
  {
    "id": "la-chose-50ml-5050-le-french-liquide-285",
    "name": "La Chose 50ml 5050 Le French Liquide",
    "category": "eliquide",
    "brand": "Le French Liquide",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.8,
    "reviews": 105,
    "stock": 132,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "La Chose  5050 Le French Liquide"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez La Chose 50ml 5050 Le French Liquide, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/la-chose-50ml-5050-le-french-liquide.jpg"
    ],
    "image": "/products/la-chose-50ml-5050-le-french-liquide.jpg"
  },
  {
    "id": "la-petite-limo-60ml-petit-nuage-286",
    "name": "La Petite Limo 60ml Petit Nuage",
    "category": "eliquide",
    "brand": "Petit Nuage",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 221,
    "stock": 86,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "La Petite Limo  Petit Nuage"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez La Petite Limo 60ml Petit Nuage, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "60 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/la-petite-limo-60ml-petit-nuage.jpg"
    ],
    "image": "/products/la-petite-limo-60ml-petit-nuage.jpg"
  },
  {
    "id": "le-dessert-de-mamie-60ml-petit-nuage-287",
    "name": "Le Dessert De Mamie 60ml Petit Nuage",
    "category": "eliquide",
    "brand": "Petit Nuage",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 85,
    "stock": 71,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Le Dessert De Mamie  Petit Nuage"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Le Dessert De Mamie 60ml Petit Nuage, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "60 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/le-dessert-de-mamie-60ml-petit-nuage.jpg"
    ],
    "image": "/products/le-dessert-de-mamie-60ml-petit-nuage.jpg"
  },
  {
    "id": "pomme-10ml-pg-70-vg-30-288",
    "name": "Pomme 10ml Pg 70 Vg 30",
    "category": "eliquide",
    "brand": "Liquidarom",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 97,
    "stock": 79,
    "badge": "nouveau",
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Pomme  Pg 70 Vg 30"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pomme 10ml Pg 70 Vg 30, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/liquidarom-e-liquide-pomme-10ml-pg-70-vg-30.jpg"
    ],
    "image": "/products/liquidarom-e-liquide-pomme-10ml-pg-70-vg-30.jpg"
  },
  {
    "id": "mangue-carabao-10ml-289",
    "name": "Mangue Carabao 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 236,
    "stock": 96,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Mangue Carabao"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mangue Carabao 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/mangue-carabao-10ml.jpg"
    ],
    "image": "/products/mangue-carabao-10ml.jpg"
  },
  {
    "id": "mangue-carabao-50ml-0mg-290",
    "name": "Mangue Carabao 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": 24.9,
    "rating": 4.9,
    "reviews": 240,
    "stock": 12,
    "badge": "promo",
    "nicotine": [
      0
    ],
    "flavors": [
      "Mangue Carabao"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mangue Carabao 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/mangue-carabao-50ml-0mg.jpg"
    ],
    "image": "/products/mangue-carabao-50ml-0mg.jpg"
  },
  {
    "id": "mangue-passion-50ml-ice-cool-by-liquid-arom-291",
    "name": "Mangue Passion 50ml Ice Cool By Liquid Arom",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 108,
    "stock": 123,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Mangue Passion  Ice Cool By Liquid Arom"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mangue Passion 50ml Ice Cool By Liquid Arom, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/mangue-passion-50ml-ice-cool-by-liquid-arom.jpg"
    ],
    "image": "/products/mangue-passion-50ml-ice-cool-by-liquid-arom.jpg"
  },
  {
    "id": "melon-de-cavaillon-10ml-292",
    "name": "Melon De Cavaillon 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 123,
    "stock": 31,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Melon De Cavaillon"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Melon De Cavaillon 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/melon-de-cavaillon-10ml.jpg"
    ],
    "image": "/products/melon-de-cavaillon-10ml.jpg"
  },
  {
    "id": "melon-de-cavaillon-50ml-0mg-293",
    "name": "Melon De Cavaillon 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 206,
    "stock": 30,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Melon De Cavaillon"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Melon De Cavaillon 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/melon-de-cavaillon-50ml-0mg.jpg"
    ],
    "image": "/products/melon-de-cavaillon-50ml-0mg.jpg"
  },
  {
    "id": "mintoo-50ml-294",
    "name": "Mintoo 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 190,
    "stock": 120,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Mintoo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Mintoo 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/mintoo-50ml-.jpg"
    ],
    "image": "/products/mintoo-50ml-.jpg"
  },
  {
    "id": "pasteque-melon-10ml-295",
    "name": "Pasteque Melon 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 38,
    "stock": 129,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Pasteque Melon"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pasteque Melon 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/pasteque-melon-10ml.jpg"
    ],
    "image": "/products/pasteque-melon-10ml.jpg"
  },
  {
    "id": "pasteque-melon-50ml-0mg-296",
    "name": "Pasteque Melon 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 92,
    "stock": 86,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Pasteque Melon"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pasteque Melon 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/pasteque-melon-50ml-0mg.jpg"
    ],
    "image": "/products/pasteque-melon-50ml-0mg.jpg"
  },
  {
    "id": "peche-abricot-50ml-0mg-zhc-297",
    "name": "Peche Abricot 50ml 0mg Zhc",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 111,
    "stock": 96,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Peche Abricot   Zhc"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Peche Abricot 50ml 0mg Zhc, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/peche-abricot-50ml-0mg-zhc.jpg"
    ],
    "image": "/products/peche-abricot-50ml-0mg-zhc.jpg"
  },
  {
    "id": "pommes-reinettes-10ml-298",
    "name": "Pommes Reinettes 10ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.5,
    "reviews": 225,
    "stock": 72,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "Pommes Reinettes"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pommes Reinettes 10ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/pommes-reinettes-10ml.jpg"
    ],
    "image": "/products/pommes-reinettes-10ml.jpg"
  },
  {
    "id": "pommes-reinettes-50ml-0mg-299",
    "name": "Pommes Reinettes 50ml 0mg",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.3,
    "reviews": 34,
    "stock": 100,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Pommes Reinettes"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pommes Reinettes 50ml 0mg, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/pommes-reinettes-50ml-0mg.jpg"
    ],
    "image": "/products/pommes-reinettes-50ml-0mg.jpg"
  },
  {
    "id": "gti-mesh-015020405-vaporesso-pack-de-5-300",
    "ohmOptions": ["0.15", "0.2", "0.4", "0.5"],
    "name": "Gti Mesh 015020405 Vaporesso Pack De 5",
    "category": "accessoire",
    "brand": "Vaporesso",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": 15.9,
    "rating": 4.5,
    "reviews": 233,
    "stock": 8,
    "badge": "promo",
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Gti Mesh 015020405 Vaporesso Pack De 5, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/resistances-gti-mesh-015020405-vaporesso-pack-de-5.jpg"
    ],
    "image": "/products/resistances-gti-mesh-015020405-vaporesso-pack-de-5.jpg"
  },
  {
    "id": "ito-v2-0-7-1-2-voopoo-pack-de-5-301",
    "ohmOptions": ["0.7", "1.2"],
    "name": "Ito V2 0 7 1 2 Voopoo Pack De 5",
    "category": "accessoire",
    "brand": "Voopoo",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.8,
    "reviews": 99,
    "stock": 21,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Ito V2 0 7 1 2 Voopoo Pack De 5, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/resistances-ito-v2-0-7-1-2-voopoo-pack-de-5.jpg"
    ],
    "image": "/products/resistances-ito-v2-0-7-1-2-voopoo-pack-de-5.jpg"
  },
  {
    "id": "pnp-x-015020304506ohm-voopoo-pack-de-5-302",
    "ohmOptions": ["0.15", "0.2", "0.3", "0.45", "0.6"],
    "name": "Pnp X 015020304506ohm Voopoo Pack De 5",
    "category": "accessoire",
    "brand": "Voopoo",
    "type": "Accessoire",
    "price": 12.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 156,
    "stock": 46,
    "badge": null,
    "nicotine": [],
    "flavors": [],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Pnp X 015020304506ohm Voopoo Pack De 5, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Type": "Accessoire certifié d'origine",
      "Compatibilité": "Standard universel"
    },
    "images": [
      "/products/resistances-pnp-x-015020304506ohm-voopoo-pack-de-5.jpg"
    ],
    "image": "/products/resistances-pnp-x-015020304506ohm-voopoo-pack-de-5.jpg"
  },
  {
    "id": "reve-bleu-60ml-petit-nuage-303",
    "name": "Reve Bleu 60ml Petit Nuage",
    "category": "eliquide",
    "brand": "Petit Nuage",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 151,
    "stock": 11,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Reve Bleu  Petit Nuage"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Reve Bleu 60ml Petit Nuage, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "60 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/reve-bleu-60ml-petit-nuage.jpg"
    ],
    "image": "/products/reve-bleu-60ml-petit-nuage.jpg"
  },
  {
    "id": "softy-50ml-304",
    "name": "Softy 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.9,
    "reviews": 66,
    "stock": 42,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Softy"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Softy 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/softy-50ml-.jpg"
    ],
    "image": "/products/softy-50ml-.jpg"
  },
  {
    "id": "soul-geekvape-305",
    "name": "Soul Geekvape",
    "category": "ecig",
    "brand": "Geekvape",
    "type": "Cigarette électronique",
    "price": 39.9,
    "oldPrice": null,
    "rating": 4.4,
    "reviews": 131,
    "stock": 137,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12
    ],
    "flavors": [],
    "colors": [
      "Noir",
      "Argent",
      "Bleu"
    ],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Soul Geekvape, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Charge": "USB-C",
      "Activation": "Inhalation automatique / bouton",
      "Garantie": "2 ans"
    },
    "images": [
      "/products/soul-geekvape.jpg"
    ],
    "image": "/products/soul-geekvape.jpg"
  },
  {
    "id": "the-thing-10ml-x10-306",
    "name": "The Thing 10ml X10",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 5.9,
    "oldPrice": null,
    "rating": 4.7,
    "reviews": 178,
    "stock": 98,
    "badge": null,
    "nicotine": [
      0,
      3,
      6,
      12,
      16
    ],
    "flavors": [
      "The Thing  X10"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez The Thing 10ml X10, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "10 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/the-thing-10ml-x10.jpg"
    ],
    "image": "/products/the-thing-10ml-x10.jpg"
  },
  {
    "id": "tropikoo-50ml-307",
    "name": "Tropikoo 50ml",
    "category": "eliquide",
    "brand": "THEKLOPE",
    "type": "E-liquide",
    "price": 19.9,
    "oldPrice": null,
    "rating": 4.6,
    "reviews": 115,
    "stock": 33,
    "badge": null,
    "nicotine": [
      0
    ],
    "flavors": [
      "Tropikoo"
    ],
    "colors": [],
    "short": "Un produit de qualité sélectionné par THEKLOPE pour sa fiabilité et ses saveurs.",
    "long": "Découvrez Tropikoo 50ml, un produit de référence rigoureusement testé par notre équipe. Parfaitement adapté à un usage quotidien, il garantit durabilité et performance constante.",
    "specs": {
      "Contenance": "50 ml",
      "Origine": "Fabriqué en France",
      "Ratio": "50 PG / 50 VG"
    },
    "images": [
      "/products/tropikoo-50ml-.jpg"
    ],
    "image": "/products/tropikoo-50ml-.jpg"
  }
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
PRODUCTS.forEach((p) => {
  const nameLower = p.name.toLowerCase();

  // Category classification: ecig/pod kits become packs
  if ((p.category === 'ecig' || p.category === 'pod') && /\bkit\b/.test(nameLower)) {
    p.category = 'pack';
  }

  // Ne jamais écraser une marque explicitement relue dans la source. Les
  // heuristiques ci-dessous ne servent qu'aux anciennes lignes non renseignées.
  if (p.brand && p.brand !== 'THEKLOPE') return;

  // Brand classification based on keywords in name
  if (nameLower.includes('geekvape') || nameLower.includes('geek-vape') || nameLower.includes('aegis') || nameLower.includes('obelisk') || nameLower.includes('wenax') || nameLower.includes('zeus')) {
    p.brand = 'Geekvape';
  } else if (nameLower.includes('vaporesso') || nameLower.includes('armour') || nameLower.includes('xros') || nameLower.includes('gt core') || nameLower.includes('luxe q') || nameLower.includes('target') || nameLower.includes('eco nano') || nameLower.includes('gen se') || nameLower.includes('gen 80s') || nameLower.includes('luxe 2') || nameLower.includes('luxe ii') || nameLower.includes('gtx')) {
    p.brand = 'Vaporesso';
  } else if (nameLower.includes('voopoo') || nameLower.includes('doric') || nameLower.includes('vinci') || nameLower.includes('spark') || nameLower.includes('drag') || nameLower.includes('argus') || nameLower.includes('tpp') || nameLower.includes('pnp')) {
    p.brand = 'Voopoo';
  } else if (nameLower.includes('innokin') || nameLower.includes('coolfire') || nameLower.includes('kroma') || nameLower.includes('zenith') || nameLower.includes('adept') || nameLower.includes('sensis')) {
    p.brand = 'Innokin';
  } else if (nameLower.includes('justfog') || nameLower.includes('q16')) {
    p.brand = 'Justfog';
  } else if (nameLower.includes('alfaliquid') || nameLower.includes('alfa') || nameLower.includes('california') || nameLower.includes('fr-k') || nameLower.includes('fr-m') || nameLower.includes('fr-w') || nameLower.includes('fr4') || nameLower.includes('fr5') || nameLower.includes('malawia') || nameLower.includes('usa mix') || nameLower.includes('fraicheur') || nameLower.includes('classico')) {
    p.brand = 'Alfaliquid';
  } else if (nameLower.includes('liquideo') || nameLower.includes('evolution') || nameLower.includes('waptaler') || nameLower.includes('amy') || nameLower.includes('jolie blond') || nameLower.includes('mblue') || nameLower.includes('sherwood') || nameLower.includes('blue alien') || nameLower.includes('manhattan') || nameLower.includes('lucky boy')) {
    p.brand = 'Liquideo';
  } else if (nameLower.includes('aspire') || nameLower.includes('nautilus') || nameLower.includes('bvc') || nameLower.includes('pocke x') || nameLower.includes('pockex') || nameLower.includes('flexus') || nameLower.includes('gotek') || nameLower.includes('meche t2') || nameLower.includes('k-lite') || nameLower.includes('klite') || nameLower.includes('zelos') || nameLower.includes('resistance') || nameLower.includes('coil')) {
    p.brand = 'Aspire';
  } else if (nameLower.includes('pulp') || nameLower.includes('cult') || nameLower.includes('miel') || nameLower.includes('gazelle') || nameLower.includes('peche') || nameLower.includes('tanzanie') || nameLower.includes('mozambique') || nameLower.includes('alabama') || nameLower.includes('tennessee') || nameLower.includes('boston') || nameLower.includes('chrysalide') || nameLower.includes('thing') || nameLower.includes('verveine') || nameLower.includes('patisserie') || nameLower.includes('breakfast') || nameLower.includes('fraise') || nameLower.includes('framboise') || nameLower.includes('cassis') || nameLower.includes('myrtille') || nameLower.includes('noisette') || nameLower.includes('vanille')) {
    p.brand = 'Pulp';
  } else if (nameLower.includes('french liquide') || nameLower.includes('french-liquide') || nameLower.includes('la chose') || nameLower.includes('reanimator') || nameLower.includes('sensation') || nameLower.includes('spartacus') || nameLower.includes('relax') || nameLower.includes('supreme') || nameLower.includes('player') || nameLower.includes('acid') || nameLower.includes('la petite chose')) {
    p.brand = 'Le French Liquide';
  } else if (nameLower.includes('petit nuage') || nameLower.includes('petit-nuage') || nameLower.includes('le dessert') || nameLower.includes('flocon') || nameLower.includes('paris-brest') || nameLower.includes('paris brest') || nameLower.includes('tiramisu') || nameLower.includes('mille-feuille') || nameLower.includes('mille feuille') || nameLower.includes('grenade') || nameLower.includes('pins') || nameLower.includes('sienne')) {
    p.brand = 'Petit Nuage';
  } else if (nameLower.includes('liquidarom') || nameLower.includes('ice cool') || nameLower.includes('le flamant gourmand') || nameLower.includes('le-flamant-gourmand') || nameLower.includes('selad') || nameLower.includes('tropikoo') || nameLower.includes('bairy') || nameLower.includes('framboise rubis') || nameLower.includes('citron lime') || nameLower.includes('caffe latte') || nameLower.includes('eclats de noisettes') || nameLower.includes('softy') || nameLower.includes('friskoo') || nameLower.includes('dragoo') || nameLower.includes('mintoo') || nameLower.includes('blondy') || nameLower.includes('anis 51') || nameLower.includes('cerise griotte') || nameLower.includes('fraise gariguette') || nameLower.includes('mangue carabao') || nameLower.includes('melon de cavaillon') || nameLower.includes('pasteque melon') || nameLower.includes('pommes reinettes') || nameLower.includes('caramel toffee') || nameLower.includes('fraise fruit du dragon')) {
    p.brand = 'Liquidarom';
  } else if (nameLower.includes('xtar') || nameLower.includes('mc') || nameLower.includes('vc') || nameLower.includes('charger') || nameLower.includes('chargeur')) {
    p.brand = 'Xtar';
  } else if (nameLower.includes('dotmod') || nameLower.includes('dotstick') || nameLower.includes('dotaio')) {
    p.brand = 'Dotmod';
  } else if (nameLower.includes('high creek') || nameLower.includes('the dragoon') || nameLower.includes('fafnir') || nameLower.includes('the rebel')) {
    p.brand = 'High Creek';
  } else if (nameLower.includes('flamant gourmand') || nameLower.includes('flamant-gourmand')) {
    p.brand = 'Le Flamant Gourmand';
  } else if (nameLower.includes('selad')) {
    p.brand = 'Selad';
  }

  // Une marque inconnue reste explicitement THEKLOPE : inventer un fabricant
  // à partir de la catégorie rend les filtres et les fiches trompeurs.
});

// Corrections commerciales vérifiées contre le catalogue live. Ce fichier ne
// sert qu'au développement local ; les déploiements chargent Supabase, mais le
// mode local ne doit pas proposer du matériel à 5,90 € comme un e-liquide.
const STATIC_CATALOG_CORRECTIONS = {
  'dual-coil-56': {
    name: 'Résistances Dual Coil - Kangertech Pack de 5', category: 'resistance', brand: 'Kangertech', type: 'Résistances',
    volume: null, price: 15, oldPrice: null, stock: 20, nicotine: [], flavors: [], colors: [], ohmOptions: [], specs: {}, short: '', long: '',
  },
  'kit-zelos-81': {
    name: 'Zelos 3 - Aspire', category: 'ecig', brand: 'Aspire', type: 'Cigarette électronique',
    volume: null, price: 59.9, oldPrice: null, stock: 20, nicotine: [], flavors: [], colors: ['Noir'], ohmOptions: [],
    specs: { Charge: 'USB-C', Batterie: '3200 mah', Puissance: '80 watts' }, short: '', long: '',
  },
  'kit-gtx-one-pro-vaporesso-90': {
    name: 'Kit GTX One Pro - Vaporesso', category: 'ecig', brand: 'Vaporesso', type: 'Cigarette électronique',
    volume: null, price: 46.9, oldPrice: null, stock: 20, nicotine: [], flavors: [], colors: ['Noir', 'Gris', 'Rose', 'Bleu'], ohmOptions: [],
    specs: { Charge: 'USB-C', Batterie: '3000 Mah', Puissance: '40 watts' }, short: '', long: '',
  },
  're-sistances-j-series-5pcs-geekvape-153': {
    name: 'Résistances J Series - GeekVape Pack de 5', category: 'resistance', brand: 'Geekvape', type: 'Résistances',
    volume: null, price: 15, oldPrice: null, stock: 20, nicotine: [], flavors: [], colors: [], ohmOptions: ['0.4', '0.6', '0.8'], specs: {}, short: '', long: '',
  },
  'red-astaire-50-ml-149': {
    name: 'Red Astaire 50 ml - Tjuice', category: 'eliquide', brand: 'Tjuice', type: 'E-liquide', volume: '50ml',
    price: 19.9, oldPrice: null, stock: 50, nicotine: [0], flavors: ['Red Astaire'], colors: [], ohmOptions: [],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué au Royaume Uni', Contenance: '50 ml' }, short: '', long: '',
  },
  'zenith-pro-190': {
    name: 'Résistance série Z Pro - Innokin', category: 'resistance', brand: 'Innokin', type: 'Résistances',
    volume: null, price: 15, oldPrice: null, stock: 30, nicotine: [], flavors: [], colors: [], ohmOptions: [], specs: {}, short: '', long: '',
  },
  'zenith-191': {
    name: 'Résistances série Z Zenith - Innokin Pack de 5', category: 'resistance', brand: 'Innokin', type: 'Résistances',
    volume: null, price: 15, oldPrice: null, stock: 50, nicotine: [], flavors: [], colors: [], ohmOptions: ['0.3', '0.5', '0.8', '1.0', '1.6'], specs: {}, short: '', long: '',
  },
  'coco-miam-42': {
    name: 'Coco Miam 10 ml - Freaks', brand: 'Freaks', volume: '10ml', price: 5.9, stock: 100, nicotine: [3, 6, 12], flavors: ['Coco Miam'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '10 ml' }, short: '', long: '',
  },
  'coco-miam-43': {
    name: 'Coco Miam 50 ml - Freaks', brand: 'Freaks', volume: '50ml', price: 19.9, stock: 20, nicotine: [0], flavors: ['Coco Miam'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  'macada-miam-109': {
    name: 'Macada Miam 10 ml - Freaks', brand: 'Freaks', volume: '10ml', price: 5.9, stock: 1000, nicotine: [3, 6, 12], flavors: ['Macada Miam'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '10 ml' }, short: '', long: '',
  },
  'macada-miam-110': {
    name: 'Macada Miam 50 ml - Freaks', brand: 'Freaks', volume: '50ml', price: 19.9, stock: 100, nicotine: [0], flavors: ['Macada Miam'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  'mantaro-116': {
    name: 'Mantaro 50 ml - Amazone', brand: 'E-tasty', volume: '50ml', price: 19.9, stock: 20, nicotine: [0], flavors: ['Mantaro'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  'senois-1-156': {
    name: 'Classico Senois 10 ml - Freaks', brand: 'Freaks', volume: '10ml', price: 5.9, stock: 200, nicotine: [3, 6, 11], flavors: ['Classico Senois'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '10 ml' }, short: '', long: '',
  },
  'senois-157': {
    name: 'Classico Senois 50 ml - Freaks', brand: 'Freaks', volume: '50ml', price: 19.9, stock: 100, nicotine: [0], flavors: ['Classico Senois'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  'grege-1-67': {
    name: 'Classico Grège 10 ml - Freaks', brand: 'Freaks', volume: '10ml', price: 5.9, stock: 1000, nicotine: [3, 6, 11], flavors: ['Classico Grège'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '10 ml' }, short: '', long: '',
  },
  'grege-68': {
    name: 'Classico Grège 50 ml - Freaks', brand: 'Freaks', volume: '50ml', price: 19.9, stock: 100, nicotine: [0], flavors: ['Classico Grège'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  'cafe-liquid-arom-209': {
    name: 'Café 10 ml - Liquidarom', brand: 'Liquidarom', volume: '10ml', price: 5.9, stock: 1000, nicotine: [3, 6, 12], flavors: ['Café'],
    specs: { Ratio: '70 PG / 30 VG', Origine: 'Fabriqué en France', Contenance: '10 ml' }, short: '', long: '',
  },
  'cerise-griotte-50ml-0mg-217': {
    name: 'Cerise Griotte 50 ml - Freaks', brand: 'Freaks', volume: '50ml', price: 19.9, stock: 100, nicotine: [0], flavors: ['Cerise Griotte'],
    specs: { Ratio: '50 PG / 50 VG', Origine: 'Fabriqué en France', Contenance: '50 ml' }, short: '', long: '',
  },
  // Ces anciennes références n'existent plus dans le catalogue live. Elles
  // restent consultables en local mais ne peuvent plus être ajoutées au panier.
  'gtx-70': { stock: 0, badge: null },
  'kit-digi-max-geekvape-89': { stock: 0, badge: null },
};

PRODUCTS.forEach((product) => {
  const correction = STATIC_CATALOG_CORRECTIONS[product.id];
  if (correction) Object.assign(product, correction);
});
