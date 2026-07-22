// Source unique des informations de la boutique physique THEKLOPE.
// Utilisée pour le schéma LocalBusiness (accueil + pages SEO locales).
// Enrichir ce fichier améliore directement le référencement local Google/Bing.

export const STORE = {
  name: 'THEKLOPE',
  url: 'https://www.theklope.com',
  image: 'https://www.theklope.com/og-image.jpg',
  telephone: '+33491555555',
  priceRange: '$$',
  address: {
    streetAddress: '188 rue de Rome',
    addressLocality: 'Marseille',
    postalCode: '13006',
    addressCountry: 'FR',
  },
  geo: { latitude: 43.2905, longitude: 5.3801 },
  // Zone desservie : boutique à Marseille + e-commerce France entière.
  areaServed: ['Marseille', 'Bouches-du-Rhône', 'France'],
}

// Horaires d'ouverture de la boutique physique.
// ⚠️ À COMPLÉTER avec les vrais horaires : dès qu'ils sont renseignés ici,
// ils enrichissent automatiquement le schéma LocalBusiness (Google peut
// alors afficher « Ouvert / Fermé » dans les résultats locaux).
// Format schema.org OpeningHoursSpecification. Exemple (à adapter) :
//   { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '10:00', closes: '19:00' },
//   { days: ['Saturday'], opens: '10:00', closes: '19:00' },
export const STORE_HOURS = []

// Profils externes (fiche Google Business, réseaux sociaux) pour le champ sameAs.
// ⚠️ À COMPLÉTER : ajouter l'URL de la fiche Google Business et des réseaux
// une fois créés. Renforce l'entité et le référencement local.
export const STORE_SAME_AS = []

function openingHoursSpecification() {
  if (!Array.isArray(STORE_HOURS) || STORE_HOURS.length === 0) return undefined
  return STORE_HOURS.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days.map((d) => `https://schema.org/${d}`),
    opens: slot.opens,
    closes: slot.closes,
  }))
}

// Construit l'objet LocalBusiness (schema.org) à partir des données ci-dessus.
export function buildLocalBusinessSchema() {
  const schema = {
    '@type': 'LocalBusiness',
    '@id': `${STORE.url}/#store`,
    name: STORE.name,
    url: STORE.url,
    image: STORE.image,
    telephone: STORE.telephone,
    priceRange: STORE.priceRange,
    address: {
      '@type': 'PostalAddress',
      ...STORE.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: STORE.geo.latitude,
      longitude: STORE.geo.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${STORE.address.streetAddress}, ${STORE.address.postalCode} ${STORE.address.addressLocality}`,
    )}`,
    areaServed: STORE.areaServed,
  }

  const hours = openingHoursSpecification()
  if (hours) schema.openingHoursSpecification = hours
  if (STORE_SAME_AS.length) schema.sameAs = STORE_SAME_AS

  return schema
}
