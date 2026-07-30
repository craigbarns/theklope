import { useRef, useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { IconShield } from './icons.jsx'
import { verifyAdultBirthDate } from '../lib/ageVerification.js'
import { useDialogFocus } from '../lib/useDialogFocus.js'

export default function AgeGate() {
  const { ageVerified, setAgeVerified } = useStore()
  
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')
  const refused = ageVerified === 'no'
  const dialogRef = useRef(null)
  const dayInputRef = useRef(null)
  const retryButtonRef = useRef(null)

  useDialogFocus({
    open: ageVerified !== true,
    dialogRef,
    initialFocusRef: refused ? retryButtonRef : dayInputRef,
    closeOnEscape: false,
  })

  if (ageVerified === true) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const result = verifyAdultBirthDate({ day: Number(day), month: Number(month), year: Number(year) })
    if (!result.valid) {
      setError('Date de naissance incohérente.')
      return
    }

    if (result.adult) {
      setAgeVerified(true)
    } else {
      setAgeVerified('no')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/60 px-5 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-description"
        tabIndex={-1}
        className="w-full max-w-md animate-fade-up rounded-3xl border border-white/10 bg-anthracite p-8 text-center shadow-card sm:p-10"
      >
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
          <IconShield width={30} height={30} />
        </div>
        <p className="eyebrow mb-3">Accès réservé aux majeurs</p>

        {!refused ? (
          <>
            <h2 id="age-gate-title" className="font-display text-2xl font-bold text-white leading-snug">
              Ce site est réservé aux personnes majeures.
            </h2>
            <p id="age-gate-description" className="mt-2 text-xs text-ash/70 leading-relaxed">
              La vente de produits de vapotage est strictement interdite aux mineurs (Code de la santé publique). Veuillez confirmer votre majorité pour entrer.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setAgeVerified(true)}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-glow"
              >
                J'ai 18 ans ou plus — Entrer
              </button>
              <button
                type="button"
                onClick={() => setAgeVerified('no')}
                className="btn-ghost w-full py-2.5 text-xs text-ash/80 hover:text-white"
              >
                Je suis mineur (Quitter)
              </button>
            </div>

            <details className="mt-4 text-left group">
              <summary className="cursor-pointer text-[11px] font-medium text-muted hover:text-neon transition text-center list-none">
                Saisir ma date de naissance
              </summary>
              <form onSubmit={handleSubmit} className="mt-4 border-t border-white/10 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <label className="block text-left">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted font-semibold">Jour</span>
                    <input
                      ref={dayInputRef}
                      type="number"
                      min="1"
                      max="31"
                      placeholder="JJ"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="input text-center font-bold text-base"
                    />
                  </label>
                  <label className="block text-left">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted font-semibold">Mois</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="MM"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="input text-center font-bold text-base"
                    />
                  </label>
                  <label className="block text-left">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted font-semibold">Année</span>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="AAAA"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="input text-center font-bold text-base"
                    />
                  </label>
                </div>

                {error && <p className="mt-3 text-xs text-rose-400 font-semibold" role="alert">{error}</p>}

                <button type="submit" className="btn-ghost w-full mt-3 py-2 text-xs font-semibold border-white/20">
                  Valider la date
                </button>
              </form>
            </details>

            <p className="mt-6 text-[10px] leading-relaxed text-faint">
              Les produits contenant de la nicotine créent une forte dépendance. Leur utilisation est déconseillée aux non-fumeurs.
            </p>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="font-display text-2xl font-bold text-white">Accès refusé</h2>
            <p id="age-gate-description" className="mt-3 text-sm leading-relaxed text-ash/70">
              Vous devez être majeur pour accéder à notre boutique de cigarette électronique. L'accès vous a été refusé.
            </p>
            <button
              ref={retryButtonRef}
              type="button"
              className="btn-ghost mt-7 w-full"
              onClick={() => {
                setAgeVerified(null)
                setDay('')
                setMonth('')
                setYear('')
                setError('')
              }}
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
