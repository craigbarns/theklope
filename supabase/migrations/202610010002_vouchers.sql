-- Bons de réduction « prochaine commande » (api/_lib/vouchers.js).
-- Un bon par commande payée, nominatif (e-mail), à usage unique, 60 jours.
-- Table fermée : RLS activé sans aucune politique, seul le service role
-- (API serveur) lit et écrit. Un visiteur ne peut ni lister ni deviner un code.
begin;

create table if not exists public.vouchers (
  code text primary key check (code ~ '^MERCI-[A-HJ-KM-NP-Z2-9]{6}$'),
  email text not null,
  percent numeric(4,2) not null check (percent > 0 and percent <= 20),
  source_order_id text not null unique references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_order_id text
);

create index if not exists vouchers_email_idx on public.vouchers (lower(email));

alter table public.vouchers enable row level security;
revoke all on table public.vouchers from anon, authenticated;
grant select, insert, update on table public.vouchers to service_role;

commit;

notify pgrst, 'reload schema';
