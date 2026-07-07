import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconChevronDown } from '../components/icons.jsx'

const SECTIONS = [
  {
    title: 'Livraison',
    items: [
      { q: 'Quels sont les délais de livraison ?', a: 'Les commandes sont expédiées sous 24 à 48h. La réception intervient généralement sous 2 à 4 jours ouvrés en France métropolitaine.' },
      { q: 'La livraison est-elle offerte ?', a: 'Oui, la livraison standard est offerte dès 49€ d\'achat. En dessous, elle est facturée à partir de 2,90€ selon le mode choisi.' },
      { q: 'Livrez-vous à l\'étranger ?', a: 'Nous livrons actuellement en France métropolitaine. Contactez-nous pour toute demande de livraison hors métropole.' },
    ],
  },
  {
    title: 'Retours',
    items: [
      { q: 'Puis-je retourner un produit ?', a: 'Vous disposez de 14 jours pour retourner un produit non ouvert et dans son emballage d\'origine. Pour des raisons d\'hygiène, les e-liquides ouverts et les résistances utilisées ne sont pas repris.' },
      { q: 'Comment effectuer un retour ?', a: 'Contactez notre service client à contact@theklope.com avec votre numéro de commande. Nous vous communiquons la procédure et l\'adresse de retour.' },
    ],
  },
  {
    title: 'Paiement',
    items: [
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Carte bancaire (Visa, Mastercard) via un paiement chiffré et sécurisé. D\'autres moyens peuvent être ajoutés lors de la connexion à un prestataire de paiement.' },
      { q: 'Mes données bancaires sont-elles protégées ?', a: 'Oui. Les transactions sont chiffrées et nous ne stockons jamais vos données de carte. Le paiement est traité par un prestataire certifié.' },
    ],
  },
  {
    title: 'Choisir sa cigarette électronique',
    items: [
      { q: 'Pod ou kit : que choisir ?', a: 'Le pod est idéal pour débuter : compact, simple, tirage serré proche de la cigarette. Le kit offre plus de réglages et de puissance pour personnaliser sa vape.' },
      { q: 'Quel produit pour arrêter de fumer ?', a: 'Un pod ou un pack débutant avec un e-liquide en tirage serré est souvent recommandé. Le taux de nicotine se choisit selon votre consommation actuelle.' },
    ],
  },
  {
    title: 'Choisir son e-liquide',
    items: [
      { q: 'Comment choisir une saveur ?', a: 'Les saveurs mentholées et tabac sont conseillées pour la transition depuis la cigarette ; les saveurs fruitées et gourmandes pour varier les plaisirs. Commencez par 2-3 saveurs pour trouver vos préférées.' },
      { q: 'Qu\'est-ce que le ratio PG/VG ?', a: 'Le PG porte les saveurs et le hit, la VG produit la vapeur. Un ratio 50/50 convient à la plupart des pods et petits kits.' },
    ],
  },
  {
    title: 'Taux de nicotine',
    items: [
      { q: 'Quel taux de nicotine choisir ?', a: 'Repère indicatif : gros fumeur (>20 cig/jour) → 16-20 mg ; fumeur moyen → 10-12 mg ; petit fumeur → 3-6 mg. L\'objectif est de réduire progressivement.' },
      { q: 'Sels de nicotine ou nicotine classique ?', a: 'Les sels de nicotine procurent un hit plus doux à taux élevé, adaptés aux pods. La nicotine classique convient à des taux plus faibles.' },
    ],
  },
  {
    title: 'Garantie',
    items: [
      { q: 'Le matériel est-il garanti ?', a: 'Le matériel électronique bénéficie d\'une garantie contre les défauts de fabrication. Les consommables (résistances, e-liquides) n\'entrent pas dans la garantie.' },
      { q: 'Que faire en cas de produit défectueux ?', a: 'Contactez notre service client avec votre numéro de commande et une description du problème. Nous trouverons une solution rapidement.' },
    ],
  },
]

export default function FAQ() {
  const faqSchema = useMemo(() => {
    const questions = SECTIONS.flatMap(s => s.items).map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    }
  }, [])

  return (
    <div className="container-page py-8">
      <Seo
        title="FAQ"
        description="Questions fréquentes THEKLOPE : livraison, retours, paiement, choix de la cigarette électronique et du e-liquide, taux de nicotine, garantie."
        schema={faqSchema}
      />
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Foire aux questions</h1>
      <p className="mt-2 max-w-xl text-muted">Tout ce qu'il faut savoir avant et après votre commande.</p>

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
        <h3 className="font-display text-lg font-bold text-white">Vous n'avez pas trouvé votre réponse ?</h3>
        <p className="text-sm text-muted">Notre équipe est là pour vous aider.</p>
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
