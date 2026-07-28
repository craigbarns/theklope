const SEARCH_STOP_WORDS = new Set([
  'a',
  'au',
  'aux',
  'avec',
  'd',
  'de',
  'des',
  'du',
  'e',
  'et',
  'la',
  'le',
  'les',
  'l',
  'pour',
  'un',
  'une',
])

// Aliases deliberately limited to common names that describe the same
// catalogue concept. Broader taste or compatibility guesses would create
// misleading results.
const SEARCH_SYNONYM_GROUPS = [
  ['eliquide', 'liquide', 'juice'],
  ['cigarette', 'ecig', 'vapoteuse'],
  ['resistance', 'coil'],
  ['classic', 'classique', 'tabac'],
  ['menthe', 'menthol', 'menthole'],
  ['fruit', 'fruite', 'fruitee'],
  ['gourmand', 'gourmande'],
  ['chargeur', 'charger'],
  ['cartouche', 'cartridge'],
  ['compatible', 'compatibilite'],
]

const SEARCH_SYNONYMS = new Map()
const PRODUCT_SEARCH_DOCUMENT_CACHE = new WeakMap()

SEARCH_SYNONYM_GROUPS.forEach((group) => {
  group.forEach((term) => SEARCH_SYNONYMS.set(term, group))
})

const baseNormalize = (value) =>
  String(value ?? '')
    .replace(/œ/gi, (match) => (match === 'Œ' ? 'OE' : 'oe'))
    .replace(/æ/gi, (match) => (match === 'Æ' ? 'AE' : 'ae'))
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr')
    .replace(/(\d),(\d)/g, '$1.$2')

export function tokenizeSearchQuery(value) {
  return baseNormalize(value).match(/\p{L}[\p{L}\p{N}]*|\p{N}+(?:\.\p{N}+)?/gu) || []
}

export function normalizeSearchText(value) {
  return tokenizeSearchQuery(value).join(' ')
}

const flattenSearchValue = (value, depth = 0) => {
  if (value == null || value === false || depth > 4) return []
  if (typeof value === 'string' || typeof value === 'number') return [String(value)]
  if (Array.isArray(value)) return value.flatMap((entry) => flattenSearchValue(entry, depth + 1))
  if (typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, entry]) => [
    key,
    ...flattenSearchValue(entry, depth + 1),
  ])
}

const makeSearchField = (values, weight) => {
  const text = normalizeSearchText(flattenSearchValue(values).join(' '))
  return {
    text,
    tokens: tokenizeSearchQuery(text),
    weight,
  }
}

function buildProductSearchDocument(product = {}) {
  const fields = {
    name: makeSearchField(product.name, 60),
    reference: makeSearchField(product.id, 48),
    brand: makeSearchField(product.brand, 42),
    type: makeSearchField([product.type, product.category], 34),
    flavors: makeSearchField(product.flavors, 38),
    compatibility: makeSearchField([
      product.compatibility,
      product.compatibilities,
      product.compatibleWith,
      product.compatible_with,
      product.deviceCompatibility,
      product.device_compatibility,
    ], 44),
    specs: makeSearchField(product.specs, 32),
    variants: makeSearchField([
      product.variants,
      product.variantOptions,
      product.variant_options,
      product.options,
      product.ohmOptions,
      product.ohm_options,
      product.colors,
      product.nicotine,
    ], 24),
    description: makeSearchField([
      product.short,
      product.long,
      product.description,
    ], 12),
  }

  return {
    fields,
    allTokens: Object.values(fields).flatMap((field) => field.tokens),
  }
}

const getProductSearchDocument = (product) => {
  if (!product || typeof product !== 'object') return buildProductSearchDocument(product)
  const cached = PRODUCT_SEARCH_DOCUMENT_CACHE.get(product)
  if (cached) return cached
  const document = buildProductSearchDocument(product)
  PRODUCT_SEARCH_DOCUMENT_CACHE.set(product, document)
  return document
}

const singularToken = (token) => (
  token.length > 4 && token.endsWith('s') ? token.slice(0, -1) : token
)

const isAlphabeticLongToken = (token) => token.length >= 5 && /^\p{L}+$/u.test(token)

