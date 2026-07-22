begin;

-- Durable checkout state. Existing paid orders were finalized by the legacy
-- function and therefore already consumed stock, except explicit stock issues.
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists checkout_idempotency_key text;
alter table public.orders add column if not exists checkout_payload_hash text;
alter table public.orders add column if not exists checkout_url text;
alter table public.orders add column if not exists acquisition jsonb not null default '{}'::jsonb;
alter table public.orders add column if not exists payment_create_status text not null default 'not_started';
alter table public.orders add column if not exists payment_create_started_at timestamptz;
alter table public.orders add column if not exists payment_expires_at timestamptz;
alter table public.orders add column if not exists stock_reservation_status text not null default 'none';
alter table public.orders add column if not exists stock_reserved_at timestamptz;
alter table public.orders add column if not exists stock_released_at timestamptz;
alter table public.orders add column if not exists refund_id text;
alter table public.orders add column if not exists refund_status text;
alter table public.orders add column if not exists refund_attempt integer not null default 0;
alter table public.orders add column if not exists refund_amount numeric(10,2);
alter table public.orders add column if not exists refund_reason text;
alter table public.orders add column if not exists refund_error text;
alter table public.orders add column if not exists refund_requested_at timestamptz;
alter table public.orders add column if not exists refunded_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists confirmation_email_sent_at timestamptz;
alter table public.orders add column if not exists confirmation_customer_email_sent_at timestamptz;
alter table public.orders add column if not exists confirmation_admin_email_sent_at timestamptz;
alter table public.orders add column if not exists confirmation_email_last_attempt_at timestamptz;
alter table public.orders add column if not exists shipping_email_sent_at timestamptz;
alter table public.orders add column if not exists refund_email_sent_at timestamptz;
alter table public.orders add column if not exists refund_email_last_attempt_at timestamptz;

-- Acquire the orders policy/table lock before historical backfills so an old
-- admin tab cannot race a direct state mutation into the migration window.
drop policy if exists "Authenticated admins can update orders" on public.orders;
revoke update on table public.orders from authenticated;
alter table public.orders add column if not exists checkout_review_required_at timestamptz;
alter table public.orders add column if not exists checkout_review_reason text;
alter table public.orders add column if not exists checkout_last_reconciled_at timestamptz;

-- Historical paid/shipped orders may already have been notified by the legacy
-- best-effort path. Mark them delivered before enabling retries to avoid spam.
update public.orders
set confirmation_email_sent_at = coalesce(confirmation_email_sent_at, created_at, now()),
    confirmation_customer_email_sent_at = coalesce(confirmation_customer_email_sent_at, created_at, now()),
    confirmation_admin_email_sent_at = coalesce(confirmation_admin_email_sent_at, created_at, now())
where payment_status in ('paid', 'refunded')
  and checkout_idempotency_key is null
  and (
    confirmation_email_sent_at is null
    or confirmation_customer_email_sent_at is null
    or confirmation_admin_email_sent_at is null
  );

update public.orders
set shipping_email_sent_at = coalesce(created_at, now())
where shipping_email_sent_at is null
  and checkout_idempotency_key is null
  and status in ('shipped', 'delivered');

update public.orders
set refund_email_sent_at = coalesce(refunded_at, created_at, now())
where refund_email_sent_at is null
  and checkout_idempotency_key is null
  and payment_status = 'refunded';

update public.orders
set customer_email = lower(btrim(customer->>'email'))
where customer_email is null
  and nullif(btrim(customer->>'email'), '') is not null;

update public.orders
set stock_reservation_status = 'consumed'
where payment_status = 'paid'
  and status <> 'stock_issue'
  and stock_reservation_status = 'none';

-- The legacy admin could label a paid order `cancelled` without touching
-- Mollie. Freeze those ambiguous historical records for an explicit provider
-- reconciliation instead of silently treating them as fulfilled or unpaid.
update public.orders
set status = 'refund_failed',
    refund_status = 'failed',
    refund_reason = 'legacy_paid_cancelled_unreconciled',
    checkout_review_required_at = coalesce(checkout_review_required_at, now()),
    checkout_review_reason = 'legacy_paid_cancelled_unreconciled'
where status = 'cancelled'
  and payment_status = 'paid';

create unique index if not exists orders_checkout_idempotency_key_uidx
on public.orders (checkout_idempotency_key)
where checkout_idempotency_key is not null;

create unique index if not exists orders_payment_id_uidx
on public.orders (payment_id)
where payment_id is not null;

create index if not exists orders_customer_email_paid_idx
on public.orders (customer_email, created_at)
where payment_status = 'paid';

