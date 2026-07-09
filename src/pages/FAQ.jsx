import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconChevronDown } from '../components/icons.jsx'

const SECTIONS = [
  {
    title: 'Livraison et retours',
    items: [
      {
        q: 'Quels sont les délais de livraison THEKLOPE ?',
        a: 'Les commandes sont préparées selon le stock disponible et les délais indiqués sur le site. La livraison dépend ensuite du transporteur et de l’adresse de destination en France.',
      },
      {
        q: 'La livraison est-elle offerte ?',
        a: 'La livraison standard peut être offerte à partir d’un montant indiqué sur le site. Les conditions exactes s’affichent dans le panier et au checkout.',
      },
      {
        q: 'Puis-je retourner un produit ?',
        a: 'Un produit non ouvert et dans son emballage d’origine peut être retourné selon les conditions indiquées. Les e-liquides ouverts, résistances utilisées et consommables ouverts ne sont généralement pas repris pour des raisons d’hygiène.',
      },
    ],
  },
  {
    title: 'Paiement sécurisé',
    items: [
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: 'Le paiement est traité par Mollie via un checkout sécurisé. Les moyens disponibles peuvent inclure carte bancaire et autres options activées dans le compte Mollie.',
      },
      {
        q: 'THEKLOPE stocke-t-il mes données bancaires ?',
        a: 'Non. THEKLOPE ne stocke pas les données de carte bancaire. La saisie et la validation du paiement se font dans l’environnement sécurisé Mollie.',
      },
      {
        q: 'Que se passe-t-il si le paiement échoue ?',
        a: 'Si le paiement n’est pas confirmé, la commande n’est pas finalisée comme payée. Vous pouvez réessayer ou contacter le service client avec les informations de commande.',
      },
    ],
  },
  {
    title: 'Achat responsable',
    items: [
      {
        q: 'Les produits THEKLOPE sont-ils vendus aux mineurs ?',
        a: 'Non. La vente de produits de vapotage est strictement réservée aux personnes majeures de 18 ans et plus.',
      },
      {
        q: 'La cigarette électronique est-elle sans risque ?',
        a: 'Non. La vape ne doit pas être présentée comme totalement sans risque. Les produits contenant de la nicotine créent une forte dépendance et sont déconseillés aux non-fumeurs.',
      },
      {
        q: 'THEKLOPE peut-il me conseiller pour arrêter de fumer ?',
        a: 'THEKLOPE donne des informations produit et compatibilité. Pour une démarche d’arrêt du tabac ou un doute médical, demandez conseil à un professionnel de santé.',
      },
    ],
  },
  {
    title: 'Choisir son matériel',
    items: [
      {
        q: 'Pod ou cigarette électronique classique : que choisir ?',
        a: 'Un pod rechargeable est compact et simple. Un kit classique offre souvent plus d’autonomie et de réglages. Le choix dépend du tirage, du e-liquide et des consommables compatibles.',
      },
      {
        q: 'Quel matériel choisir pour une première utilisation ?',
        a: 'Un matériel simple, avec peu de réglages et des consommables faciles à trouver, est généralement plus accessible. Vérifiez toujours la compatibilité avec le e-liquide choisi.',
      },
      {
        q: 'Comment savoir si une cartouche ou une résistance est compatible ?',
        a: 'Comparez la marque, la série, la valeur en ohm et les recommandations du fabricant. En cas de doute, contactez THEKLOPE avant commande.',
      },
    ],
  },
  {
    title: 'E-liquides et nicotine',
    items: [
      {
        q: 'Comment choisir son taux de nicotine ?',
        a: 'Le taux dépend du matériel, du ressenti recherché et de l’usage. Les produits nicotinés sont réservés aux adultes et créent une dépendance. En cas de doute, demandez un avis professionnel.',
      },
      {
        q: 'Que signifie le ratio PG/VG ?',
        a: 'Le PG favorise la fluidité, les saveurs et la sensation en gorge. La VG produit une vapeur plus dense. Le ratio doit être compatible avec la résistance utilisée.',
      },
      {
        q: 'Un e-liquide sans nicotine est-il réservé aux adultes ?',
        a: 'Oui. Même sans nicotine, un e-liquide reste un produit de vapotage et doit être utilisé uniquement par des adultes.',
      },
    ],
  },
  {
    title: 'Résistances et entretien',
    items: [
      {
        q: 'Quand changer une résistance ?',
        a: 'Changez la résistance en cas de goût de brûlé, baisse de vapeur, fuite persistante ou saveur altérée. La durée de vie dépend du liquide, de la puissance et de l’usage.',
      },
      {
        q: 'Comment amorcer une résistance neuve ?',
        a: 'Imbibez le coton visible avec quelques gouttes de e-liquide, remplissez le réservoir, attendez plusieurs minutes puis commencez à puissance modérée.',
      },
      {
        q: 'Pourquoi ma cigarette électronique fuit-elle ?',
        a: 'Les fuites peuvent venir d’une résistance usée, d’un joint déplacé, d’un mauvais remplissage, d’un e-liquide trop fluide ou d’une incompatibilité matérielle.',
      },
    ],
  },
  {
    title: 'Puffs et alternatives',
    items: [
      {
        q: 'THEKLOPE vend-il des puffs jetables ?',
        a: 'La disponibilité dépend de la réglementation applicable. THEKLOPE privilégie les alternatives rechargeables et conformes pour adultes.',
      },
      {
        q: 'Quelle alternative choisir à la place d’une puff jetable ?',
        a: 'Un pod rechargeable compact avec cartouches ou résistances compatibles est souvent l’alternative la plus proche en simplicité, tout en étant réutilisable.',
      },
      {
        q: 'Une alternative rechargeable contient-elle forcément de la nicotine ?',
        a: 'Non. Le taux dépend du e-liquide utilisé. Les produits nicotinés restent réservés aux adultes et créent une dépendance.',
      },
    ],
  },
  {
    title: 'Confiance et avis',
    items: [
      {
        q: 'Les avis affichés par THEKLOPE sont-ils réels ?',
        a: 'THEKLOPE met en avant des avis boutique réels lorsqu’ils sont disponibles, notamment des avis Google, sans inventer d’avis produit.',
      },
      {
        q: 'Comment contacter le service client ?',
        a: 'Vous pouvez contacter THEKLOPE via la page Contact, par e-mail ou avec les informations disponibles dans le footer du site.',
      },
      {
        q: 'THEKLOPE est-il une boutique vape en France ?',
        a: 'Oui. THEKLOPE cible le marché français avec une boutique en ligne et une présence associée à Marseille.',
      },
    ],
  },
]

