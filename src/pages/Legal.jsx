import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import NotFound from './NotFound.jsx'

const PAGES = {
  'mentions-legales': {
    title: 'Mentions légales',
    intro: "Informations légales relatives à l'éditeur et à l'hébergement du site THEKLOPE.",
    blocks: [
      ['Éditeur du site', "Le site THEKLOPE est édité par SEVEN SEVENTY, SASU (société par actions simplifiée unipersonnelle) au capital de 770 €. Siège social : 44 rue des Forges, 13010 Marseille. Boutique : 188 rue de Rome, 13006 Marseille — 04 91 55 55 55. RCS Marseille 815 155 973 — SIRET 815 155 973 00044. N° TVA intracommunautaire : FR58 815 155 973. Code APE : 46.90Z. Directeur de la publication : Ralph Ohayon. Contact : contact@theklope.com."],
      ['Hébergement', "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com."],
      ['Propriété intellectuelle', "L'ensemble des contenus du site (textes, visuels, logos, charte graphique) est la propriété de THEKLOPE ou de ses partenaires et est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite."],
      ['Vente réglementée', "La vente de produits de vapotage est strictement réservée aux personnes majeures (+18 ans). Les produits contenant de la nicotine créent une forte dépendance et sont déconseillés aux non-fumeurs."],
      ['Contact', "Pour toute question : contact@theklope.com."],
    ],
  },
  // CGV réécrites le 24/10/2026 : identification du vendeur, frais et délais
  // de chaque mode de livraison, rétractation (exceptions de l'article
  // L. 221-28 pour les produits descellés), encadré légal obligatoire de la
  // garantie de conformité (annexe à l'article D. 211-2, texte officiel) et
  // médiation. Le nom du médiateur reste à compléter dès qu'il est désigné.
  cgv: {
    title: 'Conditions générales de vente',
    intro: "Conditions générales applicables aux ventes conclues sur theklope.com. Version du 24 octobre 2026.",
    blocks: [
      ['Article 1 — Vendeur', "Les produits sont vendus par SEVEN SEVENTY, SASU au capital de 770 €, siège social 44 rue des Forges, 13010 Marseille, RCS Marseille 815 155 973, SIRET 815 155 973 00044, TVA intracommunautaire FR58 815 155 973, exploitant l'enseigne THEKLOPE. Boutique : 188 rue de Rome, 13006 Marseille, ouverte du lundi au vendredi de 9 h à 19 h. Téléphone : 04 91 55 55 55. E-mail : contact@theklope.com."],
      ['Article 2 — Champ d’application', "Les présentes conditions s’appliquent à toute commande passée sur theklope.com par un consommateur. Elles sont acceptées par le client lors de la validation de sa commande. Les conditions applicables sont celles en vigueur à la date de la commande."],
      ['Article 3 — Vente réservée aux majeurs', "La vente de produits du vapotage est interdite aux mineurs. En commandant, le client déclare avoir au moins 18 ans. THEKLOPE peut demander une preuve de majorité, notamment lors d’un retrait en boutique ou d’une livraison par coursier, et annuler une commande en cas de doute. Les produits contenant de la nicotine créent une forte dépendance et leur utilisation est déconseillée aux non-fumeurs."],
      ['Article 4 — Produits', "Les caractéristiques essentielles des produits (contenance, ratio PG/VG, taux de nicotine, compatibilité) sont indiquées sur chaque fiche. Les photographies sont illustratives. Les produits sont proposés dans la limite des stocks disponibles ; en cas d’indisponibilité après la commande, le client en est informé et remboursé sans délai des sommes versées pour le produit concerné."],
      ['Article 5 — Prix', "Les prix sont indiqués en euros toutes taxes comprises, hors frais de livraison. Le prix applicable est celui affiché au moment de la validation de la commande. Les frais de livraison sont indiqués avant le paiement (article 7)."],
      ['Article 6 — Commande et paiement', "Le client sélectionne ses produits, choisit un mode de livraison ou le retrait en boutique, puis valide sa commande avec obligation de paiement. Le paiement est réalisé par carte bancaire ou Apple Pay via la plateforme sécurisée Mollie ; THEKLOPE n’a jamais accès aux données bancaires. La commande est confirmée par e-mail après validation du paiement. THEKLOPE peut refuser une commande en cas de litige antérieur, de suspicion de fraude ou de doute sur la majorité du client."],
      ['Article 7 — Livraison et retrait', "Livraison en France métropolitaine. Commandes passées avant 14 h un jour ouvré : expédiées le jour même.\nMondial Relay (Point Relais) : 3,90 €, livraison en 3 à 5 jours ouvrés.\nLa Poste Colissimo à domicile, remis contre signature : 7,50 €, livraison en 2 à 4 jours ouvrés.\nCoursier dans les 16 arrondissements de Marseille : 7,50 €, livraison le jour même pour une commande passée avant 14 h un jour ouvré.\nCes trois modes sont offerts dès 29 € d’achat.\nRetrait en boutique, 188 rue de Rome, 13006 Marseille : gratuit ; une commande passée avant 14 h un jour ouvré est prête le jour même, et un e-mail prévient le client quand elle peut être retirée.\nLe transfert des risques intervient à la remise du produit au client ou à la personne qu’il a désignée. À défaut de livraison dans le délai indiqué, le client peut, après mise en demeure restée sans effet, résoudre la vente dans les conditions des articles L. 216-6 et suivants du code de la consommation."],
      ['Article 8 — Droit de rétractation', "Le client dispose d’un délai de 14 jours à compter de la réception du produit pour se rétracter, sans avoir à motiver sa décision. Il notifie sa décision par e-mail à contact@theklope.com, par toute déclaration dénuée d’ambiguïté ou au moyen du formulaire ci-dessous, puis renvoie le produit dans les 14 jours suivant cette notification. Les frais de retour sont à la charge du client. THEKLOPE rembourse la totalité des sommes versées, frais de livraison initiaux inclus (dans la limite du mode de livraison standard le moins cher), dans les 14 jours suivant la notification, par le moyen de paiement utilisé ; ce remboursement peut être différé jusqu’à la réception du produit.\nConformément à l’article L. 221-28 du code de la consommation, le droit de rétractation ne s’applique pas aux biens descellés par le client après la livraison et qui ne peuvent être renvoyés pour des raisons d’hygiène ou de protection de la santé : e-liquides, arômes et boosters dont l’opercule ou le bouchon de sécurité a été ouvert, résistances, cartouches et pods sortis de leur emballage scellé."],
      ['Formulaire de rétractation', "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)\nÀ l'attention de SEVEN SEVENTY (THEKLOPE), 188 rue de Rome, 13006 Marseille — contact@theklope.com :\nJe/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*) ci-dessous :\nCommandé le (*) / reçu le (*) :\nNom du (des) consommateur(s) :\nAdresse du (des) consommateur(s) :\nSignature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :\nDate :\n(*) Rayez la mention inutile."],
      ['Article 9 — Garanties légales', "THEKLOPE est tenu des défauts de conformité et des vices cachés dans les conditions ci-dessous. Pour une demande, le client contacte contact@theklope.com ou la boutique avec son numéro de commande et une description du défaut ; le produit peut être déposé en boutique ou renvoyé selon les instructions communiquées. Les résistances, cartouches et accus sont des consommables : leur usure normale ne constitue pas un défaut de conformité."],
      ['Garantie légale de conformité et garantie des vices cachés', "Le consommateur dispose d'un délai de deux ans à compter de la délivrance du bien pour obtenir la mise en œuvre de la garantie légale de conformité en cas d'apparition d'un défaut de conformité. Durant ce délai, le consommateur n'est tenu d'établir que l'existence du défaut de conformité et non la date d'apparition de celui-ci.\nLorsque le contrat de vente du bien prévoit la fourniture d'un contenu numérique ou d'un service numérique de manière continue pendant une durée supérieure à deux ans, la garantie légale est applicable à ce contenu numérique ou ce service numérique tout au long de la période de fourniture prévue. Durant ce délai, le consommateur n'est tenu d'établir que l'existence du défaut de conformité affectant le contenu numérique ou le service numérique et non la date d'apparition de celui-ci.\nLa garantie légale de conformité emporte obligation pour le professionnel, le cas échéant, de fournir toutes les mises à jour nécessaires au maintien de la conformité du bien.\nLa garantie légale de conformité donne au consommateur droit à la réparation ou au remplacement du bien dans un délai de trente jours suivant sa demande, sans frais et sans inconvénient majeur pour lui.\nSi le bien est réparé dans le cadre de la garantie légale de conformité, le consommateur bénéficie d'une extension de six mois de la garantie initiale.\nSi le consommateur demande la réparation du bien, mais que le vendeur impose le remplacement, la garantie légale de conformité est renouvelée pour une période de deux ans à compter de la date de remplacement du bien.\nLe consommateur peut obtenir une réduction du prix d'achat en conservant le bien ou mettre fin au contrat en se faisant rembourser intégralement contre restitution du bien, si :\n1° Le professionnel refuse de réparer ou de remplacer le bien ;\n2° La réparation ou le remplacement du bien intervient après un délai de trente jours ;\n3° La réparation ou le remplacement du bien occasionne un inconvénient majeur pour le consommateur, notamment lorsque le consommateur supporte définitivement les frais de reprise ou d'enlèvement du bien non conforme, ou s'il supporte les frais d'installation du bien réparé ou de remplacement ;\n4° La non-conformité du bien persiste en dépit de la tentative de mise en conformité du vendeur restée infructueuse.\nLe consommateur a également droit à une réduction du prix du bien ou à la résolution du contrat lorsque le défaut de conformité est si grave qu'il justifie que la réduction du prix ou la résolution du contrat soit immédiate. Le consommateur n'est alors pas tenu de demander la réparation ou le remplacement du bien au préalable.\nLe consommateur n'a pas droit à la résolution de la vente si le défaut de conformité est mineur.\nToute période d'immobilisation du bien en vue de sa réparation ou de son remplacement suspend la garantie qui restait à courir jusqu'à la délivrance du bien remis en état.\nLes droits mentionnés ci-dessus résultent de l'application des articles L. 217-1 à L. 217-32 du code de la consommation.\nLe vendeur qui fait obstacle de mauvaise foi à la mise en œuvre de la garantie légale de conformité encourt une amende civile d'un montant maximal de 300 000 euros, qui peut être porté jusqu'à 10 % du chiffre d'affaires moyen annuel (article L. 241-5 du code de la consommation).\nLe consommateur bénéficie également de la garantie légale des vices cachés en application des articles 1641 à 1649 du code civil, pendant une durée de deux ans à compter de la découverte du défaut. Cette garantie donne droit à une réduction de prix si le bien est conservé ou à un remboursement intégral contre restitution du bien.", { boxed: true }],
      ['Article 10 — Service client et réclamations', "Pour toute question ou réclamation : contact@theklope.com, 04 91 55 55 55 (du lundi au vendredi, 9 h – 19 h), ou à la boutique du 188 rue de Rome, 13006 Marseille."],
      ['Article 11 — Médiation de la consommation', "Conformément aux articles L. 611-1 et suivants du code de la consommation, après une réclamation écrite adressée au service client restée sans solution, le client peut recourir gratuitement à un médiateur de la consommation en vue d’une résolution amiable du litige. Les coordonnées du médiateur compétent lui sont communiquées par le service client sur simple demande."],
      ['Article 12 — Données personnelles', "Les données collectées sont nécessaires au traitement de la commande. Leur utilisation et les droits du client sont décrits dans la politique de confidentialité."],
      ['Article 13 — Droit applicable', "Les présentes conditions sont soumises au droit français. En cas de litige, le client peut saisir, à son choix, la juridiction du lieu où il demeurait au moment de la conclusion du contrat ou de la survenance du fait dommageable, ou toute autre juridiction compétente."],
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    intro: "THEKLOPE s'engage à protéger vos données personnelles conformément au RGPD.",
    blocks: [
      ['Données collectées', "Nous collectons les données nécessaires au traitement de vos commandes : identité, coordonnées, adresse de livraison et historique d'achat."],
      ['Finalités', "Vos données sont utilisées pour traiter les commandes, assurer le service client, et — avec votre accord — vous envoyer des offres et nouveautés."],
      ['Base légale', "Le traitement repose sur l'exécution du contrat de vente, votre consentement (newsletter) et nos intérêts légitimes."],
      ['Conservation', "Les données sont conservées le temps nécessaire aux finalités précitées et aux obligations légales."],
      ['Vos droits', "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour les exercer : contact@theklope.com."],
      ['Cookies', "Le site utilise des cookies pour son fonctionnement, la mesure d'audience et la personnalisation. Vous pouvez gérer votre consentement via le bandeau cookies."],
    ],
  },
  retour: {
    title: 'Politique de retour',
    intro: "Modalités de retour et de remboursement des produits THEKLOPE.",
    blocks: [
      ['Délai de rétractation', "Vous disposez de 14 jours à compter de la réception pour nous informer de votre rétractation, puis de 14 jours pour renvoyer le produit, non ouvert et dans son emballage d'origine (article 8 des CGV)."],
      ['Produits exclus', "Pour des raisons d'hygiène et de sécurité, les e-liquides ouverts et les résistances utilisées ne peuvent faire l'objet d'un retour."],
      ['Procédure', "Contactez notre service client à contact@theklope.com en indiquant votre numéro de commande. Nous vous communiquons la marche à suivre et l'adresse de retour."],
      ['Remboursement', "Le remboursement intervient sous 14 jours après réception et vérification du produit retourné, par le même moyen de paiement que la commande."],
      ['Frais de retour', "Sauf produit défectueux ou erreur de notre part, les frais de retour restent à la charge du client."],
    ],
  },
}

export default function Legal() {
  const { slug } = useParams()
  const page = PAGES[slug]
  if (!page) return <NotFound />

  return (
    <div className="container-page py-8">
      <Seo title={page.title} description={page.intro} />
      <Breadcrumbs items={[{ label: page.title }]} />

      <div className="mt-6 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-white">{page.title}</h1>
        <p className="mt-3 text-muted">{page.intro}</p>

        <div className="mt-8 space-y-7">
          {page.blocks.map(([heading, text, options = {}]) => (
            <section
              key={heading}
              className={options.boxed ? 'rounded-2xl border border-white/15 bg-white/[0.03] p-5' : undefined}
            >
              <h2 className="font-display text-lg font-semibold text-white">{heading}</h2>
              {String(text).split('\n').map((paragraph) => (
                <p key={paragraph} className="mt-2 leading-relaxed text-muted">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-muted">
          <strong className="text-ash/80">Avertissement —</strong> La vente de produits de vapotage est
          interdite aux mineurs. Les produits contenant de la nicotine créent une forte dépendance. Leur
          utilisation est déconseillée aux non-fumeurs.
        </div>

        <p className="mt-8 text-xs text-faint">
          Une question sur ces conditions ?{' '}
          <Link to="/contact" className="text-neon hover:underline">Nous contacter</Link>
        </p>
      </div>
    </div>
  )
}
