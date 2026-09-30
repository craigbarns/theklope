import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../context/StoreContext.jsx'
import {
  COIL_FAMILIES,
  compatibilityPath,
  familyFaq,
  findCoilFamily,
  productsForFamily,
} from '../data/coilCompatibility.js'
import NotFound from './NotFound.jsx'

const BASE = 'https://www.theklope.com'
const HUB_TITLE = 'Quelle résistance pour ma cigarette électronique ?'

// Pages « quelle résistance / cartouche pour mon appareil ? » : ce que les
// vapoteurs cherchent au moment de racheter. Données vérifiées dans
// src/data/coilCompatibility.js.
export default function CompatibilityPage() {
  const { slug } = useParams()
  return slug ? <FamilyPage slug={slug} /> : <HubPage />
}

function HubPage() {
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${BASE}/compatibilite`, url: `${BASE}/compatibilite`, name: HUB_TITLE },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Compatibilité résistances', item: `${BASE}/compatibilite` },
        ],
      },
    ],
  }), [])

  return (
    <div className="container-page py-8">
      <Seo
        title="Quelle résistance pour ma cigarette électronique ? Compatibilités"
        description="Trouvez la résistance ou la cartouche compatible avec votre appareil : XROS, iTank, Drag S2, Drag X2, Drag 3, Doric 20, Zeus, Digi Max, Zenith, Nautilus."
        canonical={`${BASE}/compatibilite`}
        schema={schema}
      />
      <Breadcrumbs items={[{ label: 'Compatibilité résistances' }]} />
      <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">{HUB_TITLE}</h1>
      <p className="mt-3 max-w-3xl text-muted">
        Choisissez votre appareil : chaque page indique la résistance ou la cartouche qui lui correspond,
        vérifiée auprès du fabricant, et celles disponibles chez THEKLOPE.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COIL_FAMILIES.map((family) => (
          <li key={family.slug}>
            <Link to={compatibilityPath(family)} className="card-interactive block h-full p-5">
              <p className="text-xs uppercase tracking-wider text-faint">{family.brand}</p>
              <p className="mt-1 font-display text-lg font-semibold text-white">{family.devices.slice(0, 3).join(', ')}{family.devices.length > 3 ? '…' : ''}</p>
              <p className="mt-1 text-sm text-neon">→ {family.family}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Votre appareil n’est pas dans la liste ? Apportez-le au 188 rue de Rome à Marseille ou{' '}
        <Link to="/contact" className="text-neon hover:underline">écrivez-nous</Link> : nous vérifions la compatibilité.
      </p>
    </div>
  )
}

function FamilyPage({ slug }) {
  const { products } = useStore()
  const family = findCoilFamily(slug)
  const items = useMemo(() => (family ? productsForFamily(family, products) : []), [family, products])
  const faq = family ? familyFaq(family) : []
  const path = family ? compatibilityPath(family) : ''

  const schema = useMemo(() => (family ? {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${BASE}${path}`, url: `${BASE}${path}`, name: family.h1, description: family.answer },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Compatibilité résistances', item: `${BASE}/compatibilite` },
          { '@type': 'ListItem', position: 3, name: family.h1, item: `${BASE}${path}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
      },
    ],
  } : null), [family, faq, path])

  if (!family) return <NotFound />

  return (
    <div className="container-page py-8">
      <Seo title={family.seoTitle} description={`${family.answer} Disponibles chez THEKLOPE, retrait 1 h à Marseille.`} canonical={`${BASE}${path}`} schema={schema} />
      <Breadcrumbs items={[{ label: 'Compatibilité résistances', to: '/compatibilite' }, { label: family.family }]} />

      <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">{family.h1}</h1>
      <p className="mt-3 max-w-3xl text-lg text-ash">{family.answer}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-white">Appareils compatibles</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {family.devices.map((device) => (
              <li key={device} className="rounded-full border border-neon/25 bg-neon/5 px-3 py-1.5 text-sm text-white">{device}</li>
            ))}
          </ul>
          {family.caveats.map((caveat) => (
            <p key={caveat} className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{caveat}</p>
          ))}
          <p className="mt-4 text-sm text-muted">{family.usage}</p>
          <p className="mt-4 text-xs text-faint">
            Compatibilité vérifiée auprès de :{' '}
            <a href={family.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-neon">{family.source.label}</a>
          </p>
        </section>
        <aside className="card p-5 text-sm">
          <p className="font-semibold text-white">Un doute sur votre modèle ?</p>
          <p className="mt-2 text-muted">Apportez votre appareil au 188 rue de Rome (Marseille 6e) : nous vérifions sur place. Retrait gratuit en 1 h.</p>
          <Link to="/compatibilite" className="mt-3 inline-block text-neon hover:underline">Autres appareils →</Link>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-white">
          {items.length ? `Les ${family.family} disponibles` : `${family.family.charAt(0).toUpperCase()}${family.family.slice(1)} chez THEKLOPE`}
        </h2>
        {items.length ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <p className="mt-3 text-muted">
            Pas de référence en ligne pour le moment.{' '}
            <Link to="/contact" className="text-neon hover:underline">Contactez-nous</Link> : nous vérifions le stock en boutique.
          </p>
        )}
        <Link to={`/categorie/${family.categorySlug}`} className="btn-ghost mt-6">Voir toutes les résistances et cartouches</Link>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-white">Questions fréquentes</h2>
        {faq.map((item) => (
          <div key={item.q} className="mt-4">
            <h3 className="font-semibold text-white">{item.q}</h3>
            <p className="mt-1 text-sm text-muted">{item.a}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
