import { useState } from 'react'
import { IconMail, IconCheck } from './icons.jsx'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email) return
    setDone(true)
    setEmail('')
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <section className="container-page py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-anthracite to-carbon p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-neon/10 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Newsletter</p>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Recevez nos nouveautés et offres exclusives
            </h2>
            <p className="mt-3 text-sm text-muted">
              Inscrivez-vous pour être informé en avant-première des sorties produits, ventes privées et
              conseils. Désinscription en un clic.
            </p>
          </div>
          <div>
            {done ? (
              <div className="flex items-center gap-3 rounded-2xl border border-neon/30 bg-neon/10 px-5 py-4 text-neon">
                <IconCheck /> Merci ! Votre inscription est confirmée.
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
                    <IconMail />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    className="input pl-11"
                  />
                </div>
                <button type="submit" className="btn-primary shrink-0">
                  S'inscrire
                </button>
              </form>
            )}
            <p className="mt-3 text-[11px] text-faint">
              En vous inscrivant, vous confirmez être majeur et acceptez notre politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
