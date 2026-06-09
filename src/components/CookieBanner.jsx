import { useStore } from '../context/StoreContext.jsx'

export default function CookieBanner() {
  const { ageVerified, cookiesChoice, setCookiesChoice } = useStore()

  // On n'affiche le bandeau cookies qu'après la vérification d'âge.
  if (ageVerified !== true || cookiesChoice) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-up px-4 pb-4">
      <div className="container-page">
        <div className="card flex flex-col gap-4 rounded-2xl border-white/10 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ash/75">
            Nous utilisons des cookies pour améliorer votre expérience, mesurer l'audience et personnaliser le
            contenu. Vous pouvez accepter ou refuser les cookies non essentiels.
          </p>
          <div className="flex shrink-0 gap-3">
            <button className="btn-ghost px-5 py-2.5 text-xs" onClick={() => setCookiesChoice('refused')}>
              Refuser
            </button>
            <button className="btn-primary px-5 py-2.5 text-xs" onClick={() => setCookiesChoice('accepted')}>
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
