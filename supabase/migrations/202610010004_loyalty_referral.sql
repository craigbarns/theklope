-- Carte fidélité et parrainage (api/_lib/vouchers.js).
-- Bons en euros (fidélité, récompense parrain) à côté des bons en pourcentage,
-- plusieurs types de bons par commande, codes de parrainage par client.
begin;

alter table public.vouchers add column if not exists kind text not null default 'next_order';
alter table public.vouchers add column if not exists amount numeric(6,2);
alter table public.vouchers alter column percent drop not null;

alter table public.vouchers drop constraint if exists vouchers_code_check;
alter table public.vouchers drop constraint if exists vouchers_value_check;
alter table public.vouchers drop constraint if exists vouchers_kind_check;
alter table public.vouchers add constraint vouchers_code_check
  check (code ~ '^(MERCI|FIDEL|PARRAIN)-[A-HJ-KM-NP-Z2-9]{6}$');
alter table public.vouchers add constraint vouchers_kind_check
  check (kind in ('next_order', 'loyalty', 'referral_reward'));
alter table public.vouchers add constraint vouchers_value_check
  check ((percent is not null) <> (amount is not null) and (amount is null or (amount > 0 and amount <= 50)));

-- Un bon de chaque type par commande (au lieu d'un seul bon par commande).
alter table public.vouchers drop constraint if exists vouchers_source_order_id_key;
alter table public.vouchers drop constraint if exists vouchers_source_order_id_kind_key;
alter table public.vouchers add constraint vouchers_source_order_id_kind_key unique (source_order_id, kind);
create index if not exists vouchers_email_kind_idx on public.vouchers (email, kind);

create table if not exists public.referral_codes (
  email text primary key,
  code text not null unique check (code ~ '^AMI-[A-HJ-KM-NP-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);
alter table public.referral_codes enable row level security;
revoke all on table public.referral_codes from anon, authenticated;
grant select, insert on table public.referral_codes to service_role;

commit;

notify pgrst, 'reload schema';
