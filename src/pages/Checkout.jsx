import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconLock, IconCheck, IconTruck, IconBolt } from '../components/icons.jsx'

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', detail: '2–3 jours ouvrés', price: 4.9, icon: IconTruck },
  { id: 'express', label: 'Express', detail: '24h en France', price: 8.9, icon: IconBolt },
  { id: 'pickup', label: 'Point relais', detail: '2–4 jours ouvrés', price: 2.9, icon: IconTruck },
]

export default function Checkout() {
  const { cartDetailed, totals, clearCart } = useStore()
  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState('standard')
  const [done, setDone] = useState(false)
  const [orderId] = useState(() => 'TK-' + Math.floor(100000 + Math.random() * 899999))

  const shippingCost = totals.subtotal >= totals.freeShippingThreshold ? 0 : SHIPPING_METHODS.find((m) => m.id === shipping).price
  const grandTotal = Math.max(0, totals.subtotal - totals.discount) + shippingCost

  if (done) {
    return (
      <div className="container-page py-16">
        <Seo title="Commande confirmée" />
        <div className="mx-auto max-w-lg card p-10 text-center">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-neon/30 bg-neon/10 text-neon">
            <IconCheck width={32} height={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Merci pour votre commande !</h1>
          <p className="mt-3 text-muted">
            Votre commande <strong className="text-neon">{orderId}</strong> a bien été enregistrée. Vous
            recevrez un e-mail de confirmation avec le suivi de livraison.
          </p>
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-left text-sm">
            <div className="flex justify-between py-1"><span className="text-muted">Montant payé</span><span className="font-semibold text-white">{formatPrice(grandTotal)}</span></div>
            <div className="flex justify-between py-1"><span className="text-muted">Livraison estimée</span><span className="text-white">{shipping === 'express' ? '24h' : '2–4 jours'}</span></div>
          </div>
          <Link to="/boutique" className="btn-primary mt-7 w-full">Continuer mes achats</Link>
        </div>
      </div>
    )
  }

  if (cartDetailed.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <Seo title="Checkout" />
        <p className="text-muted">Votre panier est vide.</p>
        <Link to="/boutique" className="btn-primary mt-6">Découvrir la boutique</Link>
      </div>
    )
  }

  const next = (e) => {
    e.preventDefault()
    if (step < 3) setStep(step + 1)
    else {
      clearCart()
      setDone(true)
    }
  }

  return (
    <div className="container-page py-8">
      <Seo title="Paiement" description="Finalisez votre commande THEKLOPE en toute sécurité." />
      <Breadcrumbs items={[{ label: 'Panier', to: '/panier' }, { label: 'Paiement' }]} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Étapes */}
          <div className="mb-8 flex items-center gap-2">
            {['Coordonnées', 'Livraison', 'Paiement'].map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  step > i + 1 ? 'bg-neon text-noir' : step === i + 1 ? 'border-2 border-neon text-neon' : 'border border-white/15 text-faint'
                }`}>
                  {step > i + 1 ? <IconCheck width={16} height={16} /> : i + 1}
                </span>
                <span className={`hidden text-sm sm:block ${step === i + 1 ? 'text-white' : 'text-faint'}`}>{label}</span>
                {i < 2 && <span className="h-px flex-1 bg-white/10" />}
              </div>
            ))}
          </div>

          <form onSubmit={next}>
            {step === 1 && (
              <Section title="Coordonnées client">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prénom" required />
                  <Field label="Nom" required />
                  <Field label="E-mail" type="email" required className="sm:col-span-2" />
                  <Field label="Téléphone" type="tel" className="sm:col-span-2" />
                </div>
              </Section>
            )}

            {step === 2 && (
              <>
                <Section title="Adresse de livraison">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Adresse" required className="sm:col-span-2" />
                    <Field label="Complément" className="sm:col-span-2" />
                    <Field label="Code postal" required />
                    <Field label="Ville" required />
                    <Field label="Pays" defaultValue="France" required className="sm:col-span-2" />
                  </div>
                </Section>
                <Section title="Mode de livraison">
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((m) => (
                      <label key={m.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                        shipping === m.id ? 'border-neon bg-neon/5' : 'border-white/10 hover:border-white/25'
                      }`}>
                        <input type="radio" name="ship" checked={shipping === m.id} onChange={() => setShipping(m.id)} className="sr-only" />
                        <m.icon width={22} height={22} className={shipping === m.id ? 'text-neon' : 'text-faint'} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{m.label}</p>
                          <p className="text-xs text-faint">{m.detail}</p>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {totals.subtotal >= totals.freeShippingThreshold ? 'Offerte' : formatPrice(m.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {step === 3 && (
              <Section title="Paiement">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/5 px-4 py-3 text-sm text-ash/75">
                  <IconLock width={16} height={16} className="text-neon" /> Paiement chiffré — démonstration, aucune transaction réelle.
                </div>
                <div className="grid gap-4">
                  <Field label="Nom sur la carte" required />
                  <Field label="Numéro de carte" placeholder="4242 4242 4242 4242" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiration" placeholder="MM/AA" required />
                    <Field label="CVC" placeholder="123" required />
                  </div>
                </div>
                <label className="mt-4 flex items-start gap-2.5 text-xs text-muted">
                  <input type="checkbox" required className="mt-0.5 accent-neon" />
                  Je certifie être majeur (+18 ans) et j'accepte les conditions générales de vente.
                </label>
              </Section>
            )}

            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">Retour</button>
              )}
              <button type="submit" className="btn-primary flex-1">
                {step < 3 ? 'Continuer' : `Payer ${formatPrice(grandTotal)}`}
              </button>
            </div>
          </form>
        </div>

        {/* Récap */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-white">Votre commande</h2>
            <div className="mt-4 space-y-3">
              {cartDetailed.map((item) => (
                <div key={item.index} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-neon text-[10px] font-bold text-noir">{item.qty}</span>
                  </div>
                  <p className="flex-1 truncate text-sm text-white">{item.product.name}</p>
                  <span className="text-sm text-ash/70">{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-5 space-y-2.5 border-t border-white/8 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd className="text-white">{formatPrice(totals.subtotal)}</dd></div>
              {totals.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Remise</dt><dd className="text-neon">- {formatPrice(totals.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Livraison</dt><dd className="text-white">{shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}</dd></div>
              <div className="flex justify-between border-t border-white/8 pt-3"><dt className="font-semibold text-white">Total</dt><dd className="font-display text-lg font-bold text-white">{formatPrice(grandTotal)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card mb-5 p-6">
      <h2 className="mb-5 font-display text-lg font-bold text-white">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input className="input" {...props} />
    </label>
  )
}
