import { useEffect, useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const {
    ageVerified,
    cookiesChoice,
    setCookiesChoice,
    reviewsChoice,
    setReviewsChoice,
  } = useStore()
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [reviewsEnabled, setReviewsEnabled] = useState(false)
  const open = ageVerified === true && (!cookiesChoice || !reviewsChoice)

  useEffect(() => {
    if (!open) return
    setAnalyticsEnabled(cookiesChoice === 'accepted')
    setReviewsEnabled(reviewsChoice === 'accepted')
  }, [cookiesChoice, open, reviewsChoice])

  const saveChoices = (analytics, reviews) => {
    setCookiesChoice(analytics ? 'accepted' : 'refused')
    setReviewsChoice(reviews ? 'accepted' : 'refused')
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
              Choisissez séparément la mesure d'audience et l'affichage des avis Google. Aucun de ces services
              n'est nécessaire pour commander.{' '}
              <Link to="/legal/confidentialite" className="whitespace-nowrap text-neon hover:underline">
                En savoir plus
              </Link>
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ash/80">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  className="accent-neon"
                />
                Mesure d'audience
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ash/80">
                <input
                  type="checkbox"
                  checked={reviewsEnabled}
                  onChange={(event) => setReviewsEnabled(event.target.checked)}
                  className="accent-neon"
                />
                Avis Google via Elfsight
              </label>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button className="btn-ghost min-w-0 px-4 py-2.5 text-xs" onClick={() => saveChoices(false, false)}>
              Tout refuser
            </button>
            <button
              className="btn-ghost min-w-0 px-4 py-2.5 text-xs"
              onClick={() => saveChoices(analyticsEnabled, reviewsEnabled)}
            >
              Enregistrer
            </button>
            <button className="btn-primary min-w-0 px-4 py-2.5 text-xs" onClick={() => saveChoices(true, true)}>
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
