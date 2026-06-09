import { IconStar } from './icons.jsx'

export default function Stars({ rating = 0, reviews, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-neon">
        {[1, 2, 3, 4, 5].map((n) => (
          <IconStar key={n} width={size} height={size} filled={n <= Math.round(rating)} />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-muted">
          {rating.toFixed(1)}{reviews != null && ` (${reviews})`}
        </span>
      )}
    </div>
  )
}
