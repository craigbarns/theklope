export const MAIN_NAV = [
  { to: '/boutique', label: 'Boutique' },
  { to: '/configurateur', label: 'Pack Sur Mesure -15%' },
  {
    to: '/categorie/e-liquides',
    label: 'E-liquides',
    children: [
      { to: '/categorie/e-liquides-50ml', label: 'E-liquides 50 ml' },
      { to: '/categorie/e-liquides-100ml', label: 'E-liquides 100 ml' },
      { to: '/categorie/e-liquides-sels-de-nicotine', label: 'Sels de nicotine' },
      { to: '/categorie/e-liquides-fruites', label: 'Fruités' },
      { to: '/categorie/e-liquides-gourmands', label: 'Gourmands' },
      { to: '/categorie/e-liquides-menthe', label: 'Menthe & Frais' },
      { to: '/categorie/e-liquides-tabac', label: 'Tabac & Classic' },
    ],
  },
  {
    to: '/categorie/cigarettes-electroniques',
    label: 'Cigarettes électroniques',
    children: [
      { to: '/categorie/pods', label: 'Pods rechargeables' },
      { to: '/categorie/packs-debutants', label: 'Packs débutants' },
      { to: '/categorie/puffs-rechargeables', label: 'Puffs rechargeables' },
    ],
  },
  {
    to: '/categorie/resistances',
    label: 'Résistances',
    children: [
      { to: '/categorie/cartouches-xros', label: 'Cartouches XROS (Vaporesso)' },
      { to: '/categorie/resistances-geekvape-z', label: 'Résistances Z Coil (Geekvape)' },
      { to: '/categorie/resistances-pnp-voopoo', label: 'Résistances PnP (Voopoo)' },
      { to: '/categorie/resistances-zenith-innokin', label: 'Résistances Zenith (Innokin)' },
    ],
  },
  {
    to: '/categorie/diy',
    label: 'DIY',
    children: [
      { to: '/categorie/diy-bases', label: 'Bases neutres DIY' },
      { to: '/categorie/diy-aromes', label: 'Arômes concentrés' },
      { to: '/categorie/diy-boosters', label: 'Boosters de nicotine' },
      { to: '/calculette-diy', label: 'Calculette dosage DIY' },
    ],
  },
  {
    to: '/categories',
    label: 'Marques',
    children: [
      { to: '/categorie/marque-vaporesso', label: 'Vaporesso' },
      { to: '/categorie/marque-geekvape', label: 'Geekvape' },
      { to: '/categorie/marque-voopoo', label: 'Voopoo' },
      { to: '/categorie/marque-liquideo', label: 'Liquideo' },
      { to: '/categorie/marque-freaks', label: 'Freaks' },
      { to: '/categorie/marque-liquidarom', label: 'Liquidarom' },
      { to: '/categorie/marque-alfaliquid', label: 'Alfaliquid' },
      { to: '/categorie/marque-pulp', label: 'Pulp' },
    ],
  },
  { to: '/categorie/accessoires', label: 'Accessoires' },
  { to: '/guides', label: 'Guides' },
  { to: '/boutique-vape-marseille', label: 'Marseille' },
  { to: '/admin?tab=emailing', label: '📧 Emailing' },
]

