import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import { IconCheck, IconLock } from '../components/icons.jsx'

// Page affichée au retour de Mollie. Elle interroge /api/payment-status qui relit
// le vrai statut du paiement (et finalise la commande si payée).
export default function CheckoutReturn() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const { clearCart } = useStore()

  const [state, setState] = useState('pending') // 'pending' | 'paid' | 'failed' | 'error'
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
