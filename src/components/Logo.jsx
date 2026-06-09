import { Link } from 'react-router-dom'

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`group flex items-center gap-2.5 focus-ring rounded-lg ${className}`}
      aria-label="THEKLOPE — accueil"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-neon text-noir transition-all duration-300 ease-premium group-hover:shadow-glow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* éclair — vape nouvelle génération */}
          <path
            d="M13.5 2 5 13.2h5.2L9.4 22 19 10.4h-5.4L13.5 2Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-bold leading-none tracking-tightest text-white">
        THE<span className="text-neon">KLOPE</span>
      </span>
    </Link>
  )
}
