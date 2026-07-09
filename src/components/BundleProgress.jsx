// Barres de progression incitatives vers les paliers de remise dégressive.
// Alimenté par `totals.bundleProgress` (calculé dans pricing.js). `compact` =
// variante resserrée pour le mini-panier (drawer).
export default function BundleProgress({ hints = [], compact = false }) {
  if (!hints?.length) return null

  return (
    <div className={compact ? 'space-y-2' : 'space-y-2'}>
      {hints.map((h) => {
        const pct = Math.min(100, Math.round((h.current / h.target) * 100))
        const plural = h.remaining > 1 ? 's' : ''
        return (
          <div
            key={h.key}
            className={`rounded-2xl border border-neon/20 bg-neon/5 ${compact ? 'px-4 py-2.5' : 'px-4 py-3'}`}
          >
            <p className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-ash/80`}>
              <span aria-hidden="true">🎯</span>
              <span>
                Plus que{' '}
                <strong className="text-neon">
                  {h.remaining} e-liquide{plural} {h.progressLabel}
                </strong>{' '}
                pour débloquer <strong className="text-neon">{h.promoLabel}</strong>&nbsp;!
              </span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-neon transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
