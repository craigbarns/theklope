const GENERIC_MARKERS = [
  'un produit de qualite selectionne par theklope',
  'produit selectionne par theklope pour une experience fiable',
  'un produit de reference rigoureusement teste',
  'fiche produit a completer',
]

const CATEGORY_LABELS = {
  ecig: 'cigarette électronique',
  pod: 'pod rechargeable',
  eliquide: 'e-liquide',
  accessoire: 'accessoire',
  pack: 'pack débutant',
}

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const unique = (values = []) => [...new Set(values.map((v) => compact(v)).filter(Boolean))]

const list = (values = []) => {
  const items = unique(values)
  if (!items.length) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}

const specsText = (specs = {}) =>
  Object.entries(specs)
    .filter(([, value]) => compact(value))
    .map(([key, value]) => `${key.toLowerCase()} ${value}`)
    .join(', ')

export function isGenericProductCopy(value) {
  const text = normalize(value)
  return !text || GENERIC_MARKERS.some((marker) => text.includes(marker))
}

function nicotinePhrase(product) {
  if (product.category !== 'eliquide') return ''
  const levels = unique(product.nicotine || []).map((n) => `${Number(n)} mg`)
  return levels.length ? `Taux disponibles : ${list(levels)}.` : ''
}

function flavorPhrase(product) {
  const flavors = unique(product.flavors || [])
  if (!flavors.length) return ''
  return `Profil aromatique : ${list(flavors)}.`
}

function colorPhrase(product) {
  const colors = unique(product.colors || [])
  if (!colors.length) return ''
  return `Coloris disponibles : ${list(colors)}.`
}

export function buildProductShort(product) {
  const name = compact(product.name)
  const brand = compact(product.brand) || 'THEKLOPE'
  const category = CATEGORY_LABELS[product.category] || compact(product.type) || 'produit vape'
  const specs = product.specs || {}

  if (product.category === 'eliquide') {
    const format = compact(specs.Contenance) || 'format 10 ml'
    const ratio = compact(specs.Ratio)
    const flavors = unique(product.flavors || [])
    const flavor = flavors.length ? `, saveur ${list(flavors)}` : ''
    const base = ratio ? ` avec un ratio ${ratio}` : ''
    return `${name} de ${brand} est un ${category}${flavor}, proposé en ${format}${base}.`
  }

  if (product.category === 'ecig' || product.category === 'pod') {
    const charge = compact(specs.Charge)
    const activation = compact(specs.Activation)
    const parts = [charge && `charge ${charge}`, activation && `activation ${activation.toLowerCase()}`].filter(Boolean)
    return `${name} de ${brand} est ${product.category === 'pod' ? 'un pod compact' : 'une cigarette électronique'} sélectionné pour un usage quotidien${parts.length ? `, avec ${list(parts)}` : ''}.`
  }

  if (product.category === 'accessoire') {
    const compatibility = compact(specs.Compatibilité || specs.Compatibility)
    return `${name} de ${brand} est un accessoire vape${compatibility ? ` compatible ${compatibility}` : ''}, pratique pour entretenir ou compléter votre matériel.`
  }

  if (product.category === 'pack') {
    return `${name} est un pack débutant THEKLOPE pensé pour démarrer simplement, avec un matériel fiable et les essentiels pour vapoter sereinement.`
  }

  return `${name} est un ${category} ${brand} sélectionné par THEKLOPE pour une vape fiable, claire et adaptée au quotidien.`
}

export function buildProductLong(product) {
  const name = compact(product.name)
  const brand = compact(product.brand) || 'THEKLOPE'
  const category = CATEGORY_LABELS[product.category] || compact(product.type) || 'produit vape'
  const specs = specsText(product.specs)
  const details = []

  if (product.category === 'eliquide') {
    details.push(`${name} est un ${category} ${brand} choisi par THEKLOPE pour son profil clair et son format facile à intégrer dans une routine de vape.`)
    details.push(flavorPhrase(product))
    details.push(specs ? `Caractéristiques : ${specs}.` : '')
    details.push(nicotinePhrase(product))
    details.push('Un choix adapté aux vapoteurs majeurs qui veulent comparer rapidement les saveurs, le ratio et les dosages avant de commander.')
    return details.filter(Boolean).join(' ')
  }

  if (product.category === 'ecig' || product.category === 'pod') {
    details.push(`${name} est ${product.category === 'pod' ? 'un pod rechargeable' : 'une cigarette électronique'} ${brand} sélectionné par THEKLOPE pour sa prise en main, sa régularité et son confort d'utilisation.`)
    details.push(specs ? `Caractéristiques : ${specs}.` : '')
    details.push(colorPhrase(product))
    details.push('Ce matériel convient aux vapoteurs majeurs qui recherchent une solution simple à choisir, facile à transporter et prête pour un usage quotidien.')
    return details.filter(Boolean).join(' ')
  }

  if (product.category === 'accessoire') {
    details.push(`${name} est un accessoire ${brand} pensé pour compléter, protéger ou entretenir votre matériel de vape.`)
    details.push(specs ? `Caractéristiques : ${specs}.` : '')
    details.push('Il aide à garder une expérience plus régulière au quotidien, avec une référence claire à retrouver dans la boutique THEKLOPE.')
    return details.filter(Boolean).join(' ')
  }

  if (product.category === 'pack') {
    details.push(`${name} regroupe une sélection THEKLOPE pensée pour les vapoteurs majeurs qui veulent commencer sans multiplier les achats séparés.`)
    details.push(specs ? `Le pack met en avant un matériel avec ${specs}.` : '')
    details.push(colorPhrase(product))
    details.push('La sélection privilégie la simplicité, la compatibilité et une mise en route lisible dès la première commande.')
    return details.filter(Boolean).join(' ')
  }

  return `${name} est un ${category} ${brand} sélectionné par THEKLOPE pour sa fiabilité et son intérêt dans une sélection vape cohérente.`
}

export function enrichProductCopy(product) {
  const base = { ...product }
  const short = compact(base.short)
  const long = compact(base.long)

  return {
    ...base,
    short: isGenericProductCopy(short) ? buildProductShort(base) : short,
    long: isGenericProductCopy(long) ? buildProductLong(base) : long,
  }
}
