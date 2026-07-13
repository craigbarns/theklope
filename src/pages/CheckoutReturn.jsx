import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import { IconCheck, IconLock } from '../components/icons.jsx'
import { trackEvent } from '../lib/analytics.js'

// Page affichée au retour de Mollie. Elle interroge /api/payment-status qui relit
// le vrai statut du paiement (et finalise la commande si payée).
export default function CheckoutReturn() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const { clearCart, cookiesChoice } = useStore()

  const [state, setState] = useState('pending') // 'pending' | 'paid' | 'failed' | 'delayed' | 'error'
  const [order, setOrder] = useState(null)
  const clearedRef = useRef(false)

  useEffect(() => {
    if (!orderId) {
      setState('error')
      return undefined
    }

    let active = true
    let attempts = 0

    const poll = async () => {
      attempts += 1
      try {
        const res = await fetch(`/api/payment-status?order=${encodeURIComponent(orderId)}`)
        const data = await res.json()
        if (!active) return
        if (!res.ok) throw new Error(data.error || 'Statut indisponible')
        if (data.order) setOrder(data.order)

        if (data.status === 'paid') {
          setState('paid')
          if (!clearedRef.current) {
            clearedRef.current = true
            
            clearCart()
          }
          return
        }
        if (data.status === 'failed') {
          setState('failed')
          return
        }
        // pending : on réessaie quelques fois (le temps que Mollie confirme)
        if (attempts < 8) setTimeout(poll, 2000)
        else setState('delayed')
      } catch {
        if (!active) return
        if (attempts < 8) setTimeout(poll, 2500)
        else setState('error')
      }
    }

    poll()
    return () => {
      active = false
    }
  }, [orderId, clearCart])

  useEffect(() => {
    if (state !== 'paid' || !order || cookiesChoice !== 'accepted') return

    const trackedKey = `tk_purchase_tracked_${order.id || orderId}`
    try {
      if (window.sessionStorage.getItem(trackedKey)) return
      const raw = window.sessionStorage.getItem(`tk_purchase_${order.id || orderId}`)
      const snapshot = raw ? JSON.parse(raw) : null
      const fallbackShipping = typeof order.shipping === 'number'
        ? order.shipping
        : Number(order.shipping?.price || order.shipping?.cost || 0)

      if (trackEvent('purchase', {
        transaction_id: order.id || orderId,
        value: Number(order.total) || 0,
        tax: 0,
        shipping: Number(snapshot?.totals?.shipping ?? fallbackShipping) || 0,
        currency: 'EUR',
        coupon: snapshot?.coupon,
        items: Array.isArray(snapshot?.items) ? snapshot.items : [],
      })) {
        window.sessionStorage.setItem(trackedKey, '1')
        window.sessionStorage.removeItem(`tk_purchase_${order.id || orderId}`)
      }
    } catch {
      // Le statut de commande ne dépend jamais de la mesure d'audience.
    }
  }, [cookiesChoice, order, orderId, state])

  return (
    <div className="container-page py-16">
      <Seo title="Confirmation de commande" noindex />
      <div className="mx-auto max-w-lg card p-10 text-center">
        {state === 'paid' && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-neon/30 bg-neon/10 text-neon">
              <IconCheck width={32} height={32} />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Merci pour votre commande !</h1>
            <p className="mt-3 text-muted">
              Votre commande <strong className="text-neon">{order?.id || orderId}</strong> a bien été payée et confirmée.
            </p>
            {order?.status === 'stock_issue' && (
              <p className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Une vérification manuelle est en cours sur la disponibilité d'un produit. L'équipe THEKLOPE vous contacte rapidement si une adaptation est nécessaire.
              </p>
            )}
            {order?.total != null && (
              <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-left text-sm">
                <div className="flex justify-between py-1"><span className="text-muted">Montant payé</span><span className="font-semibold text-white">{formatPrice(order.total)}</span></div>
              </div>
            )}
            <Link to="/boutique" className="btn-primary mt-7 w-full">Continuer mes achats</Link>
          </>
        )}

        {state === 'pending' && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-white/15">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-neon" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Vérification du paiement…</h1>
            <p className="mt-3 text-sm text-muted">
              Nous confirmons votre paiement auprès de Mollie. Merci de patienter quelques instants.
            </p>
          </>
        )}

        {state === 'failed' && (
          <>
            <h1 className="font-display text-xl font-bold text-white">Paiement non abouti</h1>
            <p className="mt-3 text-sm text-muted">
              Votre paiement n'a pas pu être confirmé. Votre panier a été conservé, vous pouvez réessayer.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <Link to="/checkout" className="btn-primary w-full">Réessayer le paiement</Link>
              <Link to="/panier" className="btn-ghost w-full">Revenir au panier</Link>
            </div>
          </>
        )}

        {state === 'delayed' && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-white/15 text-faint">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Confirmation plus longue que prévu</h1>
            <p className="mt-3 text-sm text-muted">
              Mollie n'a pas encore confirmé la commande <strong className="text-white">{orderId}</strong>.
              Ne relancez pas le paiement si vous avez été débité : la confirmation peut arriver avec un léger délai.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <button type="button" className="btn-primary w-full" onClick={() => window.location.reload()}>
                Vérifier à nouveau
              </button>
              <Link to="/contact" className="btn-ghost w-full">Nous contacter</Link>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-white/15 text-faint">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Statut indisponible</h1>
            <p className="mt-3 text-sm text-muted">
              Impossible de vérifier le statut de votre commande pour le moment. Si vous avez été débité,
              votre commande sera bien confirmée. Contactez-nous en cas de doute.
            </p>
            <Link to="/contact" className="btn-primary mt-7 w-full">Nous contacter</Link>
          </>
        )}
      </div>
    </div>
  )
}
