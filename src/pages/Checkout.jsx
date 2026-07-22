import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { IconLock, IconCheck, IconTruck, IconBolt } from '../components/icons.jsx'
import { SHIPPING_METHODS as SHARED_SHIPPING_METHODS } from '../lib/pricing.js'
import { MAX_DELIVERY_INSTRUCTIONS_LENGTH } from '../lib/delivery.js'
import {
  getStoredAcquisition,
  serializePurchaseSnapshot,
  toAnalyticsItem,
  trackEvent,
} from '../lib/analytics.js'
import {
  getProductVariantChoices,
  isCartCatalogResolved,
  isCartCatalogVerified,
} from '../lib/cart.js'
import {
  createCheckoutAttemptFingerprint,
  createCheckoutIdempotencyKey,
  persistPaymentAttempt,
  readStoredPaymentAttempt,
} from '../lib/checkoutAttempt.js'

// Méthodes de livraison : prix/labels viennent du module partagé (source de
// vérité, identique au serveur), on n'ajoute ici que l'icône d'affichage.
const SHIPPING_ICONS = { poste: IconTruck, coursier: IconBolt, pickup: IconTruck }
const SHIPPING_METHODS = SHARED_SHIPPING_METHODS.map((m) => ({ ...m, icon: SHIPPING_ICONS[m.id] || IconTruck }))
const FRENCH_POSTCODE = /^\d{5}$/
const MARSEILLE_POSTCODE = /^130(?:0[1-9]|1[0-6])$/

