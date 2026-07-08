import { useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { IconShield } from './icons.jsx'

export default function AgeGate() {
  const { ageVerified, setAgeVerified } = useStore()
  
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  if (ageVerified === true) return null

  const refused = ageVerified === 'no'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const d = parseInt(day, 10)
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)

    if (isNaN(d) || isNaN(m) || isNaN(y)) {
      setError('Veuillez saisir une date de naissance valide.')
      return
    }

    // Validation basique des plages de date
    const currentYear = new Date().getFullYear()
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > currentYear) {
      setError('Date de naissance incohérente.')
      return
    }

    // Calcul de l'âge
    const birthDate = new Date(y, m - 1, d)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age >= 18) {
      setAgeVerified(true)
    } else {
      setAgeVerified('no')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/95 px-5 backdrop-blur-md">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-white/10 bg-anthracite p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
          <IconShield width={30} height={30} />
        </div>
        <p className="eyebrow mb-3">Accès réservé aux majeurs</p>

        {!refused ? (
          <>
            <h2 className="font-display text-2xl font-bold text-white leading-snug">
              Ce site est réservé aux personnes majeures.
            </h2>
            <p className="mt-2 text-xs text-ash/70 leading-relaxed">
              La vente de produits de vapotage est strictement interdite aux mineurs. Veuillez saisir votre date de naissance pour entrer.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-left">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted font-semibold">Jour</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="JJ"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
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
                    required
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
                    required
                    className="input text-center font-bold text-base"
                  />
                </label>
              </div>

              {error && <p className="mt-3 text-xs text-rose-400 font-semibold">{error}</p>}

              <div className="mt-6 flex flex-col gap-3">
                <button type="submit" className="btn-primary w-full py-3 font-semibold">
                  Confirmer et entrer
                </button>
                <button
                  type="button"
                  onClick={() => setAgeVerified('no')}
                  className="text-xs text-faint hover:text-white transition"
                >
                  Quitter le site
                </button>
              </div>
            </form>

            <p className="mt-6 text-[10px] leading-relaxed text-faint">
              Les produits contenant de la nicotine créent une forte dépendance. Leur utilisation est déconseillée aux non-fumeurs.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold text-white">Accès refusé</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash/70">
              Vous devez être majeur pour accéder à notre boutique de cigarette électronique. L'accès vous a été refusé.
            </p>
            <button
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
