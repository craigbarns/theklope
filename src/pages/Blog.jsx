import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BLOG_POSTS } from '../data/blog.js'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

const CATEGORIES = ['Tous', 'Guides & Santé', 'DIY', 'Matériel']

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="container-page py-8">
      <Seo
        title="Conseils & Guides Vape"
        description="Retrouvez nos articles de blog pour bien choisir votre matériel, apprendre le DIY e-liquide et réussir votre sevrage tabagique."
      />
      <Breadcrumbs items={[{ label: 'Blog' }]} />

      {/* Titre héro */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-r from-carbon/40 to-noir/80 px-6 py-12 text-center shadow-card sm:px-12 mt-4">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neon/5 blur-[80px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-electric/5 blur-[80px]" />
        <span className="eyebrow">Le coin des conseils</span>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl mt-2">
          Le Blog de la Vape
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Guides pratiques, astuces d'entretien et dossiers d'experts pour maîtriser votre matériel et vos e-liquides.
        </p>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-6">
        {/* Catégories (Chips) */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-neon text-noir shadow-glow font-bold'
                  : 'bg-white/5 border border-white/8 text-ash hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Input recherche */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un guide..."
          className="input max-w-xs bg-white/[0.03] text-xs py-2 px-3"
        />
      </div>

      {/* Liste des articles */}
      {filteredPosts.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-muted text-sm">
          Aucun article ne correspond à vos critères de recherche.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="card-interactive flex flex-col md:flex-row overflow-hidden group h-full"
            >
              {/* Image d'illustration */}
              <div className="relative aspect-video w-full md:w-48 shrink-0 bg-carbon overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Contenu textuel */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-neon font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="h-1 w-1 bg-white/20 rounded-full" />
                    <span className="text-[10px] text-muted">{post.readTime} de lecture</span>
                  </div>
                  <h2 className="mt-2 font-display text-base font-bold text-white group-hover:text-neon transition line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-faint font-semibold">Par {post.author}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs text-neon hover:underline font-semibold"
                  >
                    Lire l'article &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
