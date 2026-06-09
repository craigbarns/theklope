import { BADGES } from '../data/products.js'

export default function Badge({ type, className = '' }) {
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
