/**
 * Normalise une chaîne de caractères : minuscules et suppression des accents.
 */
export function normalizeText(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Calcule la distance de Levenshtein entre deux mots (tolérance aux fautes de frappe).
 */
export function levenshteinDistance(a = '', b = '') {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i += 1) d[i][0] = i
  for (let j = 0; j <= n; j += 1) d[0][j] = j

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // suppression
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  return d[m][n]
}

/**
 * Recherche floue (Fuzzy Search) dans la liste de produits.
 * Tolère les fautes de frappe (ex: "Vaporeso" -> "Vaporesso", "Lequideo" -> "Liquideo").
 */
export function fuzzySearchProducts(query = '', products = [], maxResults = 8) {
  const normQuery = normalizeText(query)
  if (!normQuery) return []

  const queryTokens = normQuery.split(/\s+/).filter(Boolean)

  const scored = products.map((product) => {
    const normName = normalizeText(product.name)
    const normBrand = normalizeText(product.brand)
    const normType = normalizeText(product.type)
    const normCategory = normalizeText(product.category || '')
    const normShort = normalizeText(product.short || '')
    const normLong = normalizeText(product.long || '')

    const nameTokens = normName.split(/\s+/).filter(Boolean)
    const brandTokens = normBrand.split(/\s+/).filter(Boolean)

    let score = 0

    // 1. Match exact de la requête entière dans le nom ou la marque
    if (normName.includes(normQuery)) score += 100
    if (normBrand.includes(normQuery)) score += 80
    if (normType.includes(normQuery)) score += 60
    if (normCategory.includes(normQuery)) score += 50
    if (normShort.includes(normQuery)) score += 30
    if (normLong.includes(normQuery)) score += 15

    // 2. Analyse mot par mot (query tokens vs product tokens)
    for (const qToken of queryTokens) {
      // Match direct ou préfixe
      if (normName.includes(qToken)) score += 40
      if (normBrand.includes(qToken)) score += 35
      if (normType.includes(qToken)) score += 25
      if (normShort.includes(qToken)) score += 15

      // Distance de Levenshtein pour tolérer les fautes de frappe sur la marque ou les mots principaux
      if (qToken.length >= 4) {
        // Vérification sur les mots du nom
        for (const nToken of nameTokens) {
          if (nToken.length >= 4) {
            const dist = levenshteinDistance(qToken, nToken)
            if (dist === 1) score += 30
            else if (dist === 2) score += 15
          }
        }
        // Vérification sur les mots de la marque
        for (const bToken of brandTokens) {
          if (bToken.length >= 4) {
            const dist = levenshteinDistance(qToken, bToken)
            if (dist === 1) score += 35
            else if (dist === 2) score += 20
          }
        }
      }
    }

    // Préférence si le produit est en stock et qu'il y a un match
    if (score > 0 && product.stock > 0) score += 5

    return { product, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product)
    .slice(0, maxResults)
}
