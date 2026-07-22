import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const hardeningPath = new URL('../../supabase/migrations/202607210001_harden_checkout_payments.sql', import.meta.url)
const catalogPath = new URL('../../supabase/migrations/202607210002_fix_catalog_quality.sql', import.meta.url)
const optimisticLockPath = new URL('../../supabase/migrations/202607210003_product_optimistic_lock.sql', import.meta.url)
const schemaPath = new URL('../../supabase/schema.sql', import.meta.url)

function sqlFunction(source, name) {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\b[\\s\\S]*?\\n\\$\\$;`, 'i'))
  assert.ok(match, `missing SQL function ${name}`)
  return match[0]
}

test('fresh schema and durable migration expose every checkout transition RPC', async () => {
  const [migration, schema] = await Promise.all([
    readFile(hardeningPath, 'utf8'),
    readFile(schemaPath, 'utf8'),
  ])
  for (const functionName of [
    'create_checkout_order',
    'link_order_payment',
    'record_late_paid_order',
    'release_order_resources',
    'finalize_paid_order',
    'mark_order_refund_requested',
    'record_order_refund_state',
    'reconcile_external_order_refund',
    'clear_multiple_payment_review',
  ]) {
    assert.match(migration, new RegExp(`create or replace function public\\.${functionName}\\b`, 'i'))
    assert.match(schema, new RegExp(`create or replace function public\\.${functionName}\\b`, 'i'))
  }
  assert.match(migration, /refund_attempt between 0 and 3/i)
  assert.match(migration, /confirmation_customer_email_sent_at/i)
  assert.match(migration, /confirmation_admin_email_sent_at/i)
  assert.match(migration, /checkout_review_required_at/i)
  assert.match(migration, /stock_reservation_status = 'reserved'/i)
  assert.match(migration, /late_payment_after_cancellation/i)
  assert.doesNotMatch(migration, /p_allow_recovery/i)
  assert.match(migration, /p_require_no_payment boolean default false/i)
  assert.match(migration, /p_require_unstarted boolean default false/i)
  assert.match(migration, /p_allow_retry boolean default false/i)
  assert.match(migration, /p_refund_attempt integer/i)
  assert.match(migration, /stale_refund_attempt/i)
  assert.match(migration, /refund_failed'[\s\S]+if not p_allow_retry/i)
  assert.match(migration, /payment_creation_started/i)
  assert.match(migration, /'subtotal', v_existing\.subtotal[\s\S]+'total', v_existing\.total/i)
  assert.match(migration, /paid_order\.payment_status = 'paid'[\s\S]+paid_order\.id <> p_order_id/i)
  assert.match(migration, /v_order\.status not in \('shipped', 'delivered'\)/i)
  assert.match(migration, /checkout_idempotency_key is null[\s\S]+confirmation_customer_email_sent_at/i)
  assert.match(migration, /create or replace function public\.delete_product_safely/i)
  assert.match(migration, /create trigger products_prevent_active_order_delete/i)
  assert.match(migration, /active_order\.status = 'pending_payment'[\s\S]+active_order\.payment_status = 'unpaid'[\s\S]+active_order\.stock_reservation_status = 'none'/i)
  assert.match(migration, /drop policy if exists "Authenticated admins can update orders"[\s\S]+revoke update on table public\.orders from authenticated/i)
  assert.match(migration, /payment_create_started_at = coalesce\(payment_create_started_at, now\(\)\)/i)
  assert.doesNotMatch(migration, /set payment_create_status = 'creating',\s+payment_create_started_at = now\(\)/i)
  const refundClaim = sqlFunction(migration, 'mark_order_refund_requested')
  assert.match(refundClaim, /refund_reason = coalesce\(refund_reason, nullif\(btrim\(p_reason\), ''\)\)/i)
  assert.doesNotMatch(refundClaim, /refund_reason = coalesce\(nullif\(btrim\(p_reason\), ''\), refund_reason\)/i)
  assert.match(refundClaim, /payment_chargeback_detected/i)
  assert.match(migration, /v_order\.status <> 'pending_payment'[\s\S]+v_order\.payment_status <> 'unpaid'[\s\S]+v_order\.stock_reservation_status <> 'reserved'/i)
  const paidCancelledBackfill = migration.match(/update public\.orders\s+set status = 'refund_failed'[\s\S]*?where status = 'cancelled'[\s\S]*?;/i)?.[0]
  assert.ok(paidCancelledBackfill)
  assert.doesNotMatch(paidCancelledBackfill, /checkout_idempotency_key/i)
  const createCheckout = sqlFunction(migration, 'create_checkout_order')
  assert.ok(createCheckout.indexOf("'welcome:' || v_email") < createCheckout.indexOf("'product:' || requested.product_id"))
  assert.match(createCheckout, /product\.price is distinct from item\.price/i)
  assert.match(createCheckout, /product\.ohm_options is distinct from item\.expected_ohm_options/i)
  assert.match(createCheckout, /'status', 'catalog_changed'/i)
  const finalizePaid = sqlFunction(migration, 'finalize_paid_order')
  assert.ok(finalizePaid.indexOf("'welcome:' || v_email") < finalizePaid.indexOf('for update of product'))
  const refundRecorder = sqlFunction(migration, 'record_order_refund_state')
  assert.match(refundRecorder, /checkout_review_reason in \('multiple_payments_for_order', 'payment_chargeback_detected'\)/i)
  const latePaymentGuard = migration.indexOf("refund_reason = 'late_payment_after_cancellation'")
  const legacyStockDecrement = migration.indexOf('set stock = product.stock - requested.requested', latePaymentGuard)
  assert.ok(latePaymentGuard > -1 && legacyStockDecrement > latePaymentGuard)
})

test('product optimistic-lock migration advances updated_at on every update', async () => {
  const migration = await readFile(optimisticLockPath, 'utf8')
  assert.match(migration, /add column if not exists updated_at timestamptz not null default now\(\)/i)
  assert.match(migration, /create or replace function public\.set_updated_at\(\)/i)
  assert.match(migration, /new\.updated_at = now\(\)/i)
  assert.match(migration, /create trigger products_set_updated_at[\s\S]+before update on public\.products/i)
})

test('catalog repair migration covers every confirmed live inconsistency', async () => {
  const migration = await readFile(catalogPath, 'utf8')
  for (const productId of [
    'senois-1-156',
    'cerise-griotte-50ml-0mg-217',
    'macada-miam-110',
    'mantaro-116',
    'classico-grege-50-ml-freaks',
    'e-liquide-cafe-10ml-liquidarom',
  ]) {
    assert.match(migration, new RegExp(productId))
  }
  assert.match(migration, /delete from public\.products/i)
})