create index if not exists orders_refund_pending_idx
on public.orders (refund_status, created_at)
where refund_status is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_acquisition_is_object'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_acquisition_is_object
      check (jsonb_typeof(acquisition) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_stock_reservation_status_valid'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_stock_reservation_status_valid
      check (stock_reservation_status in ('none', 'reserved', 'consumed', 'released'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_create_status_valid'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_create_status_valid
      check (payment_create_status in ('not_started', 'creating', 'created', 'failed'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_refund_attempt_valid'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_refund_attempt_valid
      check (refund_attempt between 0 and 3);
  end if;
end
$$;

-- One active BIENVENUE reservation per normalized customer e-mail. Released
-- reservations may be reassigned to a later order; redeemed ones remain unique.
create table if not exists public.promo_redemptions (
  code text not null,
  customer_email text not null,
  order_id text not null references public.orders(id) on delete cascade,
  status text not null default 'reserved'
    check (status in ('reserved', 'redeemed', 'released')),
  reserved_at timestamptz not null default now(),
  redeemed_at timestamptz,
  released_at timestamptz,
  primary key (code, customer_email),
  unique (order_id, code)
);

alter table public.promo_redemptions enable row level security;
revoke all on table public.promo_redemptions from anon, authenticated;
grant select, insert, update, delete on table public.promo_redemptions to service_role;

-- Backfill the earliest known paid redemption so the new constraint also
-- protects customers who used BIENVENUE before this migration.
insert into public.promo_redemptions (
  code,
  customer_email,
  order_id,
  status,
  reserved_at,
  redeemed_at
)
select distinct on (o.customer_email)
  'BIENVENUE',
  o.customer_email,
  o.id,
  'redeemed',
  o.created_at,
  o.created_at
from public.orders o
where o.payment_status = 'paid'
  and o.customer_email is not null
  and upper(coalesce(o.promo->>'code', '')) = 'BIENVENUE'
order by o.customer_email, o.created_at, o.id
on conflict (code, customer_email) do nothing;

-- Atomically creates an order, reserves BIENVENUE and decrements stock. The
-- advisory lock turns concurrent retries with the same key into a single order.
create or replace function public.create_checkout_order(
  p_order_id text,
  p_idempotency_key text,
  p_payload_hash text,
  p_customer jsonb,
  p_address jsonb,
  p_shipping jsonb,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping_cost numeric,
  p_total numeric,
  p_promo jsonb,
  p_acquisition jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_existing public.orders%rowtype;
  v_email text := lower(btrim(coalesce(p_customer->>'email', '')));
  v_promo_code text := upper(coalesce(p_promo->>'code', ''));
  v_insufficient jsonb;
begin
  if p_order_id !~ '^TK-[A-F0-9]{16}$'
    or p_idempotency_key !~ '^[a-f0-9]{64}$'
    or p_payload_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid checkout identifiers';
  end if;
  if jsonb_typeof(p_customer) <> 'object'
    or jsonb_typeof(p_address) <> 'object'
    or jsonb_typeof(p_shipping) <> 'object'
    or jsonb_typeof(coalesce(p_acquisition, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 100
    or v_email = '' then
    raise exception 'Invalid checkout payload';
  end if;
  if p_subtotal < 0 or p_discount < 0 or p_shipping_cost < 0 or p_total <= 0 then
    raise exception 'Invalid checkout totals';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('checkout:' || p_idempotency_key, 0));

  select * into v_existing
  from public.orders
  where checkout_idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.checkout_payload_hash <> p_payload_hash then
      return jsonb_build_object(
        'ok', false,
        'status', 'idempotency_conflict',
        'orderId', v_existing.id
      );
    end if;
    if v_existing.payment_id is null
      and v_existing.status = 'pending_payment'
      and v_existing.payment_status = 'unpaid'
      and v_existing.stock_reservation_status = 'reserved'
      and v_existing.payment_create_status in ('not_started', 'failed')
      and v_existing.checkout_review_required_at is null
      and v_existing.checkout_review_reason is null then
      update public.orders
      set payment_create_status = 'creating',
          payment_create_started_at = coalesce(payment_create_started_at, now())
      where id = v_existing.id;
      v_existing.payment_create_status := 'creating';
      v_existing.payment_create_started_at := coalesce(v_existing.payment_create_started_at, now());
    end if;
    return jsonb_build_object(
      'ok', true,
      'status', 'existing',
      'created', false,
      'orderId', v_existing.id,
      'createdAt', v_existing.created_at,
      'paymentId', v_existing.payment_id,
      'checkoutUrl', v_existing.checkout_url,
      'paymentStatus', v_existing.payment_status,
      'orderStatus', v_existing.status,
      'paymentCreateStatus', v_existing.payment_create_status,
      'paymentCreateStartedAt', v_existing.payment_create_started_at,
      'checkoutReviewRequiredAt', v_existing.checkout_review_required_at,
      'checkoutReviewReason', v_existing.checkout_review_reason,
      'stockReservationStatus', v_existing.stock_reservation_status,
      'subtotal', v_existing.subtotal,
      'discount', v_existing.discount,
      'shippingCost', v_existing.shipping_cost,
      'total', v_existing.total
    );
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      name text,
      image text,
      price numeric,
      qty integer,
      variant jsonb,
      line_total numeric,
      expected_brand text,
      expected_category text,
      expected_volume text,
      expected_specs jsonb,
      expected_nicotine jsonb,
      expected_flavors jsonb,
      expected_colors jsonb,
      expected_ohm_options jsonb
    )
    where nullif(btrim(item.product_id), '') is null
      or nullif(btrim(item.name), '') is null
      or item.qty < 1
      or item.qty > 100
      or item.price < 0
      or item.line_total < 0
      or jsonb_typeof(coalesce(item.variant, '{}'::jsonb)) <> 'object'
      or nullif(btrim(item.expected_brand), '') is null
      or nullif(btrim(item.expected_category), '') is null
      or jsonb_typeof(coalesce(item.expected_specs, 'null'::jsonb)) <> 'object'
      or jsonb_typeof(coalesce(item.expected_nicotine, 'null'::jsonb)) <> 'array'
      or jsonb_typeof(coalesce(item.expected_flavors, 'null'::jsonb)) <> 'array'
      or jsonb_typeof(coalesce(item.expected_colors, 'null'::jsonb)) <> 'array'
      or jsonb_typeof(coalesce(item.expected_ohm_options, 'null'::jsonb)) <> 'array'
  ) then
    raise exception 'Invalid checkout items';
  end if;

  -- Keep the global lock order identical to finalize_paid_order: customer
  -- promotion lock first, then product advisory/row locks. This avoids a
  -- BIENVENUE checkout deadlocking a concurrent legacy payment finalization.
  if v_promo_code = 'BIENVENUE' then
    perform pg_advisory_xact_lock(hashtextextended('welcome:' || v_email, 0));

    if exists (
      select 1
      from public.orders paid_order
      where paid_order.customer_email = v_email
        and paid_order.payment_status = 'paid'
    ) or exists (
      select 1
      from public.promo_redemptions redemption
      where redemption.code = 'BIENVENUE'
        and redemption.customer_email = v_email
        and redemption.status in ('reserved', 'redeemed')
    ) then
      return jsonb_build_object('ok', false, 'status', 'welcome_unavailable');
    end if;
  end if;

  -- Shared product locks serialize checkout reservation with authenticated
  -- catalog deletion even before either path takes the product row lock.
  perform pg_advisory_xact_lock(hashtextextended('product:' || requested.product_id, 0))
  from (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(product_id text)
  ) requested
  order by requested.product_id;

  -- Lock every referenced product in a deterministic order.
  perform product.id
  from public.products product
  join (
    select item.product_id, sum(item.qty)::integer as requested
    from jsonb_to_recordset(p_items) as item(product_id text, qty integer)
    group by item.product_id
  ) requested on requested.product_id = product.id
  order by product.id
  for update of product;

  -- The API prices from a server-side catalog read, then this transaction
  -- revalidates every commercial field under the product row locks. A
  -- concurrent admin price/category/options edit therefore retries checkout
  -- instead of persisting a stale discount or an unavailable variant.
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      price numeric,
      expected_brand text,
      expected_category text,
      expected_volume text,
      expected_specs jsonb,
      expected_nicotine jsonb,
      expected_flavors jsonb,
      expected_colors jsonb,
      expected_ohm_options jsonb
    )
    left join public.products product on product.id = item.product_id
    where product.id is null
      or product.price is distinct from item.price
      or product.brand is distinct from item.expected_brand
      or product.category is distinct from item.expected_category
      or product.volume is distinct from item.expected_volume
      or product.specs is distinct from item.expected_specs
      or product.nicotine is distinct from item.expected_nicotine
      or product.flavors is distinct from item.expected_flavors
      or product.colors is distinct from item.expected_colors
      or product.ohm_options is distinct from item.expected_ohm_options
  ) then
    return jsonb_build_object('ok', false, 'status', 'catalog_changed');
  end if;

  with requested as (
    select
      item.product_id,
      min(item.name) as name,
      sum(item.qty)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, name text, qty integer)
    group by item.product_id
  )
  select jsonb_agg(jsonb_build_object(
    'productId', requested.product_id,
    'name', requested.name,
    'requested', requested.quantity,
    'available', coalesce(product.stock, 0)
  ))
  into v_insufficient
  from requested
  left join public.products product on product.id = requested.product_id
  where product.id is null or coalesce(product.stock, 0) < requested.quantity;

  if v_insufficient is not null then
    return jsonb_build_object(
      'ok', false,
      'status', 'insufficient_stock',
      'items', v_insufficient
    );
  end if;

  insert into public.orders (
    id,
    status,
    payment_status,
    payment_id,
    customer,
    customer_email,
    address,
    shipping,
    subtotal,
    discount,
    shipping_cost,
    total,
    promo,
    acquisition,
    checkout_idempotency_key,
    checkout_payload_hash,
    payment_create_status,
    payment_create_started_at,
    stock_reservation_status,
    stock_reserved_at
  ) values (
    p_order_id,
    'pending_payment',
    'unpaid',
    null,
    p_customer,
    v_email,
    p_address,
    p_shipping,
    p_subtotal,
    p_discount,
    p_shipping_cost,
    p_total,
    p_promo,
    coalesce(p_acquisition, '{}'::jsonb),
    p_idempotency_key,
    p_payload_hash,
    'creating',
    now(),
    'reserved',
    now()
  );

  insert into public.order_items (
    order_id,
    product_id,
    name,
    image,
    price,
    qty,
    variant,
    line_total
  )
  select
    p_order_id,
    item.product_id,
    item.name,
    item.image,
    item.price,
    item.qty,
    coalesce(item.variant, '{}'::jsonb),
    item.line_total
  from jsonb_to_recordset(p_items) as item(
    product_id text,
    name text,
    image text,
    price numeric,
    qty integer,
    variant jsonb,
    line_total numeric
  );

  with requested as (
    select item.product_id, sum(item.qty)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, qty integer)
    group by item.product_id
  )
  update public.products product
  set stock = product.stock - requested.quantity
  from requested
  where product.id = requested.product_id;

  if v_promo_code = 'BIENVENUE' then
    insert into public.promo_redemptions (
      code,
      customer_email,
      order_id,
      status,
      reserved_at,
      redeemed_at,
      released_at
    ) values (
      'BIENVENUE',
      v_email,
      p_order_id,
      'reserved',
      now(),
      null,
      null
    )
    on conflict (code, customer_email) do update
    set order_id = excluded.order_id,
        status = 'reserved',
        reserved_at = excluded.reserved_at,
        redeemed_at = null,
        released_at = null
    where public.promo_redemptions.status = 'released';

    if not found then
      raise exception 'BIENVENUE reservation conflict';
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', 'created',
    'created', true,
    'orderId', p_order_id,
    'createdAt', now(),
    'paymentStatus', 'unpaid',
    'orderStatus', 'pending_payment',
    'paymentCreateStatus', 'creating',
    'paymentCreateStartedAt', now(),
    'stockReservationStatus', 'reserved',
    'subtotal', p_subtotal,
    'discount', p_discount,
    'shippingCost', p_shipping_cost,
    'total', p_total
  );
