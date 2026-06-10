-- THEKLOPE Supabase schema
-- Run this file in Supabase SQL Editor before connecting the production app.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'eliquide',
  brand text not null default 'THEKLOPE',
  type text not null default 'Produit',
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

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'processing',
  payment_status text not null default 'paid',
  customer jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  promo jsonb
);

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

create or replace function public.submit_order(order_payload jsonb, items_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  order_id text := order_payload->>'id';
begin
  if order_id is null or order_id = '' then
    raise exception 'order id is required';
  end if;

  insert into public.orders (
    id,
    created_at,
    status,
    payment_status,
    customer,
    address,
    shipping,
    subtotal,
    discount,
    shipping_cost,
    total,
    promo
  )
  values (
    order_id,
    coalesce((order_payload->>'created_at')::timestamptz, now()),
    coalesce(order_payload->>'status', 'processing'),
    coalesce(order_payload->>'payment_status', 'paid'),
    coalesce(order_payload->'customer', '{}'::jsonb),
    coalesce(order_payload->'address', '{}'::jsonb),
    coalesce(order_payload->'shipping', '{}'::jsonb),
    coalesce((order_payload->>'subtotal')::numeric, 0),
    coalesce((order_payload->>'discount')::numeric, 0),
    coalesce((order_payload->>'shipping_cost')::numeric, 0),
    coalesce((order_payload->>'total')::numeric, 0),
    order_payload->'promo'
  );

  for item in
    select value from jsonb_array_elements(coalesce(items_payload, '[]'::jsonb)) as items(value)
  loop
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
    values (
      order_id,
      item->>'product_id',
      coalesce(item->>'name', 'Produit'),
      item->>'image',
      coalesce((item->>'price')::numeric, 0),
      coalesce((item->>'qty')::integer, 1),
      coalesce(item->'variant', '{}'::jsonb),
      coalesce((item->>'line_total')::numeric, 0)
    );

    update public.products
    set stock = greatest(0, stock - coalesce((item->>'qty')::integer, 1))
    where id = item->>'product_id';
  end loop;
end;
$$;

revoke all on function public.submit_order(jsonb, jsonb) from public;
grant execute on function public.submit_order(jsonb, jsonb) to anon, authenticated;

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

drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

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

drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
on public.order_items for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated admins can read order items" on public.order_items;
create policy "Authenticated admins can read order items"
on public.order_items for select
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

