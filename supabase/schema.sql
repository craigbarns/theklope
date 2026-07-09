-- THEKLOPE Supabase schema
-- Run this file in Supabase SQL Editor before connecting the production app.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'eliquide',
  brand text not null default 'THEKLOPE',
  type text not null default 'Produit',
  volume text,
  ohm text,
  price numeric(10,2) not null default 0,
  old_price numeric(10,2),
  rating numeric(3,2) not null default 4.70,
  reviews integer not null default 0,
  stock integer not null default 0,
  badge text,
  nicotine jsonb not null default '[]'::jsonb,
  flavors jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  short text not null default '',
  long text not null default '',
  specs jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  image text not null default '/products/product-placeholder.svg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration : volume (10ml/50ml, pour les remises auto) + ohm (résistances).
alter table public.products add column if not exists volume text;
alter table public.products add column if not exists ohm text;

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'pending_payment',
  payment_status text not null default 'unpaid',
  payment_id text,
  customer jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  promo jsonb
);

-- Pour les bases déjà créées (migration) : ajoute la colonne si absente.
alter table public.orders add column if not exists payment_id text;
create index if not exists orders_payment_id_idx on public.orders (payment_id);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  name text not null,
  image text,
  price numeric(10,2) not null default 0,
  qty integer not null default 1,
  variant jsonb not null default '{}'::jsonb,
  line_total numeric(10,2) not null default 0
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- SÉCURITÉ : l'ancienne RPC `submit_order` (exécutable par `anon`) permettait à
-- n'importe qui d'insérer des commandes « payées » sans paiement réel. Elle est
-- supprimée. Les commandes sont désormais créées UNIQUEMENT côté serveur :
--   - api/create-payment insère la commande « en attente » (service role)
--   - api/mollie-webhook la passe à « payée » après preuve de paiement Mollie
-- Le service role contourne la RLS, donc aucune policy d'insertion publique.
drop function if exists public.submit_order(jsonb, jsonb);

-- Finalise une commande payée de façon atomique :
--   - verrouille la commande pendant la finalisation ;
--   - verrouille les lignes produits avant le contrôle de stock ;
--   - additionne les quantités par produit pour gérer plusieurs variantes ;
--   - empêche les stocks négatifs ;
--   - marque un incident stock si le paiement est confirmé mais le stock a bougé.
create or replace function public.finalize_paid_order(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_product record;
  v_insufficient jsonb;
begin
  select id, payment_status
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'status', 'unknown', 'reason', 'order_not_found');
  end if;

  if v_order.payment_status = 'paid' then
    return jsonb_build_object('ok', true, 'status', 'already_paid');
  end if;

  -- Sérialise les finalisations concurrentes sur les mêmes produits. Sans ce
  -- verrou, deux paiements simultanés pourraient lire le même stock disponible
  -- puis le décrémenter deux fois.
  for v_product in
    with qty_by_product as (
      select product_id, sum(qty)::integer as requested
      from public.order_items
      where order_id = p_order_id
        and product_id is not null
      group by product_id
    )
    select p.id
    from public.products p
    join qty_by_product q on q.product_id = p.id
    order by p.id
    for update of p
  loop
    null;
  end loop;

  with qty_by_product as (
    select
      oi.product_id,
      min(oi.name) as name,
      sum(oi.qty)::integer as requested
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.product_id is not null
    group by oi.product_id
  )
  select jsonb_agg(
    jsonb_build_object(
      'productId', q.product_id,
      'name', q.name,
      'requested', q.requested,
      'available', coalesce(p.stock, 0)
    )
  )
  into v_insufficient
  from qty_by_product q
  left join public.products p on p.id = q.product_id
  where p.id is null or coalesce(p.stock, 0) < q.requested;

  if v_insufficient is not null then
    update public.orders
    set payment_status = 'paid',
        status = 'stock_issue'
    where id = p_order_id;

    return jsonb_build_object('ok', false, 'status', 'stock_issue', 'items', v_insufficient);
  end if;

  with qty_by_product as (
    select product_id, sum(qty)::integer as requested
    from public.order_items
    where order_id = p_order_id
      and product_id is not null
    group by product_id
  )
  update public.products p
  set stock = p.stock - q.requested
  from qty_by_product q
  where p.id = q.product_id;

  update public.orders
  set payment_status = 'paid',
      status = 'processing'
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'status', 'processing');
end;
$$;

revoke all on function public.finalize_paid_order(text) from public;
revoke all on function public.finalize_paid_order(text) from anon;
revoke all on function public.finalize_paid_order(text) from authenticated;
grant execute on function public.finalize_paid_order(text) to service_role;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
using (true);

drop policy if exists "Authenticated admins can write products" on public.products;
create policy "Authenticated admins can write products"
on public.products for all
to authenticated
using (true)
with check (true);

-- Plus aucune insertion de commande par anon/authenticated : seul le service role
-- (côté serveur) écrit dans orders / order_items. On retire les anciennes policies.
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Anyone can create order items" on public.order_items;

drop policy if exists "Authenticated admins can read orders" on public.orders;
create policy "Authenticated admins can read orders"
on public.orders for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can update orders" on public.orders;
create policy "Authenticated admins can update orders"
on public.orders for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can read order items" on public.order_items;
create policy "Authenticated admins can read order items"
on public.order_items for select
to authenticated
using (true);

-- =========================================================================
-- Newsletter & Contact — alimentées côté serveur (service role) par
-- api/newsletter.js et api/contact.js.
-- =========================================================================
create table if not exists public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- Aucune policy publique : seul le service role (serveur) insère. Les admins
-- authentifiés peuvent lire pour consultation dans le back-office.
drop policy if exists "Authenticated admins can read subscribers" on public.newsletter_subscribers;
create policy "Authenticated admins can read subscribers"
on public.newsletter_subscribers for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can read messages" on public.contact_messages;
create policy "Authenticated admins can read messages"
on public.contact_messages for select
to authenticated
using (true);

-- =========================================================================
-- THEKLOPE Storage Configuration for Product Images
-- =========================================================================

-- Create a bucket for product images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow public read access to product images
drop policy if exists "Public Access for products bucket" on storage.objects;
create policy "Public Access for products bucket"
on storage.objects for select
using ( bucket_id = 'products' );

-- Allow authenticated admins to upload new image files
drop policy if exists "Admins can insert product images" on storage.objects;
create policy "Admins can insert product images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'products' );

-- Allow authenticated admins to update existing image files
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using ( bucket_id = 'products' )
with check ( bucket_id = 'products' );

-- Allow authenticated admins to delete image files
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'products' );
