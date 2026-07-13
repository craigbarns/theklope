import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <Seo title="Page introuvable" noindex />
      <div>
        <p className="font-display text-7xl font-bold text-neon">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Page introuvable</h1>
        <p className="mt-2 text-muted">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
          <Link to="/boutique" className="btn-ghost">Voir la boutique</Link>
        </div>
      </div>
    </div>
  )
}
