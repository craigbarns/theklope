-- Replace the old "any authenticated user is an admin" policies with an
-- explicit allowlist. This migration is intentionally fail-closed: until the
-- intended owner is inserted in public.admin_users, nobody gets admin access.

begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Authenticated admins can write products" on public.products;
create policy "Authenticated admins can write products"
on public.products for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can read orders" on public.orders;
create policy "Authenticated admins can read orders"
on public.orders for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Authenticated admins can update orders" on public.orders;
create policy "Authenticated admins can update orders"
on public.orders for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Authenticated admins can read order items" on public.order_items;
create policy "Authenticated admins can read order items"
on public.order_items for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Authenticated admins can read subscribers" on public.newsletter_subscribers;
create policy "Authenticated admins can read subscribers"
on public.newsletter_subscribers for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Authenticated admins can read messages" on public.contact_messages;
create policy "Authenticated admins can read messages"
on public.contact_messages for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can insert product images" on storage.objects;
create policy "Admins can insert product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'products' and (select public.is_admin()));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'products' and (select public.is_admin()))
with check (bucket_id = 'products' and (select public.is_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'products' and (select public.is_admin()));

commit;
