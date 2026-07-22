// Finalisation des commandes à partir du statut Mollie — logique partagée entre
// le webhook et l'endpoint de statut. Idempotent : peut être appelé plusieurs fois.
import { mollie } from './mollie.js'
import { supabaseAdmin, hasSupabaseAdmin } from './supabaseAdmin.js'
import {
  buildMollieRefundRequest,
  molliePaymentHasChargeback,
  molliePaymentMaySettle,
  mollieMetadataObject,
  mollieOrderIdFromMetadata,
} from './checkout.js'
import { formatOrderItemLabel } from './orderPresentation.js'
import {
  sendEmail,
  emailLayout,
  escapeHtml,
  escapeHtmlWithLineBreaks,
  euro,
  FROM_CHECKOUT,
  INBOX_CHECKOUT,
} from './email.js'

export function orderConfirmationFulfillmentHtml(order) {
  const customer = order?.customer || {}
  const address = order?.address || {}
  const isPickup = order?.shipping?.id === 'pickup'
  const addressHtml = `${escapeHtml(customer.name || '')}<br>${escapeHtml(address.street || '')} ${escapeHtml(address.extra || '')}<br>${escapeHtml(address.zip || '')} ${escapeHtml(address.city || '')} — ${escapeHtml(address.country || '')}`
  const deliveryInstructions = typeof address.deliveryInstructions === 'string'
    ? address.deliveryInstructions.trim()
    : ''
  const deliveryInstructionsHtml = deliveryInstructions && !isPickup
    ? `<p style="font-size:13px;line-height:1.6;color:#e5e5e5;margin-top:16px"><strong style="color:#fff">Instructions de livraison :</strong><br>${escapeHtmlWithLineBreaks(deliveryInstructions)}</p>`
    : ''
  const fulfillmentHtml = isPickup
    ? '<p style="font-size:13px;color:#9aa0a6;margin-top:20px">Retrait boutique :<br>188 rue de Rome, 13006 Marseille</p>'
    : `<p style="font-size:13px;color:#9aa0a6;margin-top:20px">Livraison à :<br>${addressHtml}</p>`
  return { fulfillmentHtml, deliveryInstructionsHtml }
}

