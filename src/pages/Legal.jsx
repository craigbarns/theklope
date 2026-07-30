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
  cgv: {
    title: 'Conditions générales de vente',
    intro: "Les présentes CGV régissent les ventes réalisées sur le site THEKLOPE.",
    blocks: [
      ['Article 1 — Objet', "Les présentes conditions régissent les ventes de produits de vape proposés par THEKLOPE à ses clients. Toute commande implique l'acceptation sans réserve des présentes CGV."],
      ['Article 2 — Produits', "Les produits proposés sont décrits avec la plus grande exactitude. Les photographies sont non contractuelles. La vente est réservée aux personnes majeures."],
      ['Article 3 — Prix', "Les prix sont indiqués en euros toutes taxes comprises (TTC), hors frais de livraison. THEKLOPE se réserve le droit de modifier ses prix à tout moment, le tarif applicable étant celui en vigueur au moment de la commande."],
      ['Article 4 — Commande', "Le client valide sa commande après vérification du panier. Un e-mail de confirmation récapitule la commande."],
      ['Article 5 — Paiement', "Le paiement s'effectue via Mollie, prestataire de paiement sécurisé. La commande est traitée après confirmation effective du paiement par le prestataire."],
      ['Article 6 — Livraison', "Les produits sont livrés à l'adresse indiquée par le client, dans les délais annoncés. THEKLOPE ne saurait être tenue responsable des retards imputables au transporteur."],
      ['Article 7 — Droit de rétractation', "Conformément à la loi, le client dispose de 14 jours pour se rétracter. Pour des raisons d'hygiène et de sécurité, les e-liquides ouverts et résistances utilisées ne peuvent être repris."],
      ['Article 8 — Service client', "Pour toute réclamation : contact@theklope.com."],
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
      ['Délai de rétractation', "Vous disposez de 14 jours à compter de la réception pour retourner un produit non ouvert et dans son emballage d'origine."],
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
          {page.blocks.map(([heading, text]) => (
            <section key={heading}>
              <h2 className="font-display text-lg font-semibold text-white">{heading}</h2>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
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
