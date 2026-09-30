import { useEffect, useState } from 'react'
import { deliveryPromise } from '../lib/deliveryPromise.js'

// Les trois façons de recevoir sa commande, avec une promesse calculée à
// l'heure de Paris. Le coursier le jour même et le retrait en 1 h sont ce
// qu'un site national ne peut pas offrir : on les montre au moment d'acheter.
export default function DeliveryOptions({ className = '' }) {
  const [promise, setPromise] = useState(() => deliveryPromise())

  useEffect(() => {
    const timer = setInterval(() => setPromise(deliveryPromise()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const rows = [
    { icon: '🛵', title: 'Marseille', ...promise.courier, detail: 'Coursier dans les 16 arrondissements' },
    { icon: '🏬', title: 'Retrait gratuit', ...promise.pickup, detail: 'Boutique THEKLOPE, Marseille 6e' },
    { icon: '📦', title: 'France', ...promise.shipping, detail: 'Mondial Relay ou Colissimo' },
  ]

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}>
      {promise.beforeCutoff && (
        <p className="mb-3 text-xs font-semibold text-neon">
          Commandez dans les {promise.remaining} pour un départ aujourd’hui
        </p>
      )}
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.title} className="flex items-start gap-3 text-sm">
            <span aria-hidden="true" className="text-base leading-5">{row.icon}</span>
            <span className="min-w-0">
              <span className="text-muted">{row.title} · </span>
              <span className={row.today ? 'font-semibold text-white' : 'text-white'}>{row.text}</span>
              <span className="block text-xs text-faint">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
