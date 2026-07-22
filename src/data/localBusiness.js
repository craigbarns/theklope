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
  geo: { latitude: 43.287001, longitude: 5.3828625 },
  // Zone desservie : boutique à Marseille + e-commerce France entière.
  areaServed: ['Marseille', 'Bouches-du-Rhône', 'France'],
}

// Horaires d'ouverture de la boutique physique.
// Source : fiche Google Business « The Klope ». Lundi-vendredi 09:00-19:00,
// fermé le week-end. Alimente le schéma LocalBusiness (Google peut afficher
// « Ouvert / Fermé » dans les résultats locaux).
export const STORE_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '19:00',
  },
]

// Profils externes (fiche Google Business, réseaux sociaux) pour le champ sameAs.
// Renforce l'entité et le référencement local.
export const STORE_SAME_AS = [
  'https://maps.google.com/?cid=16305250719771338856',
]

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
