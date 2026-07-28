import { useEffect, useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { Link } from 'react-router-dom'
import { setOptionalServicesConsent } from '../lib/analytics.js'

export default function CookieBanner() {
  const {
    ageVerified,
    cookiesChoice,
    setCookiesChoice,
    setReviewsChoice,
  } = useStore()
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const open = ageVerified === true && !cookiesChoice

  useEffect(() => {
    if (!open) return
    setAnalyticsEnabled(cookiesChoice === 'accepted')
  }, [cookiesChoice, open])

  const saveChoices = (analytics) => {
    setOptionalServicesConsent({
      analytics,
      reviews: false,
      analyticsDecision: analytics ? 'accepted' : 'refused',
    })
    setCookiesChoice(analytics ? 'accepted' : 'refused')
    setReviewsChoice('refused')
  }

  // On n'affiche le bandeau cookies qu'après la vérification d'âge.
  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] animate-fade-up px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-4">
      <div className="mx-auto max-w-4xl">
        <div
          className="card flex flex-col gap-4 rounded-lg border-white/10 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5"
          role="dialog"
          aria-label="Choix des cookies"
          aria-live="polite"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-ash/75">
              La mesure d'audience est facultative et n'est pas nécessaire pour commander.{' '}
              <Link to="/legal/confidentialite" className="whitespace-nowrap text-neon hover:underline">
                En savoir plus
              </Link>
            </p>
            <div className="mt-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ash/80">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  className="accent-neon"
                />
                Mesure d'audience
              </label>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button className="btn-ghost min-w-0 px-4 py-2.5 text-xs" onClick={() => saveChoices(false)}>
              Tout refuser
            </button>
            <button
              className="btn-ghost min-w-0 px-4 py-2.5 text-xs"
              onClick={() => saveChoices(analyticsEnabled)}
            >
              Enregistrer
            </button>
            <button className="btn-primary min-w-0 px-4 py-2.5 text-xs" onClick={() => saveChoices(true)}>
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