export default function Checkout() {
  const {
    cart,
    cartDetailed,
    totals,
    promo,
    cookiesChoice,
    catalogReady,
    syncStatus,
    refreshRemoteData,
  } = useStore()

  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const stepContentRef = useRef(null)
  const errorRef = useRef(null)
  const previousStepRef = useRef(step)
  const paymentAttemptRef = useRef({ fingerprint: '', key: '' })

  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shipping) || null
  const shippingIsFree = promo?.type === 'shipping' || totals.subtotal >= totals.freeShippingThreshold
  const shippingCost = !selectedShipping || shippingIsFree ? 0 : selectedShipping.price
  const grandTotal = Math.round((Math.max(0, totals.subtotal - totals.discount) + shippingCost) * 100) / 100
  const cartState = { cart, cartDetailed, catalogReady }
  const cartCatalogResolved = isCartCatalogResolved(cartState)
  const cartVerified = isCartCatalogVerified(cartState)
  const cartNeedsVerification = !cartVerified
  const cartHasVariantIssue = cartCatalogResolved && cartNeedsVerification

  // GA4 begin_checkout tracking
  const trackedRef = useRef(false)
  useEffect(() => {
    if (trackedRef.current || cartDetailed.length === 0 || !cartVerified) return
    if (trackEvent('begin_checkout', {
      currency: 'EUR',
      value: grandTotal,
      coupon: promo?.code,
      items: cartDetailed.map((item) => toAnalyticsItem(item.product, item.qty, item.variant)),
    })) {
      trackedRef.current = true
    }
  }, [cartDetailed, cartVerified, cookiesChoice, grandTotal, promo?.code])
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [address, setAddress] = useState({
    street: '',
    extra: '',
    zip: '',
    city: '',
    country: 'France',
    deliveryInstructions: '',
  })
  const [ageAccepted, setAgeAccepted] = useState(false)
  const cleanPostcode = address.zip.trim()
  const isFrenchPostcode = FRENCH_POSTCODE.test(cleanPostcode)
  const isMarseillePostcode = MARSEILLE_POSTCODE.test(cleanPostcode)
  const courierUnavailable = cleanPostcode.length === 5 && !isMarseillePostcode

  useEffect(() => {
    if (shipping === 'coursier' && courierUnavailable) setShipping('poste')
  }, [courierUnavailable, shipping])

  useEffect(() => {
    if (previousStepRef.current === step) return undefined
    previousStepRef.current = step
    const frame = window.requestAnimationFrame(() => {
      stepContentRef.current?.focus({ preventScroll: true })
      stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [step])

  useEffect(() => {
    if (!checkoutError) return undefined
    const frame = window.requestAnimationFrame(() => errorRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [checkoutError])

  const updateCustomer = (key) => (e) => {
    setCheckoutError('')
    setCustomer((prev) => ({ ...prev, [key]: e.target.value }))
  }
  const updateAddress = (key) => (e) => {
    setCheckoutError('')
    setAddress((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError('')

    if (!cartVerified) {
      setCheckoutError('Votre panier est encore en cours de vérification. Réessayez dans un instant.')
      return
    }

    if (step === 1) {
      setStep(2)
      return
    }

    if (step === 2) {
      if (!selectedShipping) {
        setCheckoutError('Choisissez un mode de livraison ou le retrait gratuit en boutique.')
        return
      }
      if (shipping !== 'pickup') {
        if (!isFrenchPostcode) {
          setCheckoutError('Saisissez un code postal français à 5 chiffres.')
          return
        }
        if (shipping === 'coursier' && !isMarseillePostcode) {
          setCheckoutError('La livraison par coursier est disponible uniquement pour les codes postaux 13001 à 13016.')
          return
        }
      }

      trackEvent('add_shipping_info', {
        currency: 'EUR',
        value: grandTotal,
        shipping_tier: selectedShipping.label,
        coupon: promo?.code,
        items: cartDetailed.map((item) => toAnalyticsItem(item.product, item.qty, item.variant)),
      })
      setStep(3)
      return
    }

    if (!ageAccepted) {
      setCheckoutError('Confirmez que vous avez au moins 18 ans pour continuer.')
      return
    }

    try {
      setSubmitting(true)

      // On envoie les IDENTIFIANTS produits + quantités, JAMAIS le montant.
      // Le serveur recalcule le total et crée le paiement Mollie.
      const requestBody = {
        ageConfirmed: ageAccepted,
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
        address: shipping === 'pickup' ? {} : address,
        acquisition: getStoredAcquisition(),
      }
      const payload = JSON.stringify(requestBody)
      // L'attribution n'altère pas la tentative commerciale : une décision de
      // consentement entre deux retries ne doit jamais créer un second paiement.
      const fingerprint = await createCheckoutAttemptFingerprint(requestBody)
      if (paymentAttemptRef.current.fingerprint !== fingerprint) {
        paymentAttemptRef.current = readStoredPaymentAttempt(fingerprint) || {
          fingerprint,
          key: createCheckoutIdempotencyKey(),
          createdAt: Date.now(),
        }
      }
      persistPaymentAttempt(paymentAttemptRef.current)

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': paymentAttemptRef.current.key,
        },
        body: payload,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.error || !data.checkoutUrl) {
        // Même un 4xx peut courir avec une requête identique qui vient de créer
        // l'ordre. On garde donc toujours la clé ; corriger le panier ou les
        // coordonnées change naturellement l'empreinte commerciale.
        throw new Error(data.error || 'Impossible de créer le paiement.')
      }

      if (data.orderId && cookiesChoice === 'accepted') {
        const purchaseSnapshot = serializePurchaseSnapshot({
          items: cartDetailed.map((item) => toAnalyticsItem(item.product, item.qty, item.variant)),
          totals: data.breakdown,
          coupon: promo?.code || undefined,
        })
        for (const storageName of ['sessionStorage', 'localStorage']) {
          try {
            window[storageName].setItem(`tk_purchase_${data.orderId}`, purchaseSnapshot)
          } catch {
            // La confirmation et le paiement ne dépendent jamais de l'analytics.
          }
        }
      }

      // La tentative reste durable jusqu'à ce que le retour Mollie confirme un
      // statut terminal. Un simple « retour » navigateur ne doit pas créer une
      // deuxième commande et réserver le stock une seconde fois.
      paymentAttemptRef.current = {
        ...paymentAttemptRef.current,
        ...(data.orderId ? { orderId: data.orderId } : {}),
      }
      persistPaymentAttempt(paymentAttemptRef.current)
      window.location.href = data.checkoutUrl
    } catch (error) {
      setCheckoutError(error.message || 'Le paiement a échoué. Veuillez réessayer.')
      setSubmitting(false)
    }
  }

  if (cartNeedsVerification) {
    return (
      <div className="container-page py-16 text-center">
        <Seo title="Paiement" noindex />
        <h1 className="font-display text-2xl font-bold text-white">Vérification du panier</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          {cartHasVariantIssue
            ? 'Une option de votre panier n’est plus disponible. Revenez au panier pour choisir une option actuelle.'
            : syncStatus === 'error'
            ? 'Le catalogue live est temporairement indisponible. Le paiement reste bloqué pour éviter un prix ou un produit obsolète.'
            : 'Nous vérifions les prix, les variantes et le stock live avant d’ouvrir le paiement.'}
        </p>
        {cartHasVariantIssue ? (
          <Link to="/panier" className="btn-primary mt-6">Corriger les options</Link>
        ) : syncStatus === 'error' && (
          <button type="button" onClick={refreshRemoteData} className="btn-ghost mt-6">Réessayer</button>
        )}
      </div>
    )
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
    <div className="container-page py-8 pb-20 lg:pb-8">
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

          <details className="card mb-5 p-4 lg:hidden">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-sm font-semibold text-white">
              <span>
                <span className="block">Votre commande ({cartDetailed.reduce((sum, item) => sum + item.qty, 0)})</span>
                <span className="mt-0.5 block text-[11px] font-normal text-neon">Voir le détail</span>
              </span>
              <span className="text-right">
                <span className="block text-[10px] font-normal uppercase tracking-wider text-faint">
                  {selectedShipping ? 'Total' : 'Avant livraison'}
                </span>
                <span className="block font-display text-base text-neon">{formatPrice(grandTotal)}</span>
              </span>
            </summary>
            <div className="mt-4 border-t border-white/8 pt-4">
              <OrderSummaryContent
                cartDetailed={cartDetailed}
                totals={totals}
                shippingCost={shippingCost}
                selectedShipping={selectedShipping}
                grandTotal={grandTotal}
              />
            </div>
          </details>

          <form onSubmit={handleSubmit}>
            <div
              ref={stepContentRef}
              tabIndex={-1}
              className="scroll-mt-24 outline-none"
              aria-label={`Étape ${step} sur 3`}
            >
            {step === 1 && (
              <Section title="Coordonnées client">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prénom" name="firstName" autoComplete="given-name" value={customer.firstName} onChange={updateCustomer('firstName')} required />
                  <Field label="Nom" name="lastName" autoComplete="family-name" value={customer.lastName} onChange={updateCustomer('lastName')} required />
                  <Field label="E-mail" name="email" autoComplete="email" type="email" value={customer.email} onChange={updateCustomer('email')} required className="sm:col-span-2" />
                  <Field label="Téléphone" name="phone" autoComplete="tel" type="tel" value={customer.phone} onChange={updateCustomer('phone')} className="sm:col-span-2" />
                </div>
              </Section>
            )}

            {step === 2 && (
              <>
                <Section title="Mode de livraison">
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((m) => {
                      const disabled = m.id === 'coursier' && courierUnavailable
                      return (
                        <label key={m.id} className={`flex items-center gap-4 rounded-lg border p-4 transition ${
                          disabled
                            ? 'cursor-not-allowed border-white/5 opacity-45'
                            : shipping === m.id
                              ? 'cursor-pointer border-neon bg-neon/5'
                              : 'cursor-pointer border-white/10 hover:border-white/25'
                        }`}>
                          <input
                            type="radio"
                            name="ship"
                            checked={shipping === m.id}
                            disabled={disabled}
                            onChange={() => {
                              setCheckoutError('')
                              setShipping(m.id)
                            }}
                            className="sr-only"
                          />
                          <m.icon width={22} height={22} className={shipping === m.id ? 'text-neon' : 'text-faint'} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">{m.label}</p>
                            <p className="text-xs text-faint">
                              {disabled ? 'Indisponible pour ce code postal' : m.detail}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-white">
                            {m.id === 'pickup' ? 'Gratuit' : shippingIsFree ? 'Offerte' : formatPrice(m.price)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </Section>
                {shipping && shipping !== 'pickup' ? (
                  <Section title="Adresse de livraison">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Adresse" name="street" value={address.street} onChange={updateAddress('street')} required className="sm:col-span-2" autoComplete="address-line1" />
                      <Field label="Complément d'adresse" name="addressExtra" value={address.extra} onChange={updateAddress('extra')} className="sm:col-span-2" autoComplete="address-line2" />
                      <Field
                        label="Code postal"
                        name="postalCode"
                        value={address.zip}
                        onChange={updateAddress('zip')}
                        required
                        inputMode="numeric"
                        autoComplete="postal-code"
                        pattern="[0-9]{5}"
                        maxLength={5}
                      />
                      <Field label="Ville" name="city" value={address.city} onChange={updateAddress('city')} required autoComplete="address-level2" />
                      <Field label="Pays" name="country" value={address.country} readOnly autoComplete="country-name" className="sm:col-span-2" />
                      <TextArea
                        label="Instructions de livraison (facultatif)"
                        name="deliveryInstructions"
                        value={address.deliveryInstructions}
                        onChange={updateAddress('deliveryInstructions')}
                        rows={4}
                        maxLength={MAX_DELIVERY_INSTRUCTIONS_LENGTH}
                        placeholder="Ex. : 3e étage, digicode 1234, nom sur l'interphone, appeler le 06… à l'arrivée."
                        hint={`Étage, accès, interphone ou numéro à contacter · ${address.deliveryInstructions.length}/${MAX_DELIVERY_INSTRUCTIONS_LENGTH} caractères`}
                        className="sm:col-span-2"
                      />
                    </div>
                    {shipping === 'coursier' && (
                      <p className={`mt-3 text-xs ${isMarseillePostcode ? 'text-neon' : 'text-muted'}`}>
                        Coursier disponible uniquement à Marseille, du 13001 au 13016.
                      </p>
                    )}
                  </Section>
                ) : shipping === 'pickup' ? (
                  <div className="mb-5 rounded-lg border border-neon/20 bg-neon/5 px-4 py-4 text-sm text-ash/80">
                    Retrait gratuit au 188 rue de Rome, 13006 Marseille. Aucune adresse de livraison n'est nécessaire.
                  </div>
                ) : (
                  <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-muted">
                    Choisissez d’abord un mode de livraison. Le retrait en boutique à Marseille est gratuit.
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <Section title="Paiement sécurisé">
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/5 px-4 py-3 text-xs text-ash/80">
                  <IconLock width={14} height={14} className="text-neon shrink-0" />
                  <span>Vous allez être redirigé vers <strong className="text-white">Mollie</strong> pour régler en toute sécurité (carte, Bancontact, etc.). Aucune donnée de carte ne transite par THEKLOPE.</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm">
                  <div className="grid gap-1 py-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                    <span className="text-muted">Livraison</span>
                    <span className="break-words text-white sm:text-right">{selectedShipping?.label} — {selectedShipping?.detail}</span>
                  </div>
                  {shipping !== 'pickup' && address.deliveryInstructions.trim() && (
                    <div className="grid gap-1 py-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                      <span className="text-muted">Instructions</span>
                      <span className="whitespace-pre-wrap break-words text-white sm:text-right">
                        {address.deliveryInstructions.trim()}
                      </span>
                    </div>
                  )}
                  <div className="grid gap-1 py-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                    <span className="text-muted">Montant à payer</span>
                    <span className="font-semibold text-white sm:text-right">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2.5 text-xs text-muted">
                  <input
                    id="ageAccepted"
                    type="checkbox"
                    required
                    checked={ageAccepted}
                    onChange={(e) => setAgeAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 accent-neon"
                  />
                  <p>
                    <label htmlFor="ageAccepted" className="cursor-pointer">Je certifie être majeur (+18 ans)</label>
                    {' '}et j'accepte les{' '}
                    <Link to="/legal/cgv" className="text-neon underline decoration-neon/40 underline-offset-2" target="_blank" rel="noreferrer">
                      conditions générales de vente
                    </Link>.
                  </p>
                </div>
              </Section>
            )}
            </div>

            {checkoutError && (
              <div
                ref={errorRef}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                tabIndex={-1}
                className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 outline-none"
              >
                {checkoutError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              {step > 1 && (
                <button type="button" onClick={() => { setCheckoutError(''); setStep((current) => current - 1) }} className="btn-ghost sm:w-auto">Retour</button>
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
            <OrderSummaryContent
              cartDetailed={cartDetailed}
              totals={totals}
              shippingCost={shippingCost}
              selectedShipping={selectedShipping}
              grandTotal={grandTotal}
              className="mt-4"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function OrderSummaryContent({
  cartDetailed,
  totals,
  shippingCost,
  selectedShipping,
  grandTotal,
  className = '',
}) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {cartDetailed.map((item) => (
          <div key={item.index} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ProductImage src={item.product.image} alt="" className="h-12 w-12 rounded-lg object-cover" width={48} height={48} />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-neon text-[10px] font-bold text-noir">{item.qty}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{item.product.name}</p>
              <VariantLabel product={item.product} variant={item.variant} />
            </div>
            <span className="shrink-0 text-sm text-ash/70">{formatPrice(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <dl className="mt-5 space-y-2.5 border-t border-white/8 pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd className="text-white">{formatPrice(totals.subtotal)}</dd></div>
        {totals.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Remise</dt><dd className="text-neon">- {formatPrice(totals.discount)}</dd></div>}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Livraison</dt>
          <dd className="text-right text-white">
            {!selectedShipping
              ? 'À choisir'
              : selectedShipping.id === 'pickup'
                ? 'Gratuit'
                : shippingCost === 0
                  ? 'Offerte'
                  : formatPrice(shippingCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-white/8 pt-3">
          <dt className="font-semibold text-white">{selectedShipping ? 'Total' : 'Avant livraison'}</dt>
          <dd className="font-display text-lg font-bold text-white">{formatPrice(grandTotal)}</dd>
        </div>
      </dl>
      {!selectedShipping && (
        <p className="mt-3 text-xs leading-relaxed text-faint">
          Retrait boutique gratuit disponible. Choisissez votre livraison à l’étape suivante.
        </p>
      )}
    </div>
  )
}

function VariantLabel({ product, variant = {} }) {
  const parts = getProductVariantChoices(product).flatMap(({ key, label, suffix = '' }) => (
    variant[key] == null || variant[key] === '' ? [] : [`${label} : ${variant[key]}${suffix}`]
  ))
  if (!parts.length) return null
  return <p className="mt-0.5 line-clamp-2 text-[11px] text-faint">{parts.join(' · ')}</p>
}

function Section({ title, children }) {
  return (
    <div className="card mb-5 p-4 sm:p-6">
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

function TextArea({ label, hint, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <textarea className="input min-h-28 resize-y" {...props} />
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  )
}