// Envoie la confirmation client + la notification interne (checkout@).
// Tolérant aux erreurs : ne doit jamais faire échouer la finalisation de commande.
export async function retryOrderConfirmationEmails(orderId, client = supabaseAdmin) {
  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id, status, payment_status, checkout_review_required_at, checkout_review_reason, confirmation_email_sent_at, confirmation_customer_email_sent_at, confirmation_admin_email_sent_at, customer, address, shipping, subtotal, discount, shipping_cost, total, order_items(name, qty, price, variant, line_total)')
    .eq('id', orderId)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order
    || order.confirmation_email_sent_at
    || order.checkout_review_required_at
    || order.checkout_review_reason
    || order.payment_status !== 'paid'
    || !['processing', 'ready_for_pickup', 'shipped', 'delivered'].includes(order.status)) {
    return { sent: false, alreadySent: Boolean(order?.confirmation_email_sent_at) }
  }

  const { error: attemptError } = await client
    .from('orders')
    .update({ confirmation_email_last_attempt_at: new Date().toISOString() })
    .eq('id', order.id)
  if (attemptError) throw attemptError

  const customer = order.customer || {}
  const items = order.order_items || []
  const rows = items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;color:#e5e5e5">${escapeHtml(formatOrderItemLabel(it))} × ${Number(it.qty)}</td><td style="padding:6px 0;text-align:right;color:#e5e5e5">${euro(it.line_total)}</td></tr>`,
    )
    .join('')
  const totalsHtml = `
    <table style="width:100%;border-top:1px solid #262626;margin-top:12px;padding-top:12px;font-size:14px">
      <tr><td style="padding:3px 0;color:#9aa0a6">Sous-total</td><td style="padding:3px 0;text-align:right">${euro(order.subtotal)}</td></tr>
      ${Number(order.discount) > 0 ? `<tr><td style="padding:3px 0;color:#9aa0a6">Remise</td><td style="padding:3px 0;text-align:right;color:#35FF8A">- ${euro(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:3px 0;color:#9aa0a6">Livraison</td><td style="padding:3px 0;text-align:right">${Number(order.shipping_cost) > 0 ? euro(order.shipping_cost) : 'Offerte'}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;color:#fff">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;color:#fff">${euro(order.total)}</td></tr>
    </table>`
  const itemsTable = `<table style="width:100%;font-size:14px">${rows}</table>${totalsHtml}`
  const { fulfillmentHtml, deliveryInstructionsHtml } = orderConfirmationFulfillmentHtml(order)

  const markRecipientSent = async (column) => {
    const { error } = await client
      .from('orders')
      .update({ [column]: new Date().toISOString() })
      .eq('id', order.id)
      .is(column, null)
    if (error) throw error
  }

  // Each recipient has its own durable acknowledgement. If the customer send
  // succeeds but the internal notification fails (or vice versa), later
  // retries never resend the successful message after Resend's 24h window.
  let customerSent = Boolean(order.confirmation_customer_email_sent_at)
  let adminSent = Boolean(order.confirmation_admin_email_sent_at)
  const deliveryErrors = []
  try {
    if (!customerSent && customer.email) {
      const result = await sendEmail({
        from: FROM_CHECKOUT,
        to: customer.email,
        idempotencyKey: `order-confirmation-customer/${order.id}`,
        subject: `Confirmation de votre commande ${order.id} — THEKLOPE`,
        html: emailLayout({
          title: 'Merci pour votre commande !',
          bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">Bonjour ${escapeHtml(customer.name || '')},<br>Votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong> a bien été payée et confirmée. Nous la préparons.</p>${itemsTable}${fulfillmentHtml}${deliveryInstructionsHtml}`,
        }),
      })
      if (!result?.skipped) {
        await markRecipientSent('confirmation_customer_email_sent_at')
        customerSent = true
      }
    } else if (!customerSent && !customer.email) {
      await markRecipientSent('confirmation_customer_email_sent_at')
      customerSent = true
    }
  } catch (error) {
    deliveryErrors.push(error)
  }

  // 2. Notification interne
  try {
    if (!adminSent) {
      const result = await sendEmail({
        from: FROM_CHECKOUT,
        to: INBOX_CHECKOUT,
        idempotencyKey: `order-confirmation-admin/${order.id}`,
        replyTo: customer.email || undefined,
        subject: `Nouvelle commande payée ${order.id} — ${euro(order.total)}`,
        html: emailLayout({
          title: `Commande payée ${escapeHtml(order.id)}`,
          bodyHtml: `<p style="font-size:14px;color:#cfcfcf">Client : ${escapeHtml(customer.name || '')} — ${escapeHtml(customer.email || '')} — ${escapeHtml(customer.phone || '')}</p>${itemsTable}${fulfillmentHtml}${deliveryInstructionsHtml}`,
        }),
      })
      if (!result?.skipped) {
        await markRecipientSent('confirmation_admin_email_sent_at')
        adminSent = true
      }
    }
  } catch (error) {
    deliveryErrors.push(error)
  }

  if (deliveryErrors.length) throw new AggregateError(deliveryErrors, 'Échec partiel des e-mails de commande.')
  if (!customerSent || !adminSent) return { sent: false, alreadySent: false }
  const { error: markError } = await client
    .from('orders')
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('confirmation_email_sent_at', null)
  if (markError) throw markError
  return { sent: true, alreadySent: false }
}

