import { Link } from 'react-router-dom'
import { IconChevron } from './icons.jsx'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-faint" aria-label="Fil d'Ariane">
      <Link to="/" className="hover:text-neon">Accueil</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <IconChevron width={13} height={13} className="text-ash/30" />
          {item.to ? (
            <Link to={item.to} className="hover:text-neon">{item.label}</Link>
          ) : (
            <span className="text-ash/80">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
