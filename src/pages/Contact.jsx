import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconMail, IconPhone, IconHeadset, IconCheck, IconPin } from '../components/icons.jsx'

const MINI_FAQ = [
  { q: 'Quels sont les délais de livraison ?', a: 'Expédition sous 24/48h, réception sous 2 à 4 jours ouvrés en France.' },
  { q: 'Comment suivre ma commande ?', a: 'Un e-mail avec le numéro de suivi vous est envoyé dès l\'expédition.' },
  { q: 'Puis-je retourner un produit ?', a: 'Oui, sous 14 jours pour les produits non ouverts. Voir notre politique de retour.' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error || "Envoi impossible.")
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.message || "Envoi impossible. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-8">
      <Seo title="Contact | THEKLOPE" description="Contactez l’équipe THEKLOPE : formulaire, e-mail et boutique à Marseille. Service client réactif." />
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Contact</h1>
      <p className="mt-2 max-w-xl text-muted">
        Une question sur un produit, une commande ou un conseil ? Notre équipe vous répond rapidement.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Formulaire */}
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="grid place-items-center py-12 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-neon/30 bg-neon/10 text-neon">
                <IconCheck width={28} height={28} />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Message envoyé !</h2>
              <p className="mt-2 text-muted">Nous vous répondrons sous 24h ouvrées.</p>
              <button onClick={() => setSent(false)} className="btn-ghost mt-6">Envoyer un autre message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom" required value={form.name} onChange={update('name')} />
                <Field label="E-mail" type="email" required value={form.email} onChange={update('email')} />
              </div>
              <Field label="Sujet" required value={form.subject} onChange={update('subject')} />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Message</span>
                <textarea rows={5} required value={form.message} onChange={update('message')} className="input resize-none" />
              </label>
              <label className="flex items-start gap-2.5 text-xs text-muted">
                <input type="checkbox" required className="mt-0.5 accent-neon" />
                J'accepte que mes données soient utilisées pour traiter ma demande.
              </label>
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Envoi…' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>

        {/* Coordonnées + FAQ */}
        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Nous joindre</h2>
            <a
              href="https://maps.google.com/?q=The+Klope+188+Rue+de+Rome+13006+Marseille"
              target="_blank"
              rel="noreferrer"
              className="mb-3 flex items-start gap-3 text-sm text-ash/75 hover:text-neon"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-neon"><IconPin width={17} height={17} /></span>
              <span>The Klope — Boutique de Marseille<br />188 Rue de Rome, 13006 Marseille</span>
            </a>
            <a href="mailto:contact@theklope.com" className="mb-3 flex items-center gap-3 text-sm text-ash/75 hover:text-neon">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-neon"><IconMail width={17} height={17} /></span>
              contact@theklope.com
            </a>
            <a href="tel:+33491555555" className="mb-3 flex items-center gap-3 text-sm text-ash/75 hover:text-neon">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-neon"><IconPhone width={17} height={17} /></span>
              04 91 55 55 55
            </a>
            <div className="flex items-center gap-3 text-sm text-ash/75">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-neon"><IconHeadset width={17} height={17} /></span>
              Lundi – Vendredi · 9h00 – 19h00
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-white">FAQ rapide</h2>
            <div className="space-y-4">
              {MINI_FAQ.map((f) => (
                <div key={f.q}>
                  <p className="text-sm font-medium text-white">{f.q}</p>
                  <p className="mt-1 text-sm text-muted">{f.a}</p>
                </div>
              ))}
            </div>
            <Link to="/faq" className="mt-4 inline-block text-sm text-neon hover:underline">Voir toute la FAQ →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input className="input" {...props} />
    </label>
  )
}
