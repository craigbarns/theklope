function buildContent({ intro, sections, faq = [] }) {
  return `
    <p>${intro}</p>
    ${sections
      .map(
        (section) => `
          <h2>${section.title}</h2>
          <p>${section.text}</p>
        `,
      )
      .join('')}
    <h2>Questions fréquentes</h2>
    ${faq
      .map(
        (item) => `
          <h3>${item.q}</h3>
          <p>${item.a}</p>
        `,
      )
      .join('')}
    <blockquote>Produits de vapotage réservés aux personnes majeures. La nicotine crée une forte dépendance. En cas de doute médical ou d’objectif d’arrêt du tabac, demandez conseil à un professionnel de santé.</blockquote>
  `
}

const makePost = ({
  slug,
  title,
  description,
  date,
  isoDate,
  readTime,
  category,
  image,
  summary,
  intro,
  sections,
  faq,
  relatedProductIds = [],
}) => ({
  slug,
  title,
  description,
  author: 'Equipe THEKLOPE',
  date,
  isoDate,
  readTime,
  category,
  image,
  summary,
  content: buildContent({ intro, sections, faq }),
  relatedProductIds,
})

export const BLOG_POSTS = [
  makePost({
    slug: 'comment-choisir-sa-resistance',
    title: 'Comment choisir sa résistance de cigarette électronique ?',
    description:
      'Guide pour choisir sa résistance : valeur en ohm, plage de watts, tirage serré ou aérien et compatibilité avec le matériel.',
    date: '21 Juillet 2026',
    isoDate: '2026-07-21T08:00:00+02:00',
    readTime: '5 min',
    category: 'Matériel',
    image: '/products/resistances-gti-mesh-015020405-vaporesso-pack-de-5.jpg',
    summary:
      'La valeur en ohm, la plage de puissance indiquée par le fabricant et le tirage recherché sont les trois critères à croiser avant d’acheter une résistance.',
    intro:
      'Choisir une résistance ne se limite pas à reprendre la même valeur que la précédente. Ohm, watts recommandés et tirage doivent être cohérents avec le matériel et l’usage.',
    sections: [
      {
        title: 'Comprendre la valeur en ohm',
        text:
          'Une résistance basse (autour de 0,15 à 0,5 ohm) demande plus de puissance et convient généralement à un tirage aérien avec une vapeur plus dense. Une résistance plus haute (1 ohm et plus) fonctionne à puissance modérée et correspond souvent à un tirage serré.',
      },
      {
        title: 'Respecter la plage de watts recommandée',
        text:
          'Chaque résistance est imprimée avec une plage de puissance conseillée par le fabricant. Rester dans cette plage limite le risque de goût de brûlé et prolonge la durée de vie du coton.',
      },
      {
        title: 'Vérifier la compatibilité avant achat',
        text:
          'La valeur en ohm ne suffit pas : la série et la marque doivent correspondre au réservoir ou au pod utilisé. Deux résistances de même valeur mais de séries différentes peuvent ne pas se clipser correctement.',
      },
    ],
    faq: [
      {
        q: 'Quelle valeur d’ohm choisir pour un tirage serré ?',
        a: 'Une résistance plus haute, souvent supérieure à 1 ohm, convient généralement mieux à un tirage serré et à une puissance modérée.',
      },
      {
        q: 'Une résistance basse consomme-t-elle plus de e-liquide ?',
        a: 'Oui, généralement. Une résistance basse fonctionne à plus forte puissance et produit plus de vapeur, ce qui augmente la consommation de e-liquide.',
      },
    ],
    relatedProductIds: [
      'gti-mesh-015020405-vaporesso-pack-de-5-300',
      'ito-v2-0-7-1-2-voopoo-pack-de-5-301',
      'pnp-x-015020304506ohm-voopoo-pack-de-5-302',
    ],
  }),
  makePost({
    slug: 'quelle-cigarette-electronique-choisir',
    title: 'Quelle cigarette électronique choisir en 2026 ? Guide responsable',
    description:
      'Guide responsable pour choisir une cigarette électronique pour adulte : format, autonomie, tirage, compatibilité e-liquide et consommables.',
    date: '9 Juillet 2026',
    isoDate: '2026-07-09T08:00:00+02:00',
    readTime: '6 min',
    category: 'Guides responsables',
    image: '/products/kit-xros-pro-2_1.jpg',
    summary:
      'Pod, kit compact, box plus puissante : voici les critères utiles pour comparer les formats sans promesse médicale et avec les précautions nécessaires.',
    intro:
      'Choisir une cigarette électronique revient d’abord à choisir un format compatible avec son usage, son niveau d’expérience et les e-liquides envisagés.',
    sections: [
      {
        title: 'Comparer les formats',
        text:
          'Un pod rechargeable est compact et simple. Un kit tubulaire ou une box offre souvent plus d’autonomie, plus de puissance et davantage de réglages. Le bon choix dépend du confort recherché et de la compatibilité des consommables.',
      },
      {
        title: 'Regarder l’autonomie et le tirage',
        text:
          'L’autonomie s’exprime en mAh et doit être cohérente avec la fréquence d’utilisation. Le tirage serré consomme généralement moins qu’un tirage très aérien, qui demande plus de puissance et de liquide.',
      },
      {
        title: 'Vérifier les consommables',
        text:
          'Avant d’acheter, vérifiez la disponibilité des résistances, cartouches, réservoirs et joints. Un matériel fiable est aussi un matériel dont les pièces restent faciles à trouver.',
      },
    ],
    faq: [
      {
        q: 'Quelle cigarette électronique choisir pour une première utilisation ?',
        a: 'Un pod ou un kit simple, avec peu de réglages et des consommables faciles à identifier, est souvent plus accessible pour un adulte qui découvre la vape.',
      },
      {
        q: 'La cigarette électronique est-elle sans risque ?',
        a: 'Non. Les produits de vapotage ne doivent pas être présentés comme totalement sans risque. Les produits nicotinés créent une dépendance et sont interdits aux mineurs.',
      },
    ],
    relatedProductIds: ['cartouches-xros-series-3ml-4pcs-vaporesso-50', 'q16-pro-146', 'doric-astra-2500mah-voopoo-271'],
  }),
  makePost({
    slug: 'pod-ou-cigarette-electronique',
    title: 'Pod ou cigarette électronique classique : quelles différences ?',
    description:
      'Comparatif pod rechargeable et cigarette électronique classique : simplicité, autonomie, cartouches, résistances et usage responsable.',
    date: '8 Juillet 2026',
    isoDate: '2026-07-08T08:00:00+02:00',
    readTime: '5 min',
    category: 'Matériel',
    image: '/products/kit-pod-luxe-xr-max-2800mah-vaporesso.jpg',
    summary:
      'Le pod privilégie la simplicité et le format compact, tandis qu’un kit classique mise sur l’autonomie et les réglages.',
    intro:
      'Les pods rechargeables et les kits classiques répondent à des besoins différents. Les comparer permet d’éviter un achat incompatible avec son usage réel.',
    sections: [
      {
        title: 'Les points forts du pod',
        text:
          'Un pod est compact, léger et facile à remplir. Les cartouches se changent rapidement et les réglages sont souvent limités, ce qui réduit les erreurs de manipulation.',
      },
      {
        title: 'Les points forts du kit classique',
        text:
          'Un kit classique offre souvent une meilleure autonomie, une puissance ajustable et un réservoir plus généreux. Il demande en revanche plus d’attention sur les résistances et les réglages.',
      },
      {
        title: 'Choisir selon le e-liquide',
        text:
          'Un pod accepte généralement mieux les e-liquides fluides. Les kits plus puissants peuvent demander des liquides plus riches en VG et des résistances adaptées.',
      },
    ],
    faq: [
      {
        q: 'Un pod rechargeable est-il plus simple qu’une box ?',
        a: 'Oui, dans la plupart des cas. Il y a moins de réglages et les cartouches sont plus faciles à remplacer.',
      },
      {
        q: 'Une box est-elle toujours plus performante ?',
        a: 'Pas forcément. Elle peut être plus puissante, mais le meilleur choix reste celui qui correspond au tirage, à l’autonomie et au e-liquide recherchés.',
      },
    ],
    relatedProductIds: ['luxe-xr-max-2800mah-vaporesso-283', 'drag-s2-avec-pnp-x-voopoo-new-colors-280'],
  }),
  makePost({
    slug: 'choisir-taux-nicotine-e-liquide',
    title: 'Taux de nicotine e-liquide : repères responsables pour adultes',
    description:
      'Comprendre les taux de nicotine d’un e-liquide, les sels de nicotine, le matériel compatible et les précautions à respecter.',
    date: '7 Juillet 2026',
    isoDate: '2026-07-07T08:00:00+02:00',
    readTime: '6 min',
    category: 'E-liquides',
    image: '/products/alfaliquid-classique-california-10ml.webp',
    summary:
      'Le taux de nicotine doit être choisi avec prudence, en tenant compte du matériel, de la sensation recherchée et des précautions de santé.',
    intro:
      'Le taux de nicotine influence fortement le ressenti en gorge et la fréquence d’utilisation. Il doit être abordé avec des repères clairs et responsables.',
    sections: [
      {
        title: 'Comprendre les dosages',
        text:
          'Les taux sont exprimés en mg/ml. Plus le taux est élevé, plus la présence de nicotine est importante. La nicotine crée une forte dépendance et les produits concernés sont réservés aux adultes.',
      },
      {
        title: 'Adapter le taux au matériel',
        text:
          'Un pod peu puissant peut être utilisé avec des taux plus élevés qu’un matériel très aérien. À forte puissance, un dosage trop élevé peut être inconfortable.',
      },
      {
        title: 'Sels de nicotine et nicotine classique',
        text:
          'Les sels de nicotine procurent souvent une sensation plus douce à taux élevé. Ils doivent être utilisés avec du matériel compatible, généralement peu puissant.',
      },
    ],
    faq: [
      {
        q: 'Comment choisir son taux de nicotine ?',
        a: 'Il faut tenir compte du matériel, du ressenti et de l’usage. En cas d’objectif d’arrêt du tabac ou de doute médical, demandez conseil à un professionnel de santé.',
      },
      {
        q: 'Un non-fumeur doit-il utiliser un e-liquide nicotiné ?',
        a: 'Non. Les produits nicotinés créent une dépendance et sont déconseillés aux non-fumeurs.',
      },
    ],
    relatedProductIds: ['california-10ml-194', 'gold-blend-10ml-liquidarom-228'],
  }),
  makePost({
    slug: 'comprendre-ratio-pg-vg',
    title: 'Ratio PG/VG : comprendre la compatibilité e-liquide et résistance',
    description:
      'Guide PG/VG pour e-liquide : rôle du propylène glycol, de la glycérine végétale, compatibilité avec pods, kits et résistances.',
    date: '6 Juillet 2026',
    isoDate: '2026-07-06T08:00:00+02:00',
    readTime: '5 min',
    category: 'E-liquides',
    image: '/products/e-liquide-cola-10ml-liquidarom_2.jpg',
    summary:
      'Le ratio PG/VG conditionne la fluidité du liquide, le rendu des saveurs, la vapeur et la compatibilité avec votre résistance.',
    intro:
      'Le PG/VG est une information essentielle sur une fiche e-liquide. Il indique l’équilibre entre fluidité, vapeur et sensation en gorge.',
    sections: [
      {
        title: 'Le rôle du PG',
        text:
          'Le propylène glycol favorise la fluidité, le rendu des saveurs et la sensation en gorge. Un liquide riche en PG convient souvent aux petits matériels et aux pods.',
      },
      {
        title: 'Le rôle de la VG',
        text:
          'La glycérine végétale est plus épaisse et produit une vapeur plus dense. Les liquides riches en VG demandent des résistances et puissances adaptées.',
      },
      {
        title: 'Éviter fuites et goûts altérés',
        text:
          'Un liquide trop fluide peut favoriser les fuites sur certains réservoirs. Un liquide trop épais peut mal alimenter une petite résistance et provoquer un goût de brûlé.',
      },
    ],
    faq: [
      {
        q: 'Quel ratio PG/VG choisir pour un pod ?',
        a: 'Un ratio équilibré comme 50/50 est souvent compatible avec de nombreux pods, mais il faut toujours vérifier la notice du fabricant.',
      },
      {
        q: 'Quel ratio PG/VG choisir pour une box puissante ?',
        a: 'Les matériels puissants utilisent souvent des liquides plus riches en VG, à condition que la résistance soit prévue pour cet usage.',
      },
    ],
    relatedProductIds: ['cola-liquidarom-44', 'caffe-latte-29'],
  }),
  makePost({
    slug: 'quand-changer-resistance',
    title: 'Quand changer sa résistance de cigarette électronique ?',
    description:
      'Signes d’usure d’une résistance de cigarette électronique : goût de brûlé, baisse de vapeur, fuites, amorçage et compatibilité.',
    date: '5 Juillet 2026',
    isoDate: '2026-07-05T08:00:00+02:00',
    readTime: '5 min',
    category: 'Entretien',
    image: '/products/resistances-ito-v2-0-7-1-2-voopoo-pack-de-5.webp',
    summary:
      'Une résistance usée se reconnaît souvent au goût, à la vapeur, aux fuites ou à une sensation moins régulière.',
    intro:
      'La résistance est un consommable. Sa durée de vie varie selon le liquide, la puissance, la fréquence d’utilisation et l’amorçage.',
    sections: [
      {
        title: 'Les signes d’usure',
        text:
          'Un goût de brûlé, une saveur moins nette, une vapeur plus faible ou des fuites inhabituelles peuvent indiquer que la résistance arrive en fin de vie.',
      },
      {
        title: 'Les facteurs qui accélèrent l’usure',
        text:
          'Les liquides très sucrés, les puissances trop élevées et les enchaînements de bouffées sans pause peuvent fatiguer plus vite le coton et le fil résistif.',
      },
      {
        title: 'Changer avec la bonne référence',
        text:
          'La valeur en ohm et la série de résistance doivent correspondre au réservoir. Une référence proche visuellement peut être incompatible.',
      },
    ],
    faq: [
      {
        q: 'Combien de temps dure une résistance ?',
        a: 'La durée varie fortement. Elle peut aller de quelques jours à plusieurs semaines selon l’usage, le liquide et la puissance.',
      },
      {
        q: 'Peut-on nettoyer une résistance ?',
        a: 'Un rinçage ne restaure généralement pas une résistance usée. Le remplacement reste la solution la plus fiable.',
      },
    ],
    relatedProductIds: ['gti-mesh-015020405-vaporesso-pack-de-5-300', 'ito-v2-0-7-1-2-voopoo-pack-de-5-301'],
  }),
  makePost({
    slug: 'comment-amorcer-resistance',
    title: 'Comment amorcer une résistance neuve ?',
    description:
      'Méthode simple pour amorcer une résistance neuve : imbiber le coton, remplir le réservoir, attendre et démarrer à puissance modérée.',
    date: '4 Juillet 2026',
    isoDate: '2026-07-04T08:00:00+02:00',
    readTime: '4 min',
    category: 'Entretien',
    image: '/products/resistances-pnp-x-015020304506ohm-voopoo-pack-de-5.jpg',
    summary:
      'L’amorçage protège le coton de la résistance et limite le risque de goût de brûlé dès la première utilisation.',
    intro:
      'Une résistance neuve contient du coton sec. L’amorcer correctement permet au e-liquide de l’imbiber avant la première bouffée.',
    sections: [
      {
        title: 'Imbiber le coton visible',
        text:
          'Déposez quelques gouttes de e-liquide sur les ouvertures où le coton est visible. Inutile de noyer la résistance : l’objectif est de lancer l’imbibition.',
      },
      {
        title: 'Remplir et patienter',
        text:
          'Installez la résistance, remplissez le réservoir et attendez plusieurs minutes. Les liquides plus épais peuvent demander un temps d’attente plus long.',
      },
      {
        title: 'Démarrer doucement',
        text:
          'Commencez à puissance modérée, dans la plage recommandée par le fabricant. Augmentez progressivement si nécessaire.',
      },
    ],
    faq: [
      {
        q: 'Que se passe-t-il si on n’amorce pas une résistance ?',
        a: 'Le coton peut chauffer à sec et produire un goût de brûlé durable. La résistance peut être abîmée dès les premières bouffées.',
      },
      {
        q: 'Combien de temps attendre après remplissage ?',
        a: 'Quelques minutes suffisent souvent, mais il faut adapter selon la taille de la résistance et la viscosité du e-liquide.',
      },
    ],
    relatedProductIds: ['pnp-x-015020304506ohm-voopoo-pack-de-5-302', 'bvc-nautilus-28'],
  }),
  makePost({
    slug: 'cigarette-electronique-qui-fuit',
    title: 'Cigarette électronique qui fuit : causes et gestes utiles',
    description:
      'Comprendre les fuites d’une cigarette électronique : résistance, joints, remplissage, ratio PG/VG et réglages d’airflow.',
    date: '3 Juillet 2026',
    isoDate: '2026-07-03T08:00:00+02:00',
    readTime: '5 min',
    category: 'Entretien',
    image: '/products/BVC NAUTILUS.jpg',
    summary:
      'Les fuites viennent souvent d’un mauvais remplissage, d’une résistance usée, d’un e-liquide trop fluide ou d’un joint déplacé.',
    intro:
      'Une fuite n’indique pas toujours un matériel défectueux. Dans beaucoup de cas, elle provient d’une incompatibilité ou d’un geste de remplissage.',
    sections: [
      {
        title: 'Vérifier la résistance',
        text:
          'Une résistance mal clipsée, mal vissée ou trop usée peut laisser passer le liquide. Remplacez-la si le goût et la vapeur se dégradent.',
      },
      {
        title: 'Contrôler le remplissage',
        text:
          'Ne versez pas de e-liquide dans la cheminée centrale. Refermez correctement le réservoir après remplissage pour préserver la pression interne.',
      },
      {
        title: 'Adapter le PG/VG',
        text:
          'Un liquide trop fluide peut traverser plus facilement certains réservoirs. Consultez les recommandations du fabricant pour choisir le bon ratio.',
      },
    ],
    faq: [
      {
        q: 'Pourquoi mon pod fuit-il dans la poche ?',
        a: 'La chaleur, la pression, une cartouche usée ou un liquide trop fluide peuvent favoriser les fuites. Transportez le pod droit si possible.',
      },
      {
        q: 'Un airflow trop ouvert peut-il causer une fuite ?',
        a: 'Il peut y contribuer selon le matériel et le tirage. Un réglage trop ouvert avec une aspiration faible peut perturber l’alimentation.',
      },
    ],
    relatedProductIds: ['bvc-ce5-27', 'cartouches-xros-series-3ml-4pcs-vaporesso-50'],
  }),
  makePost({
    slug: 'gout-brule-cigarette-electronique',
    title: 'Goût de brûlé en vape : causes fréquentes',
    description:
      'Identifier les causes d’un goût de brûlé : résistance sèche, puissance trop élevée, e-liquide inadapté, chaîne de bouffées et usure.',
    date: '2 Juillet 2026',
    isoDate: '2026-07-02T08:00:00+02:00',
    readTime: '5 min',
    category: 'Entretien',
    image: '/products/resistance-dotcoil_3.jpg',
    summary:
      'Le goût de brûlé vient souvent d’un coton mal imbibé, d’une puissance trop forte ou d’une résistance arrivée en fin de vie.',
    intro:
      'Le goût de brûlé est l’un des signaux les plus courants indiquant que la résistance ne s’alimente pas correctement en e-liquide.',
    sections: [
      {
        title: 'Résistance insuffisamment imbibée',
        text:
          'Après un changement de résistance, l’amorçage et le temps d’attente sont indispensables. Sans cela, le coton chauffe à sec.',
      },
      {
        title: 'Puissance trop élevée',
        text:
          'Chaque résistance possède une plage de puissance recommandée. Dépasser cette plage peut brûler le coton et dégrader les saveurs.',
      },
      {
        title: 'Liquide trop épais ou usage trop intensif',
        text:
          'Un liquide riche en VG peut alimenter plus lentement les petites résistances. Les bouffées très rapprochées laissent moins de temps au coton pour se réimbiber.',
      },
    ],
    faq: [
      {
        q: 'Peut-on récupérer une résistance qui a un goût de brûlé ?',
        a: 'Si le coton est brûlé, le goût persiste souvent. Le remplacement est généralement nécessaire.',
      },
      {
        q: 'Comment éviter le dry hit ?',
        a: 'Amorcez la résistance, respectez la plage de puissance, gardez du liquide dans le réservoir et laissez quelques secondes entre les bouffées.',
      },
    ],
    relatedProductIds: ['gti-mesh-015020405-vaporesso-pack-de-5-300', 'pnp-x-015020304506ohm-voopoo-pack-de-5-302'],
  }),
  makePost({
    slug: 'eliquide-sans-nicotine',
    title: 'E-liquide sans nicotine : ce qu’il faut savoir',
    description:
      'Informations utiles sur les e-liquides sans nicotine : usages, saveurs, matériel compatible, grands formats et précautions.',
    date: '1 Juillet 2026',
    isoDate: '2026-07-01T08:00:00+02:00',
    readTime: '4 min',
    category: 'E-liquides',
    image: '/products/caffe-latte-50ml-0mg.jpg',
    summary:
      'Un e-liquide sans nicotine ne contient pas de nicotine, mais il reste un produit de vapotage réservé aux adultes.',
    intro:
      'Les e-liquides sans nicotine existent en petits et grands formats. Ils doivent être choisis selon la saveur, le PG/VG et le matériel utilisé.',
    sections: [
      {
        title: 'Sans nicotine ne veut pas dire sans précaution',
        text:
          'Même sans nicotine, un e-liquide est destiné à être vaporisé avec du matériel adapté. Il doit être conservé hors de portée des enfants et utilisé par des adultes.',
      },
      {
        title: 'Formats et compatibilité',
        text:
          'Les grands formats sont souvent proposés en 0 mg/ml. Le ratio PG/VG reste essentiel pour éviter fuites ou mauvaise alimentation de la résistance.',
      },
      {
        title: 'Saveurs disponibles',
        text:
          'Classic, menthe, fruité ou gourmand : le choix dépend surtout des préférences. Les fiches produits doivent préciser les informations de composition et d’usage.',
      },
    ],
    faq: [
      {
        q: 'Un e-liquide sans nicotine crée-t-il une dépendance à la nicotine ?',
        a: 'Non, il ne contient pas de nicotine. Il reste toutefois un produit de vapotage réservé aux adultes.',
      },
      {
        q: 'Peut-on ajouter de la nicotine dans un grand format ?',
        a: 'Certains formats sont prévus pour recevoir des boosters, dans le respect de la réglementation. Consultez la fiche produit.',
      },
    ],
    relatedProductIds: ['caffe-latte-29', 'eclats-de-noisettes-50ml-0mg-243'],
  }),
  makePost({
    slug: 'saveurs-eliquide-comment-choisir',
    title: 'Saveurs e-liquide : comment choisir sans se tromper',
    description:
      'Guide des familles de saveurs e-liquide : classic, menthe, fruité, frais, gourmand et critères de choix responsables.',
    date: '30 Juin 2026',
    isoDate: '2026-06-30T08:00:00+02:00',
    readTime: '5 min',
    category: 'E-liquides',
    image: '/products/CHERRY FROST 50ML.webp',
    summary:
      'Les saveurs influencent l’expérience, mais le choix doit aussi tenir compte du matériel, du taux de nicotine et du ratio PG/VG.',
    intro:
      'La saveur est un critère important, mais elle ne doit pas faire oublier les informations techniques du e-liquide.',
    sections: [
      {
        title: 'Les grandes familles de saveurs',
        text:
          'On retrouve généralement les familles classic, menthe, fruitées, fraîches et gourmandes. Chaque famille peut varier fortement selon la marque et la recette.',
      },
      {
        title: 'Tenir compte du matériel',
        text:
          'Un liquide très sucré peut user plus vite une résistance. Un liquide très frais peut être intense avec certains taux de nicotine.',
      },
      {
        title: 'Lire les informations produit',
        text:
          'La description doit préciser la contenance, le taux de nicotine, le ratio PG/VG et les précautions. Ces informations comptent autant que le goût annoncé.',
      },
    ],
    faq: [
      {
        q: 'Quelle saveur choisir pour commencer ?',
        a: 'Il n’existe pas de meilleure saveur universelle. Commencez par une famille qui vous attire et vérifiez surtout la compatibilité avec votre matériel.',
      },
      {
        q: 'Les liquides gourmands encrassent-ils plus les résistances ?',
        a: 'Certains liquides très sucrés peuvent encrasser plus rapidement les résistances. La durée dépend aussi de la puissance et de l’usage.',
      },
    ],
    relatedProductIds: ['cherry-frost-50ml-35', 'cassis-exquis-31'],
  }),
  makePost({
    slug: 'alternatives-puffs-jetables',
    title: 'Alternatives aux puffs jetables : pods rechargeables et kits compacts',
    description:
      'Alternatives aux puffs jetables pour adultes : pods rechargeables, cartouches, e-liquides compatibles et achat responsable.',
    date: '29 Juin 2026',
    isoDate: '2026-06-29T08:00:00+02:00',
    readTime: '5 min',
    category: 'Guides responsables',
    image: '/products/kit-xros-pro-2_2.jpg',
    summary:
      'Les pods rechargeables et kits compacts offrent une alternative réutilisable aux dispositifs jetables, sous réserve de conformité réglementaire.',
    intro:
      'Les produits jetables sont fortement encadrés. Pour les adultes, les pods rechargeables représentent une option plus durable et plus transparente.',
    sections: [
      {
        title: 'Le principe du pod rechargeable',
        text:
          'La batterie est réutilisée et seules les cartouches ou résistances sont remplacées. Le e-liquide peut être choisi selon la compatibilité du matériel.',
      },
      {
        title: 'Ce qu’il faut vérifier',
        text:
          'Regardez la capacité de la batterie, le type de cartouche, la résistance intégrée ou remplaçable et les taux de nicotine adaptés.',
      },
      {
        title: 'Conformité et adultes uniquement',
        text:
          'THEKLOPE privilégie les solutions conformes et ne cible pas les mineurs. Les produits nicotinés restent interdits aux moins de 18 ans.',
      },
    ],
    faq: [
      {
        q: 'THEKLOPE vend-il des puffs jetables ?',
        a: 'La disponibilité dépend de la réglementation applicable. La boutique met surtout en avant des alternatives rechargeables pour adultes.',
      },
      {
        q: 'Quel pod choisir à la place d’une puff ?',
        a: 'Un pod compact avec cartouches faciles à remplacer est généralement l’alternative la plus proche en simplicité.',
      },
    ],
    relatedProductIds: ['cartouches-xros-series-3ml-4pcs-vaporesso-50', 'argus-g2-mini-1500mah-voopoo-offre-groupee-1-1-279'],
  }),
  makePost({
    slug: 'entretenir-pod-rechargeable',
    title: 'Entretenir un pod rechargeable',
    description:
      'Conseils d’entretien pour pod rechargeable : cartouche, contacts, remplissage, condensation, stockage et remplacement des consommables.',
    date: '28 Juin 2026',
    isoDate: '2026-06-28T08:00:00+02:00',
    readTime: '4 min',
    category: 'Entretien',
    image: '/products/Kit Soul 2 - GeekVape.jpg',
    summary:
      'Un pod entretenu limite les fuites, garde des contacts propres et permet de mieux suivre l’usure des cartouches.',
    intro:
      'Le pod rechargeable est simple, mais il demande quelques gestes réguliers pour rester propre et fonctionner correctement.',
    sections: [
      {
        title: 'Nettoyer les contacts',
        text:
          'Essuyez régulièrement les contacts entre la cartouche et la batterie avec un tissu sec. La condensation peut perturber la détection ou la charge.',
      },
      {
        title: 'Surveiller la cartouche',
        text:
          'Remplacez la cartouche en cas de goût altéré, fuite répétée, baisse de vapeur ou résistance intégrée usée.',
      },
      {
        title: 'Stocker correctement',
        text:
          'Évitez la chaleur, le plein soleil et les poches serrées. Fermez bien les bouchons de remplissage et gardez le matériel hors de portée des enfants.',
      },
    ],
    faq: [
      {
        q: 'Faut-il vider son pod avant transport ?',
        a: 'Ce n’est pas toujours nécessaire, mais un réservoir très plein peut fuir plus facilement avec la chaleur ou les variations de pression.',
      },
      {
        q: 'Comment éviter la condensation ?',
        a: 'Essuyez régulièrement la base de la cartouche et évitez les aspirations trop fortes si le matériel n’est pas prévu pour cela.',
      },
    ],
    relatedProductIds: ['soul-par-2-geekvape-215', 'cartouches-xros-series-3ml-4pcs-vaporesso-50'],
  }),
  makePost({
    slug: 'tirage-serre-cigarette-electronique',
    title: 'Tirage serré ou aérien : comprendre les sensations',
    description:
      'Différences entre tirage serré MTL et tirage aérien DL : matériel, résistance, airflow, puissance et e-liquide compatible.',
    date: '27 Juin 2026',
    isoDate: '2026-06-27T08:00:00+02:00',
    readTime: '5 min',
    category: 'Matériel',
    image: '/products/Kit Q16 Pro Plus - Justfog.webp',
    summary:
      'Le tirage influence la puissance, la consommation de liquide, la sensation en gorge et le type de résistance à utiliser.',
    intro:
      'Le tirage décrit la façon dont l’air circule dans la cigarette électronique. Il change fortement le ressenti.',
    sections: [
      {
        title: 'Le tirage serré',
        text:
          'Le tirage serré, souvent appelé MTL, utilise moins d’air et des puissances modérées. Il est fréquent sur les pods et petits kits.',
      },
      {
        title: 'Le tirage aérien',
        text:
          'Le tirage aérien, ou DL, laisse passer plus d’air, produit plus de vapeur et demande des résistances prévues pour une puissance plus élevée.',
      },
      {
        title: 'Adapter l’airflow',
        text:
          'Un airflow trop ouvert ou trop fermé peut modifier la température, la consommation et le risque de fuite. Réglez-le progressivement.',
      },
    ],
    faq: [
      {
        q: 'Quel tirage consomme le plus de e-liquide ?',
        a: 'Le tirage aérien consomme généralement plus de e-liquide, car il utilise plus de puissance et produit plus de vapeur.',
      },
      {
        q: 'Quel tirage choisir pour un pod ?',
        a: 'La plupart des pods sont conçus pour un tirage serré ou semi-serré. Vérifiez la notice et la valeur de résistance.',
      },
    ],
    relatedProductIds: ['q16-pro-146', 'q16-147'],
  }),
  makePost({
    slug: 'autonomie-cigarette-electronique',
    title: 'Autonomie cigarette électronique : batterie, puissance et habitudes',
    description:
      'Comprendre l’autonomie d’une cigarette électronique : mAh, puissance, accus, recharge, sécurité et consommation.',
    date: '26 Juin 2026',
    isoDate: '2026-06-26T08:00:00+02:00',
    readTime: '5 min',
    category: 'Matériel',
    image: '/products/kit-gen-80s-avec-itank-2-silver.webp',
    summary:
      'L’autonomie dépend de la batterie, de la puissance réglée, de la résistance et des habitudes d’utilisation.',
    intro:
      'Deux cigarettes électroniques avec la même batterie peuvent avoir une autonomie différente selon la résistance et la puissance utilisées.',
    sections: [
      {
        title: 'Comprendre les mAh',
        text:
          'Les mAh indiquent la capacité de la batterie. Plus la capacité est élevée, plus l’autonomie potentielle est importante, à puissance équivalente.',
      },
      {
        title: 'La puissance change tout',
        text:
          'Un matériel utilisé à forte puissance consomme plus vite la batterie. Les résistances basses demandent souvent plus d’énergie.',
      },
      {
        title: 'Recharge et sécurité',
        text:
          'Utilisez un câble et un chargeur adaptés. Ne laissez pas le matériel charger sans surveillance prolongée et respectez les recommandations du fabricant.',
      },
    ],
    faq: [
      {
        q: 'Pourquoi ma batterie se vide vite ?',
        a: 'La puissance élevée, une résistance basse, une batterie vieillissante ou un usage intensif peuvent réduire l’autonomie.',
      },
      {
        q: 'Faut-il choisir une batterie intégrée ou des accus ?',
        a: 'La batterie intégrée est plus simple. Les accus demandent plus de précautions et un chargeur adapté, mais permettent plus de flexibilité.',
      },
    ],
    relatedProductIds: ['gen-80s-avec-itank-2-silver-273', 'aegis-solo-3-geekvape-265'],
  }),
  makePost({
    slug: 'lexique-vape',
    title: 'Lexique vape : les mots à connaître',
    description:
      'Lexique simple de la vape : pod, clearomiseur, résistance, PG/VG, airflow, MTL, DL, booster, sels de nicotine.',
    date: '25 Juin 2026',
    isoDate: '2026-06-25T08:00:00+02:00',
    readTime: '6 min',
    category: 'Guides responsables',
    image: '/products/KIT ZELOS.webp',
    summary:
      'Un lexique clair pour comprendre les fiches produits et comparer le matériel sans jargon inutile.',
    intro:
      'Le vocabulaire de la vape peut rendre le choix plus complexe. Voici les termes les plus utiles à connaître avant d’acheter.',
    sections: [
      {
        title: 'Matériel',
        text:
          'Un pod est un format compact à cartouche. Un clearomiseur est le réservoir qui contient la résistance. Une box est une batterie plus imposante avec réglages.',
      },
      {
        title: 'E-liquide',
        text:
          'Le PG/VG indique le ratio de base. Le taux de nicotine est exprimé en mg/ml. Un booster est un petit flacon nicotiné utilisé pour certains mélanges autorisés.',
      },
      {
        title: 'Tirage et réglages',
        text:
          'L’airflow règle l’arrivée d’air. MTL désigne un tirage serré. DL désigne un tirage plus aérien et plus puissant.',
      },
    ],
    faq: [
      {
        q: 'Que veut dire ohm ?',
        a: 'L’ohm mesure la valeur de la résistance. Elle influence la puissance recommandée, la vapeur et la compatibilité du e-liquide.',
      },
      {
        q: 'Que veut dire amorcer une résistance ?',
        a: 'C’est imbiber le coton d’une résistance neuve avant la première utilisation pour éviter de le chauffer à sec.',
      },
    ],
    relatedProductIds: ['kit-zelos-81', 'bvc-nautilus-28'],
  }),
  makePost({
    slug: 'lire-fiche-eliquide',
    title: 'Lire une fiche e-liquide : taux, PG/VG, contenance',
    description:
      'Les éléments à vérifier sur une fiche e-liquide : saveur, nicotine, PG/VG, volume, origine, compatibilité et avertissements.',
    date: '24 Juin 2026',
    isoDate: '2026-06-24T08:00:00+02:00',
    readTime: '4 min',
    category: 'E-liquides',
    image: '/products/TRIBECA.webp',
    summary:
      'Une bonne fiche e-liquide doit aider à vérifier la compatibilité, le taux, la contenance et les précautions d’utilisation.',
    intro:
      'Lire une fiche e-liquide évite d’acheter un produit incompatible avec son matériel ou son usage.',
    sections: [
      {
        title: 'Taux de nicotine',
        text:
          'Le taux doit être indiqué clairement. Les produits nicotinés sont réservés aux adultes et déconseillés aux non-fumeurs.',
      },
      {
        title: 'Ratio PG/VG',
        text:
          'Le ratio indique la fluidité du liquide et sa compatibilité avec les résistances. Il influence aussi le rendu de vapeur et la sensation en gorge.',
      },
      {
        title: 'Contenance et format',
        text:
          'La contenance aide à comprendre le prix et l’usage. Les formats nicotinés sont encadrés par la réglementation.',
      },
    ],
    faq: [
      {
        q: 'Quelles informations doivent apparaître sur une fiche e-liquide ?',
        a: 'Saveur, taux de nicotine, contenance, PG/VG, marque, prix, stock, précautions et compatibilité recommandée.',
      },
      {
        q: 'Pourquoi deux liquides de même saveur peuvent être différents ?',
        a: 'La recette, le ratio PG/VG, le taux de nicotine et les arômes utilisés peuvent modifier fortement le rendu.',
      },
    ],
    relatedProductIds: ['tribeca-176', 'fr-k-10ml-195'],
  }),
  makePost({
    slug: 'livraison-produits-vape-france',
    title: 'Livraison de produits vape en France : délais et précautions',
    description:
      'Informations livraison THEKLOPE en France : préparation, délais indicatifs, suivi, produits réservés aux adultes et retours.',
    date: '23 Juin 2026',
    isoDate: '2026-06-23T08:00:00+02:00',
    readTime: '4 min',
    category: 'Guides responsables',
    image: '/products/chargeur-mc2-xtar_1.webp',
    summary:
      'Avant de commander, vérifiez les délais de préparation, les conditions de retour et les restrictions liées aux produits de vapotage.',
    intro:
      'La livraison de produits vape doit rester claire : délais, suivi, conditions de retour et vente réservée aux majeurs.',
    sections: [
      {
        title: 'Préparation et expédition',
        text:
          'Les commandes sont préparées selon le stock disponible et les délais indiqués sur le site. Les informations de livraison doivent être exactes pour éviter les retards.',
      },
      {
        title: 'Produits sensibles',
        text:
          'Les e-liquides et consommables ouverts ne sont généralement pas repris pour des raisons d’hygiène. Consultez la politique de retour avant commande.',
      },
      {
        title: 'Vérification à réception',
        text:
          'Contrôlez les références, taux, saveurs et quantités à réception. Contactez rapidement le service client en cas d’erreur.',
      },
    ],
    faq: [
      {
        q: 'THEKLOPE livre-t-il en France ?',
        a: 'Oui, la boutique vise le marché français. Les conditions exactes sont précisées lors de la commande.',
      },
      {
        q: 'Peut-on retourner un e-liquide ouvert ?',
        a: 'Non, les e-liquides ouverts ne sont généralement pas repris pour des raisons d’hygiène et de sécurité.',
      },
    ],
    relatedProductIds: ['bvc-ce5-27', 'bvc-nautilus-28'],
  }),
  makePost({
    slug: 'reglementation-vape-france',
    title: 'Réglementation vape en France : vente aux majeurs et nicotine',
    description:
      'Repères responsables sur la réglementation vape en France : vente aux mineurs interdite, nicotine, publicité, conformité et information client.',
    date: '22 Juin 2026',
    isoDate: '2026-06-22T08:00:00+02:00',
    readTime: '6 min',
    category: 'Réglementation',
    image: '/products/Kit Armour G MTL - Vaporesso.jpg',
    summary:
      'La vape est un secteur réglementé : vente aux mineurs interdite, encadrement des produits nicotinés et communication responsable.',
    intro:
      'En France, les produits de vapotage sont encadrés. Un site e-commerce doit informer clairement sans banaliser l’usage.',
    sections: [
      {
        title: 'Vente interdite aux mineurs',
        text:
          'Les produits de vapotage ne doivent pas être vendus aux personnes mineures. Le site doit rappeler cette restriction et éviter tout ciblage jeunesse.',
      },
      {
        title: 'Nicotine et avertissements',
        text:
          'La nicotine crée une forte dépendance. Les produits concernés doivent être présentés avec prudence et sans promesse médicale.',
      },
      {
        title: 'Communication responsable',
        text:
          'Le contenu doit éviter de présenter la vape comme sans risque ou comme une solution médicale. Les conseils restent informatifs et orientés compatibilité produit.',
      },
    ],
    faq: [
      {
        q: 'Un site vape peut-il cibler les mineurs ?',
        a: 'Non. THEKLOPE réserve ses produits aux adultes et évite les codes ou messages destinés aux mineurs.',
      },
      {
        q: 'Peut-on promettre que la vape aide à arrêter de fumer ?',
        a: 'Non. Il ne faut pas faire de promesse médicale. En cas de démarche d’arrêt du tabac, il faut consulter un professionnel de santé.',
      },
    ],
    relatedProductIds: ['kit-armour-g-mtl-vaporesso-85', 'doric-astra-2500mah-voopoo-271'],
  }),
  makePost({
    slug: 'erreurs-frequentes-debutant-vape',
    title: 'Erreurs fréquentes quand on débute la vape',
    description:
      'Erreurs fréquentes à éviter : résistance non amorcée, mauvais PG/VG, puissance trop élevée, consommables incompatibles et stockage.',
    date: '21 Juin 2026',
    isoDate: '2026-06-21T08:00:00+02:00',
    readTime: '5 min',
    category: 'Guides responsables',
    image: '/products/DRAG S3.jpg',
    summary:
      'Les erreurs de départ viennent souvent d’un mauvais réglage ou d’une incompatibilité, pas forcément d’un produit défectueux.',
    intro:
      'Un achat plus sûr commence par quelques vérifications simples : compatibilité, puissance, résistance et e-liquide.',
    sections: [
      {
        title: 'Ne pas amorcer la résistance',
        text:
          'C’est l’erreur la plus fréquente. Une résistance neuve doit être imbibée et laissée au repos avant la première utilisation.',
      },
      {
        title: 'Choisir un liquide incompatible',
        text:
          'Un liquide trop épais ou trop fluide peut provoquer goût de brûlé ou fuites selon le matériel utilisé.',
      },
      {
        title: 'Monter trop haut en puissance',
        text:
          'La plage de puissance indiquée par le fabricant doit être respectée. Une puissance excessive use rapidement la résistance.',
      },
    ],
    faq: [
      {
        q: 'Quelle information vérifier avant d’acheter ?',
        a: 'La compatibilité des résistances, le ratio PG/VG, le taux de nicotine, la puissance recommandée et la disponibilité des consommables.',
      },
      {
        q: 'Que faire en cas de doute ?',
        a: 'Contactez le service client avec la référence de votre matériel pour vérifier la compatibilité avant commande.',
      },
    ],
    relatedProductIds: ['drag-s2-avec-pnp-x-voopoo-new-colors-280', 'pnp-x-015020304506ohm-voopoo-pack-de-5-302'],
  }),
  makePost({
    slug: 'compatibilite-resistances-cartouches',
    title: 'Compatibilité résistances et cartouches : vérifier avant achat',
    description:
      'Comment vérifier la compatibilité des résistances, cartouches et pods : marque, série, valeur ohm, puissance et références fabricant.',
    date: '20 Juin 2026',
    isoDate: '2026-06-20T08:00:00+02:00',
    readTime: '5 min',
    category: 'Entretien',
    image: '/products/Cartouches XROS Series 3ml (4pcs) - Vaporesso.webp',
    summary:
      'La compatibilité ne se devine pas à l’œil. Il faut comparer la marque, la série, la valeur en ohm et les indications fabricant.',
    intro:
      'Une cartouche ou une résistance incompatible peut fuir, ne pas se clipser ou ne pas fonctionner. La vérification avant achat est essentielle.',
    sections: [
      {
        title: 'Comparer la série exacte',
        text:
          'Deux références d’une même marque peuvent être incompatibles. La série inscrite sur la boîte ou la notice doit correspondre.',
      },
      {
        title: 'Regarder la valeur en ohm',
        text:
          'La valeur en ohm influence le tirage, la puissance et le e-liquide recommandé. Elle doit être cohérente avec votre usage et votre matériel.',
      },
      {
        title: 'Utiliser les fiches produits',
        text:
          'Les fiches THEKLOPE précisent les informations de compatibilité quand elles sont disponibles. En cas de doute, demandez conseil avant commande.',
      },
    ],
    faq: [
      {
        q: 'Une cartouche XROS va-t-elle sur tous les pods Vaporesso ?',
        a: 'Non. Il faut vérifier la compatibilité avec la série exacte du pod et la cartouche indiquée par le fabricant.',
      },
      {
        q: 'Peut-on utiliser n’importe quelle résistance dans un clearomiseur ?',
        a: 'Non. Les résistances doivent correspondre au modèle du clearomiseur ou du pod. Une référence proche peut rester incompatible.',
      },
    ],
    relatedProductIds: ['cartouches-xros-series-3ml-4pcs-vaporesso-50', 'gti-mesh-015020405-vaporesso-pack-de-5-300'],
  }),
]

export const getBlogPost = (slug) => BLOG_POSTS.find((p) => p.slug === slug)
