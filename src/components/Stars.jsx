import { IconStar } from './icons.jsx'

export default function Stars({ rating = 0, reviews, size = 14, showCount = true }) {
  const rate = Number(rating) || 0
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-neon">
        {[1, 2, 3, 4, 5].map((n) => (
          <IconStar key={n} width={size} height={size} filled={n <= Math.round(rate)} />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-muted">
          {rate.toFixed(1)}{reviews != null && ` (${reviews})`}
        </span>
      )}
    </div>
  )
}