export async function retryRefundConfirmationEmail(orderId, client = supabaseAdmin) {
  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id, payment_status, checkout_review_required_at, checkout_review_reason, refund_email_sent_at, customer, total')
    .eq('id', orderId)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order
    || order.payment_status !== 'refunded'
    || order.checkout_review_required_at
    || order.checkout_review_reason
    || order.refund_email_sent_at) {
    return { sent: false, alreadySent: Boolean(order?.refund_email_sent_at) }
  }

  const attemptAt = new Date().toISOString()
  const { error: attemptError } = await client
    .from('orders')
    .update({ refund_email_last_attempt_at: attemptAt })
    .eq('id', order.id)
  if (attemptError) throw attemptError

  const customer = order.customer || {}
  if (customer.email) {
    const result = await sendEmail({
      from: FROM_CHECKOUT,
      to: customer.email,
      idempotencyKey: `order-refunded-customer/${order.id}`,
      subject: `Remboursement de votre commande ${order.id} — THEKLOPE`,
      html: emailLayout({
        title: 'Votre remboursement est confirmé',
        bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">Bonjour ${escapeHtml(customer.name || '')},<br>Le remboursement intégral de votre commande <strong style="color:#35FF8A">${escapeHtml(order.id)}</strong>, soit <strong style="color:#fff">${euro(order.total)}</strong>, a bien été confirmé.</p><p style="font-size:13px;line-height:1.6;color:#9aa0a6">Le délai d’apparition sur votre compte dépend ensuite de votre banque et du moyen de paiement utilisé.</p>`,
      }),
    })
    if (result?.skipped) return { sent: false, alreadySent: false }
  }

  const { error: markError } = await client
    .from('orders')
    .update({ refund_email_sent_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('refund_email_sent_at', null)
  if (markError) throw markError
  return { sent: true, alreadySent: false }
}

async function retryRefundEmailBestEffort(orderId, client) {
  try {
    await retryRefundConfirmationEmail(orderId, client)
  } catch (error) {
    console.error('refund email error:', error)
  }
}

async function sendStockIssueEmail(orderId, items = [], reason = '') {
  const details = items
    .map((item) => {
      const name = escapeHtml(item.name || item.productId || 'Produit')
      return `<li>${name} — demandé : ${Number(item.requested || 0)}, disponible : ${Number(item.available || 0)}</li>`
    })
    .join('')

  await sendEmail({
    from: FROM_CHECKOUT,
    to: INBOX_CHECKOUT,
    subject: `Incident stock sur commande payée ${orderId}`,
    html: emailLayout({
      title: `Incident stock ${escapeHtml(orderId)}`,
      bodyHtml: `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">La commande <strong style="color:#35FF8A">${escapeHtml(orderId)}</strong> est payée, mais elle ne peut pas être préparée automatiquement.</p>${reason ? `<p style="font-size:13px;color:#9aa0a6">Motif : ${escapeHtml(reason)}</p>` : ''}${details ? `<ul style="font-size:14px;color:#e5e5e5;line-height:1.7">${details}</ul>` : ''}<p style="font-size:13px;color:#9aa0a6">Un remboursement intégral automatique va être demandé à Mollie. Vérifiez son état dans l’administration.</p>`,
    }),
  })
}

async function finalizePaidOrder(orderId, client = supabaseAdmin) {
  const { data, error } = await client.rpc('finalize_paid_order', { p_order_id: orderId })
  if (error) throw error
  return data || { ok: false, status: 'unknown' }
}

const cents = (value) => Math.round(Number(value) * 100)

export function validateMolliePaymentForOrder(payment, order, expectedPaymentId) {
  if (!payment || payment.id !== expectedPaymentId) {
    throw new Error('Identifiant de paiement Mollie incohérent.')
  }
  if (order.payment_id && order.payment_id !== expectedPaymentId) {
    throw new Error('La commande est déjà rattachée à un autre paiement Mollie.')
  }
  if (payment.amount?.currency !== 'EUR'
    || !Number.isFinite(Number(payment.amount?.value))
    || cents(payment.amount.value) !== cents(order.total)) {
    throw new Error('Montant ou devise Mollie incohérent avec la commande.')
  }
}

function normalizedRefundStatus(status) {
  return ['queued', 'pending', 'processing', 'refunded', 'failed', 'canceled'].includes(status)
    ? status
    : 'pending'
}

function orderStatusFromRefund(status) {
  if (status === 'refunded') return 'refunded'
  if (['failed', 'canceled'].includes(status)) return 'refund_failed'
  return 'refund_pending'
}

export function completedFullRefundProof(refunds, order) {
  const uniqueRefunds = [...new Map(
    [...(refunds || [])].map((refund, index) => [refund?.id || `missing-${index}`, refund]),
  ).values()]
  const completed = uniqueRefunds.filter((refund) => (
    refund?.status === 'refunded'
    && refund.amount?.currency === 'EUR'
    && Number.isFinite(Number(refund.amount?.value))
  ))
  const refundedCents = completed.reduce((sum, refund) => sum + cents(refund.amount.value), 0)
  if (refundedCents < cents(order?.total)) return null
  return {
    refundId: completed.at(-1)?.id || null,
    refundedCents,
  }
}

function completedRefundCents(refunds) {
  return [...new Map(
    [...(refunds || [])].map((refund, index) => [refund?.id || `missing-${index}`, refund]),
  ).values()]
    .filter((refund) => (
      refund?.status === 'refunded'
      && refund.amount?.currency === 'EUR'
      && Number.isFinite(Number(refund.amount?.value))
    ))
    .reduce((sum, refund) => sum + cents(refund.amount.value), 0)
}

async function flagOrderReview(client, orderId, reason) {
  let query = client
    .from('orders')
    .update({
      checkout_review_required_at: new Date().toISOString(),
      checkout_review_reason: reason,
    })
    .eq('id', orderId)
  // Financial latches have an explicit priority: a chargeback is never
  // overwritten; multiple exposed payments outrank ordinary workflow review.
  if (reason === 'multiple_payments_for_order') {
    query = query.or('checkout_review_reason.is.null,checkout_review_reason.neq.payment_chargeback_detected')
  } else if (reason !== 'payment_chargeback_detected') {
    query = query.or('checkout_review_reason.is.null,checkout_review_reason.not.in.(multiple_payments_for_order,payment_chargeback_detected)')
  }
  const { error } = await query
  if (error) throw error
}

export function hasMollieChargeback(payment) {
  return molliePaymentHasChargeback(payment)
}

async function reconcileCompletedProviderRefund(payment, order, client, mollieClient) {
  const providerRefundedCents = payment.amountRefunded?.currency === 'EUR'
    && Number.isFinite(Number(payment.amountRefunded?.value))
    ? cents(payment.amountRefunded.value)
    : 0
  if (providerRefundedCents <= 0) {
    return null
  }
  if (providerRefundedCents < cents(order.total)) {
    await flagOrderReview(client, order.id, 'partial_external_refund')
    return null
  }
  const refunds = await mollieClient.paymentRefunds.page({
    paymentId: payment.id,
    limit: 250,
  })
  const proof = completedFullRefundProof(refunds, order)
  if (!proof) {
    await flagOrderReview(client, order.id, 'external_refund_proof_incomplete')
    return null
  }

  const { data, error } = await client.rpc('reconcile_external_order_refund', {
    p_order_id: order.id,
    p_refund_id: proof.refundId,
  })
  if (error) throw error
  if (!data?.ok) {
    throw new Error(`Remboursement Mollie externe non réconcilié (${data?.status || 'unknown'}).`)
  }
  await retryRefundEmailBestEffort(order.id, client)
  return { status: 'paid', orderId: order.id, orderStatus: 'refunded', refundStatus: 'refunded' }
}

async function recordRefundState(orderId, refund, errorMessage, client, refundAttempt) {
  // A transport/API exception is ambiguous: the POST may have reached Mollie.
  // Keep the same attempt as `requested` so the next replay can recover it by
  // list/idempotency. Only a retrieved refund resource may declare `failed`.
  const status = refund
    ? normalizedRefundStatus(refund.status)
    : errorMessage ? 'requested' : 'pending'
  const { data, error } = await client.rpc('record_order_refund_state', {
    p_order_id: orderId,
    p_refund_id: refund?.id || null,
    p_refund_status: status,
    p_error: errorMessage || null,
    p_refund_attempt: refundAttempt,
  })
  if (error) throw error
  if (!data?.ok) {
    const stateError = new Error(`État de remboursement refusé (${data?.status || 'unknown'}).`)
    stateError.code = data?.status || 'refund_state_refused'
    throw stateError
  }
  return { refundStatus: status, orderStatus: orderStatusFromRefund(status) }
}

function refundBelongsToOrder(refund, order) {
  if (!refund) return false
  const metadata = mollieMetadataObject(refund.metadata)
  const metadataOrderId = mollieOrderIdFromMetadata(metadata)
  return metadataOrderId
    ? metadataOrderId === order.id
    : refund.description === `Remboursement THEKLOPE ${order.id}`
}

function isMatchingAttemptRefund(refund, order, refundAttempt) {
  // Terminal resources are part of the same immutable attempt too. A worker
  // may crash after Mollie persisted `failed`, `canceled` or `refunded` but
  // before our database recorded it; ignoring that resource would eventually
  // create a second external refund after Mollie's idempotency retention ends.
  if (!refund || !['queued', 'pending', 'processing', 'refunded', 'failed', 'canceled'].includes(refund.status)) return false
  if (refund.amount?.currency !== 'EUR' || !Number.isFinite(Number(refund.amount?.value))) return false
  const metadata = mollieMetadataObject(refund.metadata)
  if (!refundBelongsToOrder(refund, order)) return false

  const metadataAttempt = Number(metadata.refundAttempt)
  if (Number.isInteger(metadataAttempt)) return metadataAttempt === refundAttempt
  // Compatibility for refunds created before attempt metadata was introduced.
  return refundAttempt === 1
}

// Full refunds are externally idempotent (stable Mollie key), internally
// claimed by an RPC, and recovered by listing an already-created refund if the
// process crashed before its ID was persisted.
export async function ensureFullOrderRefund(order, reason, {
  client = supabaseAdmin,
  mollieClient = mollie,
  allowRetry = false,
} = {}) {
  if (!client || !mollieClient) throw new Error('Remboursement non configuré.')

  // Read the provider ledger before claiming a local attempt. A refund done
  // manually in Mollie must reconcile even after the local retry limit, while
  // an existing partial refund means we request only the remaining balance.
  const providerRefunds = await mollieClient.paymentRefunds.page({
    paymentId: order.payment_id,
    limit: 250,
  })
  const completedProof = completedFullRefundProof(providerRefunds, order)
  if (completedProof) {
    const { data, error } = await client.rpc('reconcile_external_order_refund', {
      p_order_id: order.id,
      p_refund_id: completedProof.refundId,
    })
    if (error) throw error
    if (!data?.ok) {
      const reconcileError = new Error(`Remboursement Mollie externe non réconcilié (${data?.status || 'unknown'}).`)
      reconcileError.code = data?.status || 'external_refund_reconcile_failed'
      throw reconcileError
    }
    await retryRefundEmailBestEffort(order.id, client)
    return {
      refundStatus: 'refunded',
      orderStatus: 'refunded',
      refundId: completedProof.refundId,
    }
  }
  const alreadyRefundedCents = completedRefundCents(providerRefunds)
  const remainingCents = cents(order.total) - alreadyRefundedCents
  if (remainingCents <= 0) {
    const ledgerError = new Error('Le registre Mollie des remboursements est incohérent.')
    ledgerError.code = 'refund_ledger_inconsistent'
    throw ledgerError
  }

  const { data: claim, error: claimError } = await client.rpc('mark_order_refund_requested', {
    p_order_id: order.id,
    p_reason: String(reason || '').trim().slice(0, 500) || null,
    p_amount: remainingCents / 100,
    p_allow_retry: Boolean(allowRetry),
  })
  if (claimError) throw claimError
  if (!claim?.ok) {
    const error = new Error(`Remboursement refusé (${claim?.status || 'unknown'}).`)
    error.code = claim?.status || 'refund_refused'
    throw error
  }
  if (claim.status === 'already_refunded') {
    return { refundStatus: 'refunded', orderStatus: 'refunded', refundId: claim.refundId || order.refund_id }
  }
  const refundAttempt = Number(claim.refundAttempt) || Number(order.refund_attempt) || 1
  const refundAmountCents = cents(claim.refundAmount ?? (remainingCents / 100))
  if (!Number.isFinite(refundAmountCents) || refundAmountCents <= 0) {
    const amountError = new Error('Montant de tentative de remboursement invalide.')
    amountError.code = 'invalid_refund_amount'
    throw amountError
  }

  try {
    let refund
    const refundId = Object.prototype.hasOwnProperty.call(claim, 'refundId')
      ? claim.refundId
      : order.refund_id
    if (refundId) {
      refund = await mollieClient.paymentRefunds.get(refundId, { paymentId: order.payment_id })
    } else {
      refund = [...providerRefunds].find((candidate) => (
        isMatchingAttemptRefund(candidate, order, refundAttempt)
      ))
      const otherActiveRefund = [...providerRefunds].find((candidate) => (
        ['queued', 'pending', 'processing'].includes(candidate?.status)
        && refundBelongsToOrder(candidate, order)
      ))
      if (!refund && otherActiveRefund) {
        await flagOrderReview(client, order.id, 'external_refund_in_progress')
        const activeError = new Error('Un autre remboursement Mollie est déjà en cours ; vérification requise.')
        activeError.code = 'external_refund_in_progress'
        throw activeError
      }
      if (!refund && alreadyRefundedCents + refundAmountCents > cents(order.total)) {
        await flagOrderReview(client, order.id, 'refund_intent_exceeds_remaining')
        const intentError = new Error('Le solde Mollie a changé pendant la tentative ; vérification requise.')
        intentError.code = 'refund_intent_exceeds_remaining'
        throw intentError
      }
      if (!refund) {
        refund = await mollieClient.paymentRefunds.create(buildMollieRefundRequest(
          order,
          reason,
          refundAttempt,
          refundAmountCents / 100,
        ))
      }
    }

    if (refund.status === 'refunded') {
      const fullProof = completedFullRefundProof([...providerRefunds, refund], order)
      if (fullProof) {
        const { data, error } = await client.rpc('reconcile_external_order_refund', {
          p_order_id: order.id,
          p_refund_id: fullProof.refundId,
        })
        if (error) throw error
        if (!data?.ok) throw new Error(`Remboursement final non réconcilié (${data?.status || 'unknown'}).`)
        await retryRefundEmailBestEffort(order.id, client)
        return { refundStatus: 'refunded', orderStatus: 'refunded', refundId: fullProof.refundId }
      }
      await flagOrderReview(client, order.id, 'partial_external_refund')
      return { refundStatus: 'partial', orderStatus: 'refund_pending', refundId: refund.id }
    }

    const recorded = await recordRefundState(order.id, refund, '', client, refundAttempt)
    if (recorded.refundStatus === 'refunded') await retryRefundEmailBestEffort(order.id, client)
    return { ...recorded, refundId: refund.id }
  } catch (error) {
    try {
      await recordRefundState(
        order.id,
        null,
        error.message || 'Erreur Mollie inconnue.',
        client,
        refundAttempt,
      )
    } catch (recordError) {
      console.error('refund state persistence error:', recordError)
    }
    throw error
  }
}

// Récupère le paiement Mollie, met à jour la commande correspondante et renvoie
// son statut normalisé : 'paid' | 'pending' | 'failed'.
export async function syncOrderFromMolliePayment(paymentId, {
  client = supabaseAdmin,
  mollieClient = mollie,
} = {}) {
  if ((!hasSupabaseAdmin && client === supabaseAdmin) || !client || !mollieClient) {
    throw new Error('Paiement ou base de donnees non configure.')
  }

  const payment = await mollieClient.payments.get(paymentId)
  const orderId = mollieOrderIdFromMetadata(payment.metadata)
  if (!orderId) return { status: 'unknown' }

  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id, payment_status, payment_id, status, total, stock_reservation_status, refund_id, refund_status, refund_attempt, refund_reason, confirmation_email_sent_at')
    .eq('id', orderId)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order) throw new Error(`Commande Mollie introuvable : ${orderId}`)

  if (order.payment_id && order.payment_id !== paymentId) {
    // Validate the second provider entry independently before latching a
    // duplicate-payment review. The fetched Mollie resource is authoritative,
    // but metadata, EUR currency and exact amount must still match this order.
    validateMolliePaymentForOrder(payment, { ...order, payment_id: null }, paymentId)
    if (hasMollieChargeback(payment)) {
      await flagOrderReview(client, order.id, 'payment_chargeback_detected')
      return {
        status: 'paid',
        orderId,
        orderStatus: order.status,
        reviewRequired: true,
        reviewReason: 'payment_chargeback_detected',
      }
    }
    if (!molliePaymentMaySettle(payment)) {
      return {
        status: payment.status === 'paid' ? 'paid' : 'failed',
        orderId,
        ignoredDuplicate: true,
      }
    }
    await flagOrderReview(client, order.id, 'multiple_payments_for_order')
    const mismatch = new Error('Plusieurs paiements Mollie correspondent à cette commande.')
    mismatch.code = 'multiple_payments_for_order'
    throw mismatch
  }
  validateMolliePaymentForOrder(payment, order, paymentId)
  if (hasMollieChargeback(payment)) {
    await flagOrderReview(client, order.id, 'payment_chargeback_detected')
    return {
      status: 'paid',
      orderId,
      orderStatus: order.status,
      reviewRequired: true,
      reviewReason: 'payment_chargeback_detected',
    }
  }
  const isPaid = typeof payment.isPaid === 'function' ? payment.isPaid() : payment.status === 'paid'

  if (!order.payment_id) {
    const { data: linked, error: linkError } = await client.rpc('link_order_payment', {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_checkout_url: typeof payment.getCheckoutUrl === 'function'
        ? payment.getCheckoutUrl()
        : payment._links?.checkout?.href || null,
      p_expires_at: payment.expiresAt || null,
    })
    if (linkError) throw linkError
    if (!linked?.ok) {
      // A payment can settle after an admin safely released an unlinked order.
      // The normal link RPC stays absolute; this narrow recovery transition is
      // allowed only after the external ID, EUR currency and exact amount were
      // validated above and only for a canceled/released database state.
      const isStrictLegacyOrder = order.status === 'pending_payment'
        && order.payment_status === 'unpaid'
        && order.stock_reservation_status === 'none'
      if (linked?.status === 'order_not_payable' && (isPaid || isStrictLegacyOrder)) {
        const { data: latePaid, error: latePaidError } = await client.rpc('record_late_paid_order', {
          p_order_id: orderId,
          p_payment_id: paymentId,
        })
        if (latePaidError) throw latePaidError
        if (!latePaid?.ok) {
          throw new Error(`Paiement Mollie tardif non récupéré (${latePaid?.status || 'unknown'}).`)
        }
        order.payment_id = paymentId
        if (latePaid.status !== 'legacy_linked') {
          order.payment_status = 'paid'
          order.status = 'stock_issue'
          order.refund_reason = 'late_payment_after_cancellation'
        }
      } else if (linked?.status === 'order_not_payable'
        && ['failed', 'canceled', 'expired'].includes(payment.status)
        && (order.status === 'cancelled' || order.payment_status === 'failed')) {
        return { status: 'failed', orderId }
      } else {
        throw new Error(`Paiement Mollie non rattaché (${linked?.status || 'unknown'}).`)
      }
    } else {
      order.payment_id = paymentId
    }
  }

  let finalization = null
  if (isPaid && !['paid', 'refunded'].includes(order.payment_status)) {
    // Establish the paid/stock transition before reconciling a refund that may
    // already have completed in Mollie. This produces a net-zero stock move for
    // reserved/legacy orders and lets the reconciliation RPC require `paid`.
    finalization = await finalizePaidOrder(orderId, client)
    if (finalization.status === 'processing') {
      order.payment_status = 'paid'
      order.status = 'processing'
    } else if (['stock_issue', 'already_stock_issue'].includes(finalization.status)) {
      order.payment_status = 'paid'
      order.status = 'stock_issue'
      order.refund_reason = finalization.reason || order.refund_reason
    }
  }

  const reconciledRefund = await reconcileCompletedProviderRefund(
    payment,
    order,
    client,
    mollieClient,
  )
  if (reconciledRefund) return reconciledRefund

  if (isPaid) {
    if (['stock_issue', 'already_stock_issue'].includes(finalization?.status)) {
      if (finalization.status === 'stock_issue') {
        try {
          await sendStockIssueEmail(orderId, finalization.items || [], finalization.reason || '')
        } catch (err) {
          console.error('stock issue email error:', err)
        }
      }
      try {
        const refund = await ensureFullOrderRefund({ ...order, payment_id: paymentId },
          finalization.reason || 'Incident de préparation après paiement',
          { client, mollieClient })
        return { status: 'paid', orderId, orderStatus: refund.orderStatus, refundStatus: refund.refundStatus }
      } catch (error) {
        if (['refund_failed', 'refund_retry_exhausted'].includes(error.code)) {
          return { status: 'paid', orderId, orderStatus: 'refund_failed', refundStatus: 'failed' }
        }
        throw error
      }
    }

    // Durable timestamp + Resend idempotency keys make every webhook/status
    // synchronization a safe retry after an earlier transport failure.
    try {
      await retryOrderConfirmationEmails(orderId, client)
    } catch (err) {
      console.error('order email error:', err)
    }

    if (['stock_issue', 'refund_pending', 'refund_failed'].includes(order.status)
      || order.refund_id
      || order.refund_status) {
      try {
        const refund = await ensureFullOrderRefund({ ...order, payment_id: paymentId },
          order.refund_reason || 'Remboursement intégral de la commande',
          { client, mollieClient })
        return { status: 'paid', orderId, orderStatus: refund.orderStatus, refundStatus: refund.refundStatus }
      } catch (error) {
        if (['refund_failed', 'refund_retry_exhausted'].includes(error.code)) {
          return { status: 'paid', orderId, orderStatus: 'refund_failed', refundStatus: 'failed' }
        }
        throw error
      }
    }
    return { status: 'paid', orderId }
  }

  if (['failed', 'canceled', 'expired'].includes(payment.status)) {
    const { data: released, error: releaseError } = await client.rpc('release_order_resources', {
      p_order_id: orderId,
      p_reason: `Paiement Mollie ${payment.status}`,
      p_require_no_payment: false,
    })
    if (releaseError) throw releaseError
    if (!released?.ok && released?.status !== 'paid_order') {
      throw new Error(`Libération de commande refusée (${released?.status || 'unknown'}).`)
    }
    return { status: 'failed', orderId }
  }

  return { status: 'pending', orderId }
}
