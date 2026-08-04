export const MAIN_NAV = [
  { to: '/boutique', label: 'Boutique' },
  { to: '/configurateur', label: 'Pack Sur Mesure -15%' },
  {
    to: '/categorie/e-liquides',
    label: 'E-liquides',
    children: [
      { to: '/categorie/e-liquides', label: '10 ml' },
      { to: '/categorie/e-liquides-50ml', label: '50 ml' },
      { to: '/categorie/e-liquides-100ml', label: '100 ml' },
    ],
  },
  {
    to: '/categorie/cigarettes-electroniques',
    label: 'Cigarettes électroniques',
    children: [
      { to: '/categorie/cigarettes-electroniques', label: 'Kits Cigarettes Electroniques' },
      { to: '/categorie/pods', label: 'Pod' },
      { to: '/categorie/puffs-rechargeables', label: 'Puffs Rechargeable' },
    ],
  },
  {
    to: '/categorie/resistances',
    label: 'Résistances',
    children: [
      { to: '/categorie/resistances', label: 'Résistances' },
      { to: '/categorie/cartouches', label: 'Cartouches' },
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
    to: '/categorie/accessoires',
    label: 'Accessoires',
    children: [
      { to: '/categorie/accessoires-accus', label: 'Accus' },
      { to: '/categorie/accessoires-chargeurs', label: 'Chargeurs' },
      { to: '/categorie/accessoires-clearo-tanks', label: 'Clearo / Tanks' },
      { to: '/categorie/accessoires-pyrex', label: 'Pyrex' },
    ],
  },
  { to: '/guides', label: 'Guides' },
  { to: '/boutique-vape-marseille', label: 'Marseille' },
]

