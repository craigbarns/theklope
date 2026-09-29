-- Demande d'avis Google envoyée une fois, J+5 après une commande payée
-- (api/_lib/googleReview.js, lancé par le cron quotidien cleanup-checkouts).
-- Sans risque : ajoute une colonne vide et un index, ne modifie aucune donnée.
begin;

alter table public.orders
  add column if not exists google_review_email_sent_at timestamptz;

create index if not exists orders_google_review_pending_idx
on public.orders (created_at)
where google_review_email_sent_at is null and payment_status = 'paid';

commit;

notify pgrst, 'reload schema';
