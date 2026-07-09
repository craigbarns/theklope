import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { IconLock, IconCheck, IconTruck, IconBolt } from '../components/icons.jsx'
import { SHIPPING_METHODS as SHARED_SHIPPING_METHODS } from '../lib/pricing.js'

// Méthodes de livraison : prix/labels viennent du module partagé (source de
// vérité, identique au serveur), on n'ajoute ici que l'icône d'affichage.
const SHIPPING_ICONS = { poste: IconTruck, coursier: IconBolt, pickup: IconTruck }
const SHIPPING_METHODS = SHARED_SHIPPING_METHODS.map((m) => ({ ...m, icon: SHIPPING_ICONS[m.id] || IconTruck }))

export default function Checkout() {
  const { cartDetailed, totals, promo } = useStore()

  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState('poste')
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [address, setAddress] = useState({ street: '', extra: '', zip: '', city: '', country: 'France' })
  const [ageAccepted, setAgeAccepted] = useState(false)

  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shipping) || SHIPPING_METHODS[0]
  const shippingIsFree = promo?.type === 'shipping' || totals.subtotal >= totals.freeShippingThreshold
  const shippingCost = shippingIsFree ? 0 : selectedShipping.price
  const grandTotal = Math.max(0, totals.subtotal - totals.discount) + shippingCost

  const updateCustomer = (key) => (e) => setCustomer((prev) => ({ ...prev, [key]: e.target.value }))
  const updateAddress = (key) => (e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError('')

    if (step < 3) {
      setStep(step + 1)
      return
    }

    try {
      setSubmitting(true)

      // On envoie les IDENTIFIANTS produits + quantités, JAMAIS le montant.
      // Le serveur recalcule le total et crée le paiement Mollie.
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartDetailed.map((item) => ({
            id: item.product.id,
            qty: item.qty,
            variant: item.variant,
          })),
          shippingMethodId: shipping,
          promoCode: promo?.code || null,
          customer: {
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            email: customer.email,
            phone: customer.phone,
          },
          address,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error || !data.checkoutUrl) {
        throw new Error(data.error || 'Impossible de créer le paiement.')
      }

      // Redirection vers le checkout hébergé Mollie.
      window.location.href = data.checkoutUrl
    } catch (error) {
      setCheckoutError(error.message || 'Le paiement a échoué. Veuillez réessayer.')
      setSubmitting(false)
    }
  }

  if (cartDetailed.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <Seo title="Checkout" noindex />
        <p className="text-muted">Votre panier est vide.</p>
        <Link to="/boutique" className="btn-primary mt-6">Découvrir la boutique</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Seo title="Paiement" description="Finalisez votre commande THEKLOPE en toute sécurité." noindex />
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

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <Section title="Coordonnées client">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prénom" value={customer.firstName} onChange={updateCustomer('firstName')} required />
                  <Field label="Nom" value={customer.lastName} onChange={updateCustomer('lastName')} required />
                  <Field label="E-mail" type="email" value={customer.email} onChange={updateCustomer('email')} required className="sm:col-span-2" />
                  <Field label="Téléphone" type="tel" value={customer.phone} onChange={updateCustomer('phone')} className="sm:col-span-2" />
                </div>
              </Section>
            )}

            {step === 2 && (
              <>
                <Section title="Adresse de livraison">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Adresse" value={address.street} onChange={updateAddress('street')} required className="sm:col-span-2" />
                    <Field label="Complément" value={address.extra} onChange={updateAddress('extra')} className="sm:col-span-2" />
                    <Field label="Code postal" value={address.zip} onChange={updateAddress('zip')} required />
                    <Field label="Ville" value={address.city} onChange={updateAddress('city')} required />
                    <Field label="Pays" value={address.country} onChange={updateAddress('country')} required className="sm:col-span-2" />
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
                          {shippingIsFree ? 'Offerte' : formatPrice(m.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {step === 3 && (
              <Section title="Paiement sécurisé">
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/5 px-4 py-3 text-xs text-ash/80">
                  <IconLock width={14} height={14} className="text-neon shrink-0" />
                  <span>Vous allez être redirigé vers <strong className="text-white">Mollie</strong> pour régler en toute sécurité (carte, Bancontact, etc.). Aucune donnée de carte ne transite par THEKLOPE.</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm">
                  <div className="flex justify-between py-1"><span className="text-muted">Livraison</span><span className="text-white">{selectedShipping.label} — {selectedShipping.detail}</span></div>
                  <div className="flex justify-between py-1"><span className="text-muted">Montant à payer</span><span className="font-semibold text-white">{formatPrice(grandTotal)}</span></div>
                </div>

                <label className="mt-5 flex items-start gap-2.5 text-xs text-muted">
                  <input type="checkbox" required checked={ageAccepted} onChange={(e) => setAgeAccepted(e.target.checked)} className="mt-0.5 accent-neon rounded border-white/20 bg-white/5" />
                  <span>Je certifie être majeur (+18 ans) et j'accepte les conditions générales de vente.</span>
                </label>
              </Section>
            )}

            {checkoutError && (
              <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {checkoutError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">Retour</button>
              )}
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 font-semibold">
                {step < 3 ? 'Continuer' : submitting ? 'Redirection...' : `Payer ${formatPrice(grandTotal)}`}
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
