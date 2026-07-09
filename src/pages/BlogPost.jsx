import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlogPost } from '../data/blog.js'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

export default function BlogPost() {
  const { slug } = useParams()
  const { products, addToCart } = useStore()
  const [readingProgress, setReadingProgress] = useState(0)

  const post = useMemo(() => getBlogPost(slug), [slug])

  // Gérer la barre de progression de lecture
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100
        setReadingProgress(progress)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filtrer les produits associés
  const relatedProducts = useMemo(() => {
    if (!post || !post.relatedProductIds) return []
    return post.relatedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
  }, [post, products])

  // Schéma structuré BlogPosting (GEO)
  const schema = useMemo(() => {
    if (!post) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://theklope.com/guides/${post.slug}`,
      },
      headline: post.title,
      description: post.description,
      image: `https://theklope.com${post.image}`,
      datePublished: post.isoDate,
      dateModified: post.isoDate,
      author: {
        '@type': 'Organization',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'THEKLOPE',
        logo: {
          '@type': 'ImageObject',
          url: 'https://theklope.com/logo.png',
        },
      },
    }
  }, [post])

  if (!post) {
    return (
      <div className="container-page py-16 text-center">
        <Seo title="Article non trouvé" />
        <h1 className="text-xl font-bold text-white">Article introuvable</h1>
        <p className="mt-2 text-muted">Ce guide de vape n'existe pas ou a été déplacé.</p>
        <Link to="/guides" className="btn-primary mt-6">
          Retour aux guides
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Barre de progression de lecture */}
      <div className="fixed left-0 right-0 top-16 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-neon transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container-page py-8">
        <Seo
          title={post.title}
          description={post.description}
          canonical={`https://theklope.com/guides/${post.slug}`}
          schema={schema}
        />
        <Breadcrumbs items={[{ label: 'Guides', to: '/guides' }, { label: post.title }]} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Article principal */}
          <article className="card p-6 md:p-10">
            {/* Header de l'article */}
            <header className="border-b border-white/8 pb-6 mb-6">
              <span className="eyebrow">{post.category}</span>
              <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl mt-2 leading-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span>Par <strong>{post.author}</strong></span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span>Publié le {post.date}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span>Temps de lecture : {post.readTime}</span>
              </div>
            </header>

            {/* Corps du post avec style de balises configuré */}
            <div
              className="text-sm leading-relaxed text-ash/90 space-y-4
                [&>h2]:font-display [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-8 [&>h2]:mb-3
                [&>h3]:font-display [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-6 [&>h3]:mb-2
                [&>p]:text-muted [&>p]:leading-relaxed [&>p]:mb-4
                [&>blockquote]:border-l-4 [&>blockquote]:border-neon [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-white
                [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:mb-4 [&>ul]:text-muted
                [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:mb-4 [&>ol]:text-muted
                [&>strong]:text-white [&>strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Sidebar : Produits associés */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {relatedProducts.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-sm font-bold text-white border-b border-white/8 pb-3 mb-4">
                  Matériel & Liquides associés
                </h3>
                <div className="space-y-4">
                  {relatedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-noir/40 p-3 hover:border-neon/30 transition group"
                    >
                      <img
                        src={p.image}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover bg-carbon p-1 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/produit/${p.id}`}
                          className="block truncate text-xs font-bold text-white hover:text-neon"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[10px] text-faint truncate mt-0.5">
                          {p.brand} · {p.type}
                        </p>
                        <p className="text-xs font-semibold text-neon mt-1">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(p.id, 1)}
                        className="rounded-full bg-neon/10 border border-neon/30 p-2 text-neon hover:bg-neon hover:text-noir transition shrink-0"
                        title="Ajouter au panier"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter ou Box CTA */}
            <div className="card p-5 border-white/8 bg-white/[0.01] text-center">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Besoin de vérifier une compatibilité ?
              </h4>
              <p className="text-[11px] text-muted mb-4 leading-relaxed">
                Notre équipe peut vous aider à vérifier matériel, résistance, cartouche et e-liquide avant commande.
              </p>
              <Link
                to="/contact"
                className="btn-primary py-2 px-4 text-center text-[10px] min-h-0 w-full text-noir"
              >
                Contacter THEKLOPE
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
