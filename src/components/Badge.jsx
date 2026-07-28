import { BADGES } from '../data/catalog.js'

const PROMOTIONAL_BADGES = new Set(['best-seller', 'promo', 'stock-limite'])

export default function Badge({ type, className = '' }) {
  // Les anciens marqueurs de merchandising restent dans les données pour
  // l'administration, mais ne sont plus utilisés comme accroches publiques.
  if (PROMOTIONAL_BADGES.has(type)) return null
  const b = BADGES[type]
  if (!b) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${b.className} ${className}`}
    >
      {b.label}
    </span>
  )
}
