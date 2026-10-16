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

// -----------------------------------------------------------------------------
// Les trois boutiques du gérant (confirmées par l'exploitant le 16/10/2026,
// identiques à leurs fiches Google). Chaque fiche Google pointe déjà vers
// theklope.com : le site doit présenter les mêmes nom, adresse, téléphone et
// horaires, sans quoi Google ne relie pas les fiches à la même enseigne.
// -----------------------------------------------------------------------------
const formatPhone = (international) => `0${international.replace('+33', '')}`.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const STORES = [
  {
    id: 'theklope',
    name: 'THEKLOPE',
    streetAddress: STORE.address.streetAddress,
    postalCode: STORE.address.postalCode,
    addressLocality: STORE.address.addressLocality,
    district: 'Marseille 6e — Castellane',
    telephone: STORE_PHONE,
    hours: STORE_HOURS,
    hoursLabel: 'Du lundi au vendredi, 9 h – 19 h',
    googleUrl: STORE_SAME_AS[0],
    page: '/boutique-vape-marseille',
  },
  {
    id: 'clope-and-clope-marseille',
    name: 'Clope and Clope',
    streetAddress: '49 rue de Rome',
    postalCode: '13001',
    addressLocality: 'Marseille',
    district: 'Marseille 1er — Noailles',
    telephone: '+33983741461',
    hours: [{ days: WEEKDAYS, opens: '09:00', closes: '19:00' }],
    hoursLabel: 'Du lundi au vendredi, 9 h – 19 h',
    googleUrl: 'https://maps.google.com/?cid=13522653804705001384',
    page: '/nos-boutiques',
  },
  {
    id: 'clope-and-clope-salon',
    name: 'Clope and Clope',
    streetAddress: '36 cours Carnot',
    postalCode: '13300',
    addressLocality: 'Salon-de-Provence',
    district: 'Salon-de-Provence — centre-ville',
    telephone: '+33490560080',
    hours: [{ days: [...WEEKDAYS, 'Saturday'], opens: '09:00', closes: '19:00' }],
    hoursLabel: 'Du lundi au samedi, 9 h – 19 h',
    googleUrl: null,
    page: '/cigarette-electronique-salon-de-provence',
  },
].map((store) => ({
  ...store,
  phoneDisplay: formatPhone(store.telephone),
  mapUrl: store.googleUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.name}, ${store.streetAddress}, ${store.postalCode} ${store.addressLocality}`,
  )}`,
}))

export const findStore = (id) => STORES.find((store) => store.id === id) || null

// Schéma d'une boutique. La boutique principale garde le schéma détaillé
// (géolocalisation, zone desservie) ; les autres sont rattachées à la même
// organisation, ce qui relie les trois fiches Google à l'enseigne.
export function buildStoreSchema(id) {
  if (id === 'theklope') return buildLocalBusinessSchema()
  const store = findStore(id)
  if (!store) return null
  return {
    '@type': 'Store',
    '@id': `${STORE.url}/nos-boutiques#${store.id}`,
    name: store.name,
    url: `${STORE.url}${store.page}`,
    image: STORE.image,
    telephone: store.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.streetAddress,
      addressLocality: store.addressLocality,
      postalCode: store.postalCode,
      addressCountry: 'FR',
    },
    hasMap: store.mapUrl,
    openingHoursSpecification: store.hours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days.map((d) => `https://schema.org/${d}`),
      opens: slot.opens,
      closes: slot.closes,
    })),
    parentOrganization: { '@id': `${STORE.url}/#organization` },
    ...(store.googleUrl ? { sameAs: [store.googleUrl] } : {}),
  }
}