end;
$$;

revoke all on function public.create_checkout_order(
  text, text, text, jsonb, jsonb, jsonb, numeric, numeric, numeric, numeric, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.create_checkout_order(
  text, text, text, jsonb, jsonb, jsonb, numeric, numeric, numeric, numeric, jsonb, jsonb, jsonb
) to service_role;

-- Product deletion is intentionally separated from the broad admin write
-- policy. It shares the checkout advisory lock and refuses any reservation or
-- non-terminal consumed stock that may still need to be restored.
create or replace function public.prevent_active_order_product_delete()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if exists (
    select 1
    from public.order_items item
    join public.orders active_order on active_order.id = item.order_id
    where item.product_id = old.id
      and (
        (
          active_order.stock_reservation_status in ('reserved', 'consumed')
          and active_order.status not in ('shipped', 'delivered', 'refunded')
        )
        or (
          active_order.status = 'pending_payment'
          and active_order.payment_status = 'unpaid'
          and active_order.stock_reservation_status = 'none'
        )
      )
  ) then
    raise exception 'PRODUCT_HAS_ACTIVE_ORDERS';
  end if;
  return old;
end;
$$;

drop trigger if exists products_prevent_active_order_delete on public.products;
create trigger products_prevent_active_order_delete
before delete on public.products
for each row execute function public.prevent_active_order_product_delete();

revoke all on function public.prevent_active_order_product_delete()
from public, anon, authenticated;

create or replace function public.delete_product_safely(p_product_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_product public.products%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin authorization required' using errcode = '42501';
  end if;
  if nullif(btrim(p_product_id), '') is null then
    raise exception 'Invalid product ID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('product:' || p_product_id, 0));
  select * into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'not_found');
  end if;
  if exists (
    select 1
    from public.order_items item
    join public.orders active_order on active_order.id = item.order_id
    where item.product_id = p_product_id
      and (
        (
          active_order.stock_reservation_status in ('reserved', 'consumed')
          and active_order.status not in ('shipped', 'delivered', 'refunded')
        )
        or (
          active_order.status = 'pending_payment'
          and active_order.payment_status = 'unpaid'
          and active_order.stock_reservation_status = 'none'
        )
      )
  ) then
    return jsonb_build_object('ok', false, 'status', 'active_order');
  end if;

  delete from public.products where id = p_product_id;
  return jsonb_build_object('ok', true, 'status', 'deleted');
end;
$$;

revoke all on function public.delete_product_safely(text) from public, anon, authenticated;
grant execute on function public.delete_product_safely(text) to authenticated;

drop policy if exists "Authenticated admins can write products" on public.products;
drop policy if exists "Authenticated admins can insert products" on public.products;
create policy "Authenticated admins can insert products"
on public.products for insert to authenticated
with check ((select public.is_admin()));
drop policy if exists "Authenticated admins can update products" on public.products;
create policy "Authenticated admins can update products"
on public.products for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Links the external payment without ever replacing a different payment ID.
create or replace function public.link_order_payment(
  p_order_id text,
  p_payment_id text,
  p_checkout_url text default null,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_payment_id !~ '^tr_[A-Za-z0-9]+$' then
    raise exception 'Invalid Mollie payment ID';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected') then
    return jsonb_build_object('ok', false, 'status', 'review_required');
  end if;
  if v_order.payment_id is not null and v_order.payment_id <> p_payment_id then
    return jsonb_build_object('ok', false, 'status', 'payment_mismatch');
  end if;
  if v_order.payment_id is null
    and (
      v_order.status <> 'pending_payment'
      or v_order.payment_status <> 'unpaid'
      or v_order.stock_reservation_status <> 'reserved'
    ) then
    return jsonb_build_object('ok', false, 'status', 'order_not_payable');
  end if;

  update public.orders
  set payment_id = p_payment_id,
      checkout_url = coalesce(nullif(p_checkout_url, ''), checkout_url),
      payment_expires_at = coalesce(p_expires_at, payment_expires_at),
      payment_create_status = 'created',
      checkout_review_required_at = null,
      checkout_review_reason = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'linked');
end;
$$;

revoke all on function public.link_order_payment(text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.link_order_payment(text, text, text, timestamptz)
to service_role;

-- A paid Mollie webhook can arrive after an unlinked order was safely canceled.
-- This recovery path is deliberately separate from normal linking and accepts
-- only the exact terminal state produced by release_order_resources. The API
-- validates Mollie's ID, EUR currency and amount before invoking it.
create or replace function public.record_late_paid_order(
  p_order_id text,
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_payment_id !~ '^tr_[A-Za-z0-9]+$' then
    raise exception 'Invalid Mollie payment ID';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected') then
    return jsonb_build_object('ok', false, 'status', 'review_required');
  end if;
  if v_order.payment_id is not null and v_order.payment_id <> p_payment_id then
    return jsonb_build_object('ok', false, 'status', 'payment_mismatch');
  end if;
  if v_order.payment_id = p_payment_id
    and v_order.payment_status = 'paid'
    and v_order.status = 'stock_issue'
    and v_order.refund_reason = 'late_payment_after_cancellation' then
    return jsonb_build_object('ok', true, 'status', 'already_recorded');
  end if;
  if v_order.payment_id is null
    and v_order.status = 'pending_payment'
    and v_order.payment_status = 'unpaid'
    and v_order.stock_reservation_status = 'none' then
    update public.orders
    set payment_id = p_payment_id,
        payment_create_status = 'created',
        checkout_review_required_at = null,
        checkout_review_reason = null
    where id = p_order_id;
    return jsonb_build_object('ok', true, 'status', 'legacy_linked');
  end if;
  if v_order.payment_id is null
    and v_order.status = 'cancelled'
    and v_order.payment_status in ('unpaid', 'failed')
    and v_order.stock_reservation_status = 'none' then
    update public.orders
    set payment_id = p_payment_id,
        payment_status = 'paid',
        payment_create_status = 'created',
        status = 'stock_issue',
        refund_reason = 'late_payment_after_cancellation',
        checkout_review_required_at = null,
        checkout_review_reason = null
    where id = p_order_id;
    return jsonb_build_object('ok', true, 'status', 'stock_issue');
  end if;
  if v_order.payment_id is not null
    or v_order.status <> 'cancelled'
    or v_order.payment_status <> 'failed'
    or v_order.stock_reservation_status <> 'released' then
    return jsonb_build_object('ok', false, 'status', 'not_late_cancelled_payment');
  end if;

  update public.orders
  set payment_id = p_payment_id,
      payment_status = 'paid',
      payment_create_status = 'created',
      status = 'stock_issue',
      refund_reason = 'late_payment_after_cancellation',
      checkout_review_required_at = null,
      checkout_review_reason = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'stock_issue');
end;
$$;

revoke all on function public.record_late_paid_order(text, text)
from public, anon, authenticated;
grant execute on function public.record_late_paid_order(text, text)
to service_role;

-- Releases stock and a pending BIENVENUE claim only after Mollie has confirmed
-- that no payment can settle (or for an order that never got a payment ID).
drop function if exists public.release_order_resources(text, text);
drop function if exists public.release_order_resources(text, text, boolean);
create or replace function public.release_order_resources(
  p_order_id text,
  p_reason text default null,
  p_require_no_payment boolean default false,
  p_require_unstarted boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected') then
    return jsonb_build_object('ok', false, 'status', 'review_required');
  end if;
  if p_require_no_payment and v_order.payment_id is not null then
    return jsonb_build_object('ok', false, 'status', 'payment_exists');
  end if;
  if p_require_unstarted and (
    v_order.payment_create_status <> 'not_started'
    or v_order.payment_create_started_at is not null
  ) then
    return jsonb_build_object('ok', false, 'status', 'payment_creation_started');
  end if;
  if p_require_no_payment
    and v_order.payment_create_status = 'creating'
    and v_order.payment_create_started_at is not null
    and v_order.payment_create_started_at > now() - interval '10 minutes' then
    return jsonb_build_object('ok', false, 'status', 'payment_creation_active');
  end if;
  if v_order.payment_status in ('paid', 'refunded') then
    return jsonb_build_object('ok', false, 'status', 'paid_order');
  end if;

  if v_order.stock_reservation_status = 'reserved' then
    perform product.id
    from public.products product
    join (
      select item.product_id, sum(item.qty)::integer as quantity
      from public.order_items item
      where item.order_id = p_order_id and item.product_id is not null
      group by item.product_id
    ) requested on requested.product_id = product.id
    order by product.id
    for update of product;

    with requested as (
      select item.product_id, sum(item.qty)::integer as quantity
      from public.order_items item
      where item.order_id = p_order_id and item.product_id is not null
      group by item.product_id
    )
    update public.products product
    set stock = product.stock + requested.quantity
    from requested
    where product.id = requested.product_id;
  end if;

  update public.promo_redemptions
  set status = 'released', released_at = now()
  where order_id = p_order_id and status = 'reserved';

  update public.orders
  set stock_reservation_status = case
        when stock_reservation_status = 'reserved' then 'released'
        else stock_reservation_status
      end,
      stock_released_at = case
        when stock_reservation_status = 'reserved' then now()
        else stock_released_at
      end,
      payment_status = 'failed',
      status = 'cancelled',
      payment_create_status = case
        when payment_create_status = 'created' then payment_create_status
        else 'failed'
      end,
      refund_reason = coalesce(refund_reason, nullif(btrim(p_reason), '')),
      cancelled_at = coalesce(cancelled_at, now()),
      checkout_review_required_at = null,
      checkout_review_reason = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'cancelled');
end;
$$;

revoke all on function public.release_order_resources(text, text, boolean, boolean)
from public, anon, authenticated;
grant execute on function public.release_order_resources(text, text, boolean, boolean)
to service_role;

-- Finalization remains compatible with legacy unpaid orders while new orders
-- simply consume the stock reservation made during checkout creation.
create or replace function public.finalize_paid_order(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_email text;
  v_product record;
  v_insufficient jsonb;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'unknown', 'reason', 'order_not_found');
  end if;
  if v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected') then
    return jsonb_build_object('ok', false, 'status', 'review_required', 'reason', 'multiple_payments_for_order');
  end if;
  if v_order.payment_status = 'refunded' then
    return jsonb_build_object('ok', true, 'status', 'already_refunded');
  end if;
  if v_order.payment_status = 'paid' then
    if v_order.status = 'stock_issue' then
      return jsonb_build_object('ok', false, 'status', 'already_stock_issue', 'reason', v_order.refund_reason);
    end if;
    return jsonb_build_object('ok', true, 'status', 'already_paid');
  end if;

  -- A late Mollie settlement must never resurrect an order whose reservation
  -- was released. Mark it paid for accounting, but route it to the automatic
  -- full-refund workflow without touching stock a second time.
  if v_order.status = 'cancelled'
    or v_order.payment_status = 'failed'
    or v_order.stock_reservation_status = 'released' then
    update public.orders
    set payment_status = 'paid',
        status = 'stock_issue',
        refund_reason = 'late_payment_after_cancellation'
    where id = p_order_id;
    return jsonb_build_object(
      'ok', false,
      'status', 'stock_issue',
      'reason', 'late_payment_after_cancellation'
    );
  end if;

  v_email := coalesce(v_order.customer_email, lower(btrim(v_order.customer->>'email')));
  if v_email <> '' then
    -- Every paid order participates in the same customer lock. If an ordinary
    -- first order wins this race, a concurrent BIENVENUE checkout is rejected;
    -- if the promo reservation wins, that attempt remains the first order.
    perform pg_advisory_xact_lock(hashtextextended('welcome:' || v_email, 0));
  end if;

  if upper(coalesce(v_order.promo->>'code', '')) = 'BIENVENUE' then
    -- A prior reservation never overrides the absolute first-paid-order rule.
    -- The advisory customer lock makes this check deterministic under races.
    if exists (
      select 1
      from public.orders paid_order
      where paid_order.customer_email = v_email
        and paid_order.payment_status = 'paid'
        and paid_order.id <> p_order_id
    ) then
      update public.orders
      set payment_status = 'paid',
          status = 'stock_issue',
          refund_reason = 'welcome_redemption_conflict'
      where id = p_order_id;
      return jsonb_build_object(
        'ok', false,
        'status', 'stock_issue',
        'reason', 'welcome_redemption_conflict'
      );
    end if;

    insert into public.promo_redemptions (
      code, customer_email, order_id, status, reserved_at, redeemed_at, released_at
    ) values (
      'BIENVENUE', v_email, p_order_id, 'reserved', now(), null, null
    )
    on conflict (code, customer_email) do update
    set order_id = excluded.order_id,
        status = 'reserved',
        reserved_at = excluded.reserved_at,
        redeemed_at = null,
        released_at = null
    where public.promo_redemptions.order_id = p_order_id
       or public.promo_redemptions.status = 'released';

    if not found then
      update public.orders
      set payment_status = 'paid',
          status = 'stock_issue',
          refund_reason = 'welcome_redemption_conflict'
      where id = p_order_id;
      return jsonb_build_object(
        'ok', false,
        'status', 'stock_issue',
        'reason', 'welcome_redemption_conflict'
      );
    end if;
  end if;

  if v_order.stock_reservation_status not in ('reserved', 'consumed') then
    for v_product in
      with qty_by_product as (
        select product_id, sum(qty)::integer as requested
        from public.order_items
        where order_id = p_order_id and product_id is not null
        group by product_id
      )
      select product.id
      from public.products product
      join qty_by_product requested on requested.product_id = product.id
      order by product.id
      for update of product
    loop
      null;
    end loop;

    with qty_by_product as (
      select
        item.product_id,
        min(item.name) as name,
        sum(item.qty)::integer as requested
      from public.order_items item
      where item.order_id = p_order_id and item.product_id is not null
      group by item.product_id
    )
    select jsonb_agg(jsonb_build_object(
      'productId', requested.product_id,
      'name', requested.name,
      'requested', requested.requested,
      'available', coalesce(product.stock, 0)
    ))
    into v_insufficient
    from qty_by_product requested
    left join public.products product on product.id = requested.product_id
    where product.id is null or coalesce(product.stock, 0) < requested.requested;

    if v_insufficient is not null then
      update public.orders
      set payment_status = 'paid',
          status = 'stock_issue',
          refund_reason = 'insufficient_stock_after_payment'
      where id = p_order_id;
      return jsonb_build_object(
        'ok', false,
        'status', 'stock_issue',
        'reason', 'insufficient_stock_after_payment',
        'items', v_insufficient
      );
    end if;

    with qty_by_product as (
      select product_id, sum(qty)::integer as requested
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    )
    update public.products product
    set stock = product.stock - requested.requested
    from qty_by_product requested
    where product.id = requested.product_id;
  end if;

  update public.promo_redemptions
  set status = 'redeemed', redeemed_at = now(), released_at = null
  where order_id = p_order_id and status = 'reserved';

  update public.orders
  set payment_status = 'paid',
      status = 'processing',
      stock_reservation_status = 'consumed'
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'processing');
end;
$$;

revoke all on function public.finalize_paid_order(text) from public, anon, authenticated;
grant execute on function public.finalize_paid_order(text) to service_role;

-- Claims a full-refund workflow before the external API call. Replays and
-- retries return the existing state instead of creating a second workflow.
drop function if exists public.mark_order_refund_requested(text, text);
drop function if exists public.mark_order_refund_requested(text, text, boolean);
create or replace function public.mark_order_refund_requested(
  p_order_id text,
  p_reason text default null,
  p_amount numeric default null,
  p_allow_retry boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_attempt integer;
  v_refund_id text;
  v_refund_amount numeric;
  v_superseded boolean := false;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected') then
    return jsonb_build_object('ok', false, 'status', 'review_required');
  end if;
  if v_order.payment_status = 'refunded' then
    return jsonb_build_object(
      'ok', true,
      'status', 'already_refunded',
      'refundId', v_order.refund_id
    );
  end if;
  if v_order.payment_status <> 'paid' or v_order.payment_id is null then
    return jsonb_build_object('ok', false, 'status', 'not_paid');
  end if;
  if v_order.status in ('shipped', 'delivered') then
    return jsonb_build_object('ok', false, 'status', 'already_fulfilled');
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > v_order.total then
    return jsonb_build_object('ok', false, 'status', 'invalid_refund_amount');
  end if;

  v_attempt := greatest(coalesce(v_order.refund_attempt, 0), 0);
  v_refund_id := v_order.refund_id;
  v_refund_amount := v_order.refund_amount;
  if p_allow_retry
    and v_order.refund_status = 'requested'
    and v_refund_id is null
    and v_order.checkout_review_reason = 'refund_intent_exceeds_remaining'
    and v_refund_amount is distinct from p_amount then
    if v_attempt >= 3 then
      return jsonb_build_object('ok', false, 'status', 'refund_retry_exhausted');
    end if;
    v_attempt := greatest(v_attempt, 0) + 1;
    v_refund_amount := p_amount;
    v_superseded := true;
  elsif v_order.refund_status in ('failed', 'canceled') then
    if not p_allow_retry then
      return jsonb_build_object(
        'ok', false,
        'status', 'refund_failed',
        'refundId', v_refund_id,
        'refundAttempt', v_attempt,
        'refundAmount', v_refund_amount
      );
    end if;
    if v_attempt >= 3 then
      return jsonb_build_object('ok', false, 'status', 'refund_retry_exhausted');
    end if;
    v_attempt := v_attempt + 1;
    v_refund_id := null;
    v_refund_amount := p_amount;
  elsif v_attempt = 0 then
    v_attempt := 1;
    v_refund_amount := p_amount;
  elsif v_refund_amount is null then
    v_refund_amount := p_amount;
  end if;

  update public.orders
  set status = 'refund_pending',
      refund_id = v_refund_id,
      refund_attempt = v_attempt,
      refund_amount = v_refund_amount,
      refund_status = case
        when refund_status in ('queued', 'pending', 'processing') then refund_status
        else 'requested'
      end,
      refund_reason = coalesce(refund_reason, nullif(btrim(p_reason), '')),
      refund_error = null,
      refund_requested_at = now(),
      checkout_review_required_at = case when v_superseded then null else checkout_review_required_at end,
      checkout_review_reason = case when v_superseded then null else checkout_review_reason end
  where id = p_order_id;

  return jsonb_build_object(
    'ok', true,
    'status', case when v_refund_id is null then 'requested' else 'existing_refund' end,
    'refundId', v_refund_id,
    'refundAttempt', v_attempt,
    'refundAmount', v_refund_amount
  );
end;
$$;

revoke all on function public.mark_order_refund_requested(text, text, numeric, boolean)
from public, anon, authenticated;
grant execute on function public.mark_order_refund_requested(text, text, numeric, boolean)
to service_role;

-- Records Mollie's refund state. Stock is restored exactly once, and only when
-- Mollie confirms that the full refund reached `refunded`.
drop function if exists public.record_order_refund_state(text, text, text, text);
create or replace function public.record_order_refund_state(
  p_order_id text,
  p_refund_id text,
  p_refund_status text,
  p_refund_attempt integer,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_newly_refunded boolean := false;
begin
  if p_refund_status not in ('requested', 'queued', 'pending', 'processing', 'refunded', 'failed', 'canceled') then
    raise exception 'Invalid refund status';
  end if;
  if p_refund_id is not null and p_refund_id !~ '^re_[A-Za-z0-9]+$' then
    raise exception 'Invalid Mollie refund ID';
  end if;
  if p_refund_attempt < 1 or p_refund_attempt > 3 then
    raise exception 'Invalid refund attempt';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.refund_attempt <> p_refund_attempt then
    return jsonb_build_object('ok', false, 'status', 'stale_refund_attempt');
  end if;
  if v_order.refund_id is not null
    and p_refund_id is not null
    and v_order.refund_id <> p_refund_id then
    return jsonb_build_object('ok', false, 'status', 'refund_mismatch');
  end if;

  if p_refund_status = 'refunded' and v_order.payment_status <> 'refunded' then
    v_newly_refunded := true;

    if v_order.stock_reservation_status in ('reserved', 'consumed')
      and v_order.status not in ('shipped', 'delivered') then
      perform product.id
      from public.products product
      join (
        select item.product_id, sum(item.qty)::integer as quantity
        from public.order_items item
        where item.order_id = p_order_id and item.product_id is not null
        group by item.product_id
      ) requested on requested.product_id = product.id
      order by product.id
      for update of product;

      with requested as (
        select item.product_id, sum(item.qty)::integer as quantity
        from public.order_items item
        where item.order_id = p_order_id and item.product_id is not null
        group by item.product_id
      )
      update public.products product
      set stock = product.stock + requested.quantity
      from requested
      where product.id = requested.product_id;
    end if;

    update public.promo_redemptions
    set status = 'released', released_at = now()
    where order_id = p_order_id and status in ('reserved', 'redeemed');

    update public.orders
    set refund_id = coalesce(p_refund_id, refund_id),
        refund_status = 'refunded',
        refund_error = null,
        status = 'refunded',
        payment_status = 'refunded',
        stock_reservation_status = case
          when stock_reservation_status in ('reserved', 'consumed')
            and v_order.status not in ('shipped', 'delivered') then 'released'
          else stock_reservation_status
        end,
        stock_released_at = case
          when stock_reservation_status in ('reserved', 'consumed')
            and v_order.status not in ('shipped', 'delivered') then now()
          else stock_released_at
        end,
        refunded_at = coalesce(refunded_at, now()),
        checkout_review_required_at = case
          when v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected')
            then v_order.checkout_review_required_at
          else null
        end,
        checkout_review_reason = case
          when v_order.checkout_review_reason in ('multiple_payments_for_order', 'payment_chargeback_detected')
            then v_order.checkout_review_reason
          else null
        end
    where id = p_order_id;
  elsif p_refund_status in ('failed', 'canceled') then
    update public.orders
    set refund_id = coalesce(p_refund_id, refund_id),
        refund_status = p_refund_status,
        refund_error = nullif(left(coalesce(p_error, ''), 1000), ''),
        status = 'refund_failed'
    where id = p_order_id
      and payment_status <> 'refunded';
  else
    update public.orders
    set refund_id = coalesce(p_refund_id, refund_id),
        refund_status = p_refund_status,
        refund_error = nullif(left(coalesce(p_error, ''), 1000), ''),
        status = 'refund_pending'
    where id = p_order_id
      and payment_status <> 'refunded';
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', p_refund_status,
    'newlyRefunded', v_newly_refunded
  );
end;
$$;

revoke all on function public.record_order_refund_state(text, text, text, integer, text)
from public, anon, authenticated;
grant execute on function public.record_order_refund_state(text, text, text, integer, text)
to service_role;

-- Reconciles a full refund completed directly in Mollie (for example after an
-- operator followed the manual fallback). The service caller must first prove
-- the sum of provider refunds reached the exact order total. Resetting the
-- local failed ID is safe under this row lock and delegates the once-only stock
-- restoration to the canonical state recorder above.
create or replace function public.reconcile_external_order_refund(
  p_order_id text,
  p_refund_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_attempt integer;
begin
  if p_refund_id is not null and p_refund_id !~ '^re_[A-Za-z0-9]+$' then
    raise exception 'Invalid Mollie refund ID';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.payment_status = 'refunded' then
    return jsonb_build_object('ok', true, 'status', 'already_refunded');
  end if;
  if v_order.payment_status <> 'paid' or v_order.payment_id is null then
    return jsonb_build_object('ok', false, 'status', 'not_paid');
  end if;

  v_attempt := greatest(coalesce(v_order.refund_attempt, 0), 1);
  update public.orders
  set refund_id = null,
      refund_attempt = v_attempt,
      refund_status = 'requested',
      refund_reason = coalesce(refund_reason, 'external_mollie_refund'),
      refund_error = null
  where id = p_order_id;

  return public.record_order_refund_state(
    p_order_id,
    p_refund_id,
    'refunded',
    v_attempt,
    null
  );
end;
$$;

revoke all on function public.reconcile_external_order_refund(text, text)
from public, anon, authenticated;
grant execute on function public.reconcile_external_order_refund(text, text)
to service_role;

-- Manual service-role recovery only. A bounded global Mollie page is not proof
-- that an older duplicate no longer exists. The operator must first reconcile
-- every known Mollie payment ID; chargeback reviews are never cleared here.
create or replace function public.clear_multiple_payment_review(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'order_not_found');
  end if;
  if v_order.checkout_review_reason is distinct from 'multiple_payments_for_order' then
    return jsonb_build_object('ok', false, 'status', 'not_multiple_payment_review');
  end if;

  update public.orders
  set checkout_review_required_at = null,
      checkout_review_reason = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'cleared');
end;
$$;

revoke all on function public.clear_multiple_payment_review(text)
from public, anon, authenticated;
grant execute on function public.clear_multiple_payment_review(text)
to service_role;

-- Order state transitions are server-only. Admin reads remain covered by the
-- SELECT policy, while cancellation, fulfillment and refunds go through the
-- authenticated API endpoints and their locked service-role RPCs.
drop policy if exists "Authenticated admins can update orders" on public.orders;
revoke update on table public.orders from authenticated;

commit;
