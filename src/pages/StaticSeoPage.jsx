import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { STATIC_SEO_PAGES } from '../data/staticSeoPages.js'
import NotFound from './NotFound.jsx'

export default function StaticSeoPage() {
  const location = useLocation()
  const slug = location.pathname.replace(/^\/+|\/+$/g, '')
  const page = STATIC_SEO_PAGES[slug]

  const schema = useMemo(() => {
    if (!page) return null
    const url = `https://www.theklope.com/${slug}`
    const graph = [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: page.h1,
        description: page.metaDescription,
        isPartOf: { '@id': 'https://www.theklope.com/#website' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.theklope.com/' },
          { '@type': 'ListItem', position: 2, name: page.h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ]

    if (page.localBusiness) {
      graph.push({
        '@type': 'LocalBusiness',
        '@id': 'https://www.theklope.com/#store',
        name: 'THEKLOPE',
        url: 'https://www.theklope.com',
        image: 'https://www.theklope.com/og-image.jpg',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '188 rue de Rome',
          addressLocality: 'Marseille',
          postalCode: '13006',
          addressCountry: 'FR',
        },
        priceRange: '$$',
      })
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
  }, [page, slug])

  if (!page) return <NotFound />

  return (
    <div className="container-page py-8">
      <Seo
        title={page.title}
        description={page.metaDescription}
        canonical={`https://www.theklope.com/${slug}`}
        schema={schema}
      />
      <Breadcrumbs items={[{ label: page.h1 }]} />

      <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-carbon to-anthracite p-8 sm:p-10">
        <p className="eyebrow mb-2">{page.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{page.h1}</h1>
        <p className="mt-3 max-w-3xl text-muted">{page.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {page.links.map((link) => (
            <Link key={link.to} to={link.to} className="btn-ghost px-4 py-2.5 text-xs">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-14">
        <p className="eyebrow mb-2">FAQ</p>
        <h2 className="font-display text-2xl font-bold text-white">Questions fréquentes</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {page.faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
