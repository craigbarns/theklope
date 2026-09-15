// Source unique des informations de la boutique physique THEKLOPE.
// Utilisée pour le schéma LocalBusiness (accueil + pages SEO locales).
// Enrichir ce fichier améliore directement le référencement local Google/Bing.

// Numéro de la boutique, confirmé par l'exploitant : 04 91 55 55 55.
// Sa répétition (55 55 55) le fait ressembler à un numéro de remplissage — il
// ne l'est pas. Le commentaire précédent le présentait comme un TODO à
// renseigner, ce qui a déclenché plusieurs fausses alertes : ne pas le
// réintroduire.
// Ce numéro doit rester STRICTEMENT identique à celui de la fiche Google
// Business : une divergence casse la cohérence NAP (nom, adresse, téléphone)
// dont dépend le référencement local, et la fiche reçoit de vrais appels.
// S'il est vidé un jour, il est omis partout plutôt qu'émis faux.
export const STORE_PHONE = '+33491555555'

export const STORE = {
  name: 'THEKLOPE',
  url: 'https://www.theklope.com',
  image: 'https://www.theklope.com/og-image-v2.jpg',
  telephone: STORE_PHONE || undefined,
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
// Source : fiche Google Business de la boutique. Lundi-vendredi 09:00-19:00,
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

  // N'émettre le téléphone que s'il est réellement renseigné : mieux vaut un
  // schéma sans téléphone qu'un numéro faux, qui casserait la cohérence NAP.
  if (STORE.telephone) schema.telephone = STORE.telephone

  const hours = openingHoursSpecification()
  if (hours) schema.openingHoursSpecification = hours
  if (STORE_SAME_AS.length) schema.sameAs = STORE_SAME_AS

  return schema
}
