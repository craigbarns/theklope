import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { getProduct } from '../data/products.js'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { IconHeart } from '../components/icons.jsx'

export default function Favorites() {
  const { favorites } = useStore()
  const products = favorites.map(getProduct).filter(Boolean)

  return (
    <div className="container-page py-8">
      <Seo title="Mes favoris" />
      <Breadcrumbs items={[{ label: 'Favoris' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Mes favoris</h1>

      {products.length === 0 ? (
        <div className="card mt-8 grid place-items-center p-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/10 text-faint">
            <IconHeart />
          </span>
          <p className="mt-4 text-muted">Vous n'avez pas encore de favoris.</p>
          <Link to="/boutique" className="btn-primary mt-4">Parcourir la boutique</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
