import { useStore } from '../context/StoreContext.jsx'
import { IconShield } from './icons.jsx'

export default function AgeGate() {
  const { ageVerified, setAgeVerified } = useStore()

  if (ageVerified === true) return null

  const refused = ageVerified === 'no'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/95 px-5 backdrop-blur-md">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-white/10 bg-anthracite p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
          <IconShield width={30} height={30} />
        </div>
        <p className="eyebrow mb-3">Accès réservé aux majeurs</p>

        {!refused ? (
          <>
            <h2 className="font-display text-2xl font-bold text-white">
              Ce site est réservé aux personnes majeures.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ash/70">
              La vente de produits de vapotage est interdite aux mineurs. Avez-vous plus de 18&nbsp;ans&nbsp;?
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary flex-1" onClick={() => setAgeVerified(true)}>
                Oui, entrer sur le site
              </button>
              <button className="btn-ghost flex-1" onClick={() => setAgeVerified('no')}>
                Non, quitter
              </button>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-faint">
              Les produits contenant de la nicotine créent une forte dépendance. Leur utilisation est
              déconseillée aux non-fumeurs.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold text-white">Accès refusé</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash/70">
              Vous avez indiqué être mineur. L'accès à cette boutique est strictement réservé aux personnes
              majeures.
            </p>
            <button
              className="btn-ghost mt-7 w-full"
              onClick={() => setAgeVerified(null)}
            >
              Revenir en arrière
            </button>
          </>
        )}
      </div>
    </div>
  )
}