const isEditDistanceAtMostOne = (left, right) => {
  if (left === right) return true
  if (Math.abs(left.length - right.length) > 1) return false

  let shorter = left
  let longer = right
  if (shorter.length > longer.length) {
    shorter = right
    longer = left
  }

  let edits = 0
  let shortIndex = 0
  let longIndex = 0

  while (shortIndex < shorter.length && longIndex < longer.length) {
    if (shorter[shortIndex] === longer[longIndex]) {
      shortIndex += 1
      longIndex += 1
      continue
    }

    edits += 1
    if (edits > 1) return false
    if (shorter.length === longer.length) shortIndex += 1
    longIndex += 1
  }

  return true
}

// 4 = exact, 3 = harmless singular/plural variation, 2 = prefix typed by the
// user, 1 = one-letter typo. Fuzzy matching stays disabled for short model
// names and every token containing a number.
const tokenMatchQuality = (candidate, query) => {
  if (candidate === query) return 4
  if (singularToken(candidate) === singularToken(query)) return 3
  if (query.length >= 3 && candidate.startsWith(query)) return 2
  if (
    isAlphabeticLongToken(candidate)
    && isAlphabeticLongToken(query)
    && isEditDistanceAtMostOne(candidate, query)
  ) return 1
  return 0
}

const alternativesFor = (token) => {
  const singular = singularToken(token)
  return SEARCH_SYNONYMS.get(token)
    || SEARCH_SYNONYMS.get(singular)
    || [token]
}

function buildQueryConcepts(query) {
  const rawTokens = tokenizeSearchQuery(query)
  const usefulTokens = rawTokens.filter((token) => !SEARCH_STOP_WORDS.has(token))
  const tokens = usefulTokens.length ? usefulTokens : rawTokens
  const unique = new Set()

  return tokens.reduce((concepts, token) => {
    const key = singularToken(token)
    if (!key || unique.has(key)) return concepts
    unique.add(key)
    concepts.push(alternativesFor(token))
    return concepts
  }, [])
}

const fieldConceptQuality = (field, alternatives) => Math.max(
  0,
  ...alternatives.flatMap((alternative) => (
    field.tokens.map((candidate) => tokenMatchQuality(candidate, alternative))
  )),
)

export function getProductSearchScore(product, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return 0

  const concepts = buildQueryConcepts(query)
  if (!concepts.length) return -1

  const document = getProductSearchDocument(product)
  if (!concepts.every((alternatives) => (
    alternatives.some((alternative) => (
      document.allTokens.some((candidate) => tokenMatchQuality(candidate, alternative) > 0)
    ))
  ))) return -1

  let score = concepts.reduce((total, alternatives) => {
    const bestFieldScore = Math.max(
      0,
      ...Object.values(document.fields)
        .map((field) => {
          const quality = fieldConceptQuality(field, alternatives)
          if (quality === 0) return 0
          if (quality === 1) return field.weight * 0.55
          if (quality === 2) return field.weight * 0.75
          if (quality === 3) return field.weight * 0.9
          return field.weight
        }),
    )
    return total + bestFieldScore
  }, 0)

  const { fields } = document
  if (fields.name.text === normalizedQuery) score += 120
  else if (fields.name.text.startsWith(normalizedQuery)) score += 70
  else if (fields.name.text.includes(normalizedQuery)) score += 45
  if (fields.brand.text === normalizedQuery) score += 55
  else if (fields.brand.text.includes(normalizedQuery)) score += 25
  if (fields.flavors.text.includes(normalizedQuery)) score += 30
  if (fields.compatibility.text.includes(normalizedQuery)) score += 35
  if (fields.specs.text.includes(normalizedQuery)) score += 20

  return score
}

export function matchesProductSearch(product, query) {
  return getProductSearchScore(product, query) >= 0
}

export function rankProductsBySearch(products = [], query = '') {
  if (!normalizeSearchText(query)) return [...products]

  return products
    .map((product, index) => ({
      product,
      index,
      score: getProductSearchScore(product, query),
    }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product)
}

export function searchProducts(products = [], query = '', { limit } = {}) {
  const results = rankProductsBySearch(products, query)
  return Number.isInteger(limit) && limit >= 0 ? results.slice(0, limit) : results
}
