import { useEffect, useState, useRef } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { IconClose, IconCheck, IconCart } from './icons.jsx'
import { Link } from 'react-router-dom'

export default function ExitIntentModal() {
  const { promo, applyPromo, cartCount, ageVerified } = useStore()
  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // N'afficher la modale que si l'âge est vérifié, aucun promo appliqué, et non déjà fermée cette session
    if (!ageVerified || promo || sessionStorage.getItem('tk_exit_intent_dismissed')) {
      return undefined
    }

    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && !sessionStorage.getItem('tk_exit_intent_dismissed')) {
        setOpen(true)
        sessionStorage.setItem('tk_exit_intent_dismissed', '1')
      }
    }

    // Sur mobile, déclencher doucement si le panier contient des articles et l'utilisateur reste inactif
    if (cartCount > 0) {
      timerRef.current = setTimeout(() => {
        if (!sessionStorage.getItem('tk_exit_intent_dismissed') && !promo) {
          setOpen(true)
          sessionStorage.setItem('tk_exit_intent_dismissed', '1')
        }
      }, 45000)
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [ageVerified, cartCount, promo])

  const close = () => {
    setOpen(false)
    sessionStorage.setItem('tk_exit_intent_dismissed', '1')
  }

  const handleApply = () => {
    applyPromo('BIENVENUE')
    setApplied(true)
    setTimeout(() => {
      close()
    }, 1500)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[98] bg-noir/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="fixed left-1/2 top-1/2 z-[99] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
      >
        <div className="card relative overflow-hidden rounded-3xl border-neon/40 bg-anthracite p-6 sm:p-8 shadow-card text-center">
          {/* Neon Glow backdrop */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-neon/15 blur-3xl" />

          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted hover:text-white transition"
            aria-label="Fermer"
          >
            <IconClose width={18} height={18} />
          </button>

          <span className="inline-block text-4xl mb-3 animate-bounce">🎁</span>

          <h2 id="exit-intent-title" className="font-display text-2xl sm:text-3xl font-bold text-white">
            Attendez ! Une surprise pour vous
          </h2>

          <p className="mt-3 text-sm text-ash/80 leading-relaxed">
            Profitez de <strong className="text-neon font-bold">-15% de réduction immédiate</strong> sur votre commande avec le code de bienvenue <span className="font-mono font-bold text-white">BIENVENUE</span>.
          </p>

          <div className="mt-6 space-y-3">
            {applied ? (
              <div className="rounded-2xl border border-neon/40 bg-neon/15 px-4 py-3 text-sm font-bold text-neon flex items-center justify-center gap-2">
                <IconCheck width={18} height={18} /> Code BIENVENUE appliqué (-15%) !
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-glow-green"
              >
                🎉 Appliquer mes -15% en 1-clic
              </button>
            )}

            {cartCount > 0 && (
              <Link
                to="/checkout"
                onClick={close}
                className="btn-ghost block w-full py-3 text-xs text-white hover:text-neon"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconCart width={16} height={16} /> Finaliser ma commande ({cartCount} article{cartCount > 1 ? 's' : ''})
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={close}
              className="text-xs text-faint hover:text-ash underline"
            >
              Non merci, continuer sans la réduction
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
