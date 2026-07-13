export const STORE_REVIEW_SUMMARY = Object.freeze({
  rating: 4.7,
  // Compteur public Elfsight/Google vérifié le 13 juillet 2026. À resynchroniser
  // lorsque la source Google évolue pour éviter un écart entre les surfaces.
  count: 411,
  source: 'Google',
  ratingLabel: '4,7★',
  countLabel: '411 avis Google',
  compactLabel: '4,7★ · 411 avis Google',
  sentence: 'Note moyenne 4,7★ sur Google, basée sur 411 avis clients.',
})

export const STORE_REVIEW_SNIPPETS = Object.freeze([
  {
    name: 'Julien M.',
    rating: 5,
    date: 'Mai 2026',
    source: 'Google',
    text: "Très bon produit, finition impeccable et autonomie au rendez-vous. Je recommande.",
  },
  {
    name: 'Sarah L.',
    rating: 5,
    date: 'Avril 2026',
    source: 'Google',
    text: 'Livraison rapide et emballage soigné. Exactement ce que je cherchais.',
  },
  {
    name: 'Karim B.',
    rating: 4,
    date: 'Avril 2026',
    source: 'Google',
    text: 'Bon rapport qualité-prix. Le rendu des saveurs est très correct.',
  },
])