export default function FAQ() {
  const faqSchema = useMemo(() => {
    const questions = SECTIONS.flatMap((s) => s.items).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions,
    }
  }, [])

  return (
    <div className="container-page py-8">
      <Seo
        title="FAQ vape, livraison, nicotine et conformité | THEKLOPE"
        description="Questions fréquentes THEKLOPE : livraison, retours, paiement Mollie, produits vape réservés aux adultes, nicotine, résistances, e-liquides et alternatives aux puffs."
        schema={faqSchema}
      />
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Foire aux questions THEKLOPE</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Réponses pratiques sur la boutique, les produits de vapotage, les commandes et les précautions à connaître.
      </p>

      <div className="mt-8 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 font-display text-xl font-semibold text-neon">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Accordion key={item.q} {...item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 card flex flex-col items-center gap-3 p-8 text-center">
        <h2 className="font-display text-lg font-bold text-white">Besoin d’une vérification avant commande ?</h2>
        <p className="text-sm text-muted">Notre équipe peut vous aider à contrôler une compatibilité produit.</p>
        <Link to="/contact" className="btn-primary mt-2">Contacter le support</Link>
      </div>
    </div>
  )
}

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-white">{q}</span>
        <IconChevronDown
          width={18}
          height={18}
          className={`shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>}
    </div>
  )
}
