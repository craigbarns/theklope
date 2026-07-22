import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, formatPrice } from '../context/StoreContext.jsx'
import Seo from '../components/Seo.jsx'
import { IconCheck, IconLock } from '../components/icons.jsx'
import {
  getStoredAcquisition,
  parsePurchaseSnapshot,
  trackEventWhenReady,
} from '../lib/analytics.js'
import {
  CHECKOUT_RETURN_STATE,
  isPurchaseTrackable,
  resolveCheckoutReturnState,
  shouldClearCartForPaymentReturn,
} from '../lib/paymentReturn.js'
import { clearPaymentAttemptForOrder } from '../lib/checkoutAttempt.js'

const storageGet = (storageName, key) => {
  try {
    return window[storageName]?.getItem(key) || null
  } catch {
    return null
  }
}

const storageSet = (storageName, key, value) => {
  try {
    window[storageName]?.setItem(key, value)
  } catch {
    // Chaque stockage est indépendant : l'autre peut encore dédupliquer.
  }
}

const storageRemove = (storageName, key) => {
  try {
    window[storageName]?.removeItem(key)
  } catch {
    // Un snapshot fonctionnel peut rester si le stockage est verrouillé.
  }
}

// Page affichée au retour de Mollie. Elle interroge /api/payment-status qui relit
// le vrai statut du paiement (et finalise la commande si payée).
export default function CheckoutReturn() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const { clearCart, cookiesChoice } = useStore()

  const [state, setState] = useState(CHECKOUT_RETURN_STATE.pending)
  const [order, setOrder] = useState(null)
  const [reviewPaymentReceived, setReviewPaymentReceived] = useState(false)
  const clearedRef = useRef(false)
  const purchaseTrackingRef = useRef(null)

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

        const resolvedState = resolveCheckoutReturnState({
          paymentStatus: data.status,
          order: data.order,
        })
        if (resolvedState === CHECKOUT_RETURN_STATE.reviewRequired) {
          const paymentReceived = data.status === 'paid'
          setReviewPaymentReceived(paymentReceived)
          setState(resolvedState)
          if (paymentReceived) {
            const attemptMatched = clearPaymentAttemptForOrder(orderId)
            if (shouldClearCartForPaymentReturn({
              attemptMatched,
              alreadyCleared: clearedRef.current,
            })) {
              clearedRef.current = true
              clearCart()
            }
          }
          return
        }

        if (data.status === 'paid') {
          const attemptMatched = clearPaymentAttemptForOrder(orderId)
          setState(resolvedState)
          if (shouldClearCartForPaymentReturn({
            attemptMatched,
            alreadyCleared: clearedRef.current,
          })) {
            clearedRef.current = true
            clearCart()
          }
          return
        }
        if (data.status === 'failed') {
          clearPaymentAttemptForOrder(orderId)
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
    if (!isPurchaseTrackable(state) || !order || cookiesChoice !== 'accepted') return undefined

    const transactionId = order.id || orderId
    if (!transactionId || purchaseTrackingRef.current === transactionId) return undefined
    purchaseTrackingRef.current = transactionId
    let active = true

    const trackPurchase = async () => {
      const trackedKey = `tk_purchase_tracked_${transactionId}`
      const snapshotKey = `tk_purchase_${transactionId}`
      try {
        // localStorage empêche un double achat GA4 si l'URL de confirmation est
        // rouverte plus tard ; sessionStorage conserve la compatibilité existante.
        if (storageGet('localStorage', trackedKey) || storageGet('sessionStorage', trackedKey)) return
        const raw = storageGet('sessionStorage', snapshotKey) || storageGet('localStorage', snapshotKey)
        const snapshot = parsePurchaseSnapshot(raw)
        if (raw && !snapshot) {
          storageRemove('sessionStorage', snapshotKey)
          storageRemove('localStorage', snapshotKey)
        }
        const fallbackShipping = typeof order.shipping === 'number'
          ? order.shipping
          : Number(order.shipping?.price || order.shipping?.cost || 0)
        const acquisition = getStoredAcquisition()?.lastTouch || {}

        const tracked = await trackEventWhenReady('purchase', {
          transaction_id: transactionId,
          value: Number(order.total) || 0,
          tax: 0,
          shipping: Number(snapshot?.totals?.shipping ?? fallbackShipping) || 0,
          currency: 'EUR',
          coupon: snapshot?.coupon,
          items: Array.isArray(snapshot?.items) ? snapshot.items : [],
          campaign_id: acquisition.utm_id,
          campaign: acquisition.utm_campaign,
          source: acquisition.utm_source,
          medium: acquisition.utm_medium,
          term: acquisition.utm_term,
          content: acquisition.utm_content,
        })

        if (!active || !tracked) return
        storageSet('localStorage', trackedKey, '1')
        storageSet('sessionStorage', trackedKey, '1')
        storageRemove('sessionStorage', snapshotKey)
        storageRemove('localStorage', snapshotKey)
      } catch {
        // Le statut de commande ne dépend jamais de la mesure d'audience. Le
        // snapshot reste disponible afin qu'une actualisation puisse réessayer.
      } finally {
        if (active) purchaseTrackingRef.current = null
      }
    }

    trackPurchase()
    return () => {
      active = false
    }
  }, [cookiesChoice, order, orderId, state])

  // Si une commande déjà mesurée comme achat est remboursée plus tard puis que
  // le client rouvre cette URL, GA4 reçoit un refund dédupliqué. Une commande
  // arrivée directement dans l'état remboursé n'émet jamais de purchase.
  useEffect(() => {
    if (state !== CHECKOUT_RETURN_STATE.refunded || !order || cookiesChoice !== 'accepted') return undefined
    const transactionId = order.id || orderId
    if (!transactionId) return undefined
    const purchaseKey = `tk_purchase_tracked_${transactionId}`
    const refundKey = `tk_refund_tracked_${transactionId}`
    if (!storageGet('localStorage', purchaseKey) && !storageGet('sessionStorage', purchaseKey)) return undefined
    if (storageGet('localStorage', refundKey) || storageGet('sessionStorage', refundKey)) return undefined

    let active = true
    trackEventWhenReady('refund', {
      transaction_id: transactionId,
      value: Number(order.total) || 0,
      currency: 'EUR',
    }).then((tracked) => {
      if (!active || !tracked) return
      storageSet('localStorage', refundKey, '1')
      storageSet('sessionStorage', refundKey, '1')
    }).catch(() => {})

    return () => {
      active = false
    }
  }, [cookiesChoice, order, orderId, state])

  return (
    <div className="container-page py-16">
      <Seo title="Confirmation de commande" noindex />
      <div className="mx-auto max-w-lg card p-10 text-center">
        {state === CHECKOUT_RETURN_STATE.paid && (
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

        {state === CHECKOUT_RETURN_STATE.stockIssue && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-200">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Vérification de disponibilité en cours</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Le paiement de la commande <strong className="text-white">{order?.id || orderId}</strong> a été reçu,
              mais un article nécessite une vérification. Ne relancez pas le paiement : l'équipe vous contacte ou déclenche le remboursement.
            </p>
            <Link to="/contact" className="btn-primary mt-7 w-full">Contacter l'équipe</Link>
          </>
        )}

        {state === CHECKOUT_RETURN_STATE.reviewRequired && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-200">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Vérification manuelle en cours</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {reviewPaymentReceived
                ? <>Le paiement de la commande <strong className="text-white">{order?.id || orderId}</strong> a été reçu, mais l'opération doit être contrôlée par notre équipe.</>
                : <>La commande <strong className="text-white">{order?.id || orderId}</strong> doit être contrôlée par notre équipe avant toute nouvelle tentative.</>}
              {' '}Ne relancez pas le paiement. Nous vérifierons la commande et vous contacterons si nécessaire.
            </p>
            <Link to="/contact" className="btn-primary mt-7 w-full">Contacter l'équipe</Link>
          </>
        )}

        {state === CHECKOUT_RETURN_STATE.refundPending && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-200">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Remboursement en cours</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              La commande <strong className="text-white">{order?.id || orderId}</strong> ne peut pas être finalisée.
              Le remboursement de {order?.total != null ? formatPrice(order.total) : 'votre paiement'} est en cours chez Mollie.
              Ne relancez pas le paiement.
            </p>
            <Link to="/contact" className="btn-ghost mt-7 w-full">Nous contacter</Link>
          </>
        )}

        {state === CHECKOUT_RETURN_STATE.refunded && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-white/15 text-neon">
              <IconCheck width={30} height={30} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Commande remboursée</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Le remboursement de la commande <strong className="text-white">{order?.id || orderId}</strong>
              {order?.total != null ? ` (${formatPrice(order.total)})` : ''} a été confirmé par Mollie.
              Le délai d'affichage dépend ensuite de votre banque.
            </p>
            <Link to="/boutique" className="btn-primary mt-7 w-full">Retour à la boutique</Link>
          </>
        )}

        {state === CHECKOUT_RETURN_STATE.refundFailed && (
          <>
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-rose-400/25 bg-rose-400/10 text-rose-200">
              <IconLock width={26} height={26} />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Remboursement à vérifier</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Mollie n'a pas encore confirmé le remboursement de la commande <strong className="text-white">{order?.id || orderId}</strong>.
              Ne relancez pas le paiement ; notre équipe doit vérifier l'opération.
            </p>
            <Link to="/contact" className="btn-primary mt-7 w-full">Contacter le service client</Link>
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
