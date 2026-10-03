// =============================================================================
// Compatibilité résistances / cartouches ↔ matériel.
// -----------------------------------------------------------------------------
// Chaque liste a été vérifiée le 30/09/2026 sur la source indiquée (site du
// fabricant en priorité). Les fiches produits du catalogue indiquent souvent
// « Standard universel », ce qui est faux : ces données font foi.
//
// N'AJOUTEZ PAS une famille ou un appareil sans source : une compatibilité
// erronée fait acheter la mauvaise résistance (retour, client perdu).
// Familles volontairement absentes faute de source vérifiée : Vaporesso GT
// Cores, pods Luxe Q2 / Apex, Aspire CE5, Kangertech Dual Coil.
// =============================================================================
import { isCartoucheProduct, isResistanceProduct } from './catalog.js'

const productText = (p = {}) => [p.name, p.brand, p.type, p.short].filter(Boolean).join(' ')
const isConsumable = (p) => isResistanceProduct(p) || isCartoucheProduct(p)

export const COIL_FAMILIES = [
  {
    slug: 'vaporesso-xros',
    brand: 'Vaporesso',
    family: 'cartouches XROS',
    h1: 'Cartouche XROS : compatible avec quel pod Vaporesso ?',
    seoTitle: 'Cartouche XROS compatible : tous les pods XROS',
    devices: ['XROS', 'XROS 2', 'XROS 3', 'XROS 3 Mini', 'XROS 3 Nano', 'XROS 4', 'XROS 4 Mini', 'XROS 4 Nano', 'XROS 5', 'XROS Pro'],
    answer: 'Les cartouches XROS sont compatibles avec tous les pods de la gamme Vaporesso XROS, anciens comme récents.',
    caveats: [
      'Exception : la cartouche XROS 0,4 Ω ne fonctionne que sur les XROS Pro, XROS 4 et modèles plus récents. Les cartouches de 0,6 Ω à 1,2 Ω vont sur tous les XROS.',
    ],
    usage: 'Cartouche avec résistance intégrée : quand le goût faiblit, on remplace la cartouche entière.',
    source: { label: 'Vaporesso', url: 'https://www.vaporesso.com/series-product/xros-series/xros4-nano' },
    match: (p) => isCartoucheProduct(p) && /\bxros\b/i.test(productText(p)),
    categorySlug: 'cartouches',
  },
  {
    slug: 'vaporesso-gti',
    brand: 'Vaporesso',
    family: 'résistances GTi',
    h1: 'Résistance Vaporesso GTi : compatible iTank, iTank 2, iTank T',
    seoTitle: 'Résistance GTi Vaporesso compatible iTank, iTank 2, iTank T',
    devices: ['iTank', 'iTank 2', 'iTank T', 'Kits Vaporesso livrés avec un iTank (Target 200 iTank 2 Edition…)'],
    answer: 'Les résistances GTi (mesh) se montent dans les clearomiseurs Vaporesso iTank, iTank 2 et iTank T, et donc dans les kits livrés avec ces clearomiseurs.',
    caveats: ['Vérifiez le nom du clearomiseur gravé ou indiqué sur la boîte : un kit Vaporesso peut être vendu avec un autre clearomiseur selon l’édition.'],
    usage: 'Résistances mesh pour tirage direct (DTL) à puissance moyenne à élevée ; la puissance conseillée est indiquée sur chaque résistance.',
    source: { label: 'Vaporesso (iTank T)', url: 'https://www.vaporesso.com/series-product/itank-series/itank-t' },
    match: (p) => isConsumable(p) && /\bgti\b/i.test(productText(p)),
    categorySlug: 'resistances',
  },
  {
    slug: 'voopoo-pnp-x',
    brand: 'Voopoo',
    family: 'résistances PnP-X',
    h1: 'Résistance Voopoo Drag S2, Drag X2, Argus Pro 2 : les PnP-X',
    seoTitle: 'Résistance Drag S2 / Drag X2 / Argus Pro 2 : PnP-X Voopoo',
    devices: ['Drag S2', 'Drag X2', 'Argus Pro 2', 'Autres appareils Voopoo de la plateforme PnP X'],
    answer: 'Les Voopoo Drag S2, Drag X2 et Argus Pro 2 utilisent les résistances PnP-X.',
    caveats: ['Les PnP-X ne sont pas les PnP classiques : elles n’ont pas le même format. Vérifiez « PnP X » sur la boîte ou la notice de votre pod.'],
    usage: 'Résistances à emboîter (press-fit) : on retire l’ancienne, on enfonce la nouvelle, sans outil.',
    source: { label: 'Voopoo (Drag X2)', url: 'https://www.voopoo.com/drag-series/drag-x2' },
    match: (p) => isConsumable(p) && /\bpnp[\s-]*x\b/i.test(productText(p)),
    categorySlug: 'resistances-pnp-voopoo',
  },
  {
    slug: 'voopoo-tpp',
    brand: 'Voopoo',
    family: 'résistances TPP',
    h1: 'Résistance Voopoo Drag 3 et Drag X Plus : les TPP',
    seoTitle: 'Résistance Drag 3 / Drag X Plus : TPP Voopoo',
    devices: ['Drag 3', 'Drag X Plus', 'Pod TPP'],
    answer: 'Le Voopoo Drag 3 et le Drag X Plus sont livrés avec le pod TPP, qui utilise les résistances TPP (DM1, DM2, DM3, DM4).',
    caveats: ['Si votre kit est équipé d’un autre réservoir que le pod TPP, suivez la référence de résistance de ce réservoir.'],
    usage: 'Résistances de forte puissance pour tirage direct (DTL).',
    source: { label: 'Fiches revendeurs (TPP-DM3 pour Drag 3 et Drag X Plus)', url: 'https://www.alivape.com/products/voopoo-drag-x-plus-replacement-tpp-coil' },
    match: (p) => isConsumable(p) && /\btpp\b/i.test(productText(p)),
    categorySlug: 'resistances',
  },
  {
    slug: 'voopoo-ito',
    brand: 'Voopoo',
    family: 'résistances ITO',
    h1: 'Résistance Voopoo Doric 20 : les résistances ITO',
    seoTitle: 'Résistance Doric 20 et cartouche ITO : résistances ITO Voopoo',
    devices: ['Doric 20', 'Cartouche ITO (Doric 20, Doric 20 SE, Doric E, Doric Q)'],
    answer: 'Les résistances ITO se montent dans le Voopoo Doric 20 et dans la cartouche ITO, elle-même compatible avec les Doric 20, Doric 20 SE, Doric E et Doric Q.',
    caveats: [],
    usage: 'Résistances pour tirage indirect (MTL) ou légèrement aérien, adaptées aux e-liquides 10 ml et sels de nicotine.',
    source: { label: 'Voopoo (ITO Coils, Doric 20)', url: 'https://shop.voopoo.com/products/ito-coils' },
    match: (p) => isConsumable(p) && /\bito\b/i.test(productText(p)),
    categorySlug: 'resistances',
  },
  {
    slug: 'geekvape-z',
    brand: 'Geekvape',
    family: 'résistances Z (Zeus)',
    h1: 'Résistance Geekvape Z : compatible Zeus, Z Fli, Aegis Legend',
    seoTitle: 'Résistance Geekvape Z compatible Zeus, Z Subohm, Aegis Legend',
    devices: ['Clearomiseur Z (Zeus) Sub-Ohm', 'Z Fli et Z Fli 2', 'Z SE', 'P Sub-Ohm', 'Kits Aegis Legend 2, 3 et 5', 'Aegis Solo 3', 'L200, T200, S100'],
    answer: 'Les résistances Geekvape Z (et Z XM) se montent dans le clearomiseur Zeus Sub-Ohm et ses dérivés, et donc dans les kits Aegis livrés avec ces clearomiseurs.',
    caveats: ['Les Z XM (version « boost ») et les Z classiques ont le même format : tout appareil compatible Z accepte les Z XM.'],
    usage: 'Résistances mesh de forte puissance pour tirage direct (DTL).',
    source: { label: 'Geekvape (Z Series Coil)', url: 'https://www.geekvape.com/product/z-series-coil/' },
    match: (p) => isConsumable(p) && /geek\s*vape/i.test(productText(p)) && /\bz\b|z[\s-]*(series|s[ée]rie|coil|xm)/i.test(productText(p)) && !/zenith|innokin/i.test(productText(p)),
    categorySlug: 'resistances-geekvape-z',
  },
  {
    slug: 'geekvape-j',
    brand: 'Geekvape',
    family: 'résistances J Series',
    h1: 'Résistance Geekvape Digi Max et Digi Pro : les J Series',
    seoTitle: 'Résistance Geekvape Digi Max / Digi Pro : J Series',
    devices: ['Digi Max', 'Digi Pro', 'Cartouche JR (résistance externe)'],
    answer: 'Les Geekvape Digi Max et Digi Pro, ainsi que la cartouche JR à résistance externe, utilisent les résistances J Series.',
    caveats: [],
    usage: 'Résistances interchangeables : on garde la cartouche et on ne change que la résistance.',
    source: { label: 'Geekvape (J Series Coil)', url: 'https://store.geekvape.com/products/geekvape-j-series-coil-5ps-pack' },
    match: (p) => isConsumable(p) && /geek\s*vape/i.test(productText(p)) && /\bj[\s-]*(series|s[ée]rie)\b/i.test(productText(p)),
    categorySlug: 'resistances',
  },
  {
    slug: 'innokin-zenith',
    brand: 'Innokin',
    family: 'résistances Z (Zenith)',
    h1: 'Résistance Innokin Zenith, Zenith II, Zlide : les Z-Coils',
    seoTitle: 'Résistance Innokin Zenith, Zenith II, Zlide : Z-Coil',
    devices: ['Zenith', 'Zenith II', 'Zenith Pro', 'Zenith II Pro', 'Zlide', 'Kit Coolfire Z80 Zenith II'],
    answer: 'Les Z-Coils Innokin se montent dans toute la gamme Zenith (Zenith, Zenith II, Zenith Pro, Zenith II Pro) et dans le Zlide.',
    caveats: ['Ne pas confondre avec les résistances Z de Geekvape : même lettre, formats différents.'],
    usage: 'Résistances surtout pour tirage indirect (MTL) : 1,6 Ω et 0,8 Ω pour un tirage serré, 0,3 Ω pour un tirage plus aérien.',
    source: { label: 'Innokin (Zenith II)', url: 'https://www.innokin.com/zenith-ii' },
    // « Z Pro » exclu : non confirmé comme Z-Coil Zenith.
    match: (p) => isConsumable(p) && /innokin/i.test(productText(p)) && /\bz\b|zenith|z[\s-]*coil|s[ée]rie z/i.test(productText(p)) && !/\bz\s*pro\b/i.test(productText(p)),
    categorySlug: 'resistances-zenith-innokin',
  },
  {
    slug: 'aspire-nautilus',
    brand: 'Aspire',
    family: 'résistances Nautilus (BVC)',
    h1: 'Résistance Aspire Nautilus : BVC et mesh',
    seoTitle: 'Résistance Aspire Nautilus, Nautilus Mini, Nautilus GT',
    devices: ['Nautilus', 'Nautilus Mini', 'Nautilus GT'],
    answer: 'Les résistances Nautilus BVC se montent dans les clearomiseurs Aspire Nautilus et Nautilus Mini ; le Nautilus GT accepte toutes les résistances de la série Nautilus.',
    caveats: [],
    usage: 'Résistances pour tirage indirect (MTL), idéales avec des e-liquides 10 ml.',
    source: { label: 'Aspire', url: 'https://www.aspirecig.com/faq/what-coil-can-i-use-with-nautilus-gt-tank-are-nautilus-coils-compatible/' },
    match: (p) => isConsumable(p) && /nautilus/i.test(productText(p)),
    categorySlug: 'resistances',
  },
]

export const compatibilityPath = (family) => `/compatibilite/${family.slug}`
export const findCoilFamily = (slug) => COIL_FAMILIES.find((family) => family.slug === slug) || null

// Famille d'une fiche résistance/cartouche (pour afficher « Compatible avec »).
export const coilFamilyForProduct = (product) => COIL_FAMILIES.find((family) => family.match(product)) || null

export const productsForFamily = (family, products = []) => (
  products.filter((product) => family.match(product))
)

export function familyFaq(family) {
  return [
    { q: `Avec quels appareils les ${family.family} sont-elles compatibles ?`, a: `${family.answer} ${family.caveats.join(' ')}`.trim() },
    { q: `Comment choisir et utiliser les ${family.family} ?`, a: `${family.usage} La valeur en ohms et la puissance conseillée sont indiquées sur chaque résistance : plus la valeur est basse, plus le tirage est aérien.` },
    { q: 'Je ne suis pas sûr de mon modèle, que faire ?', a: 'Regardez le nom inscrit sur votre appareil ou sur sa boîte, ou apportez-le au 188 rue de Rome à Marseille : nous vérifions la compatibilité sur place.' },
  ]
}
