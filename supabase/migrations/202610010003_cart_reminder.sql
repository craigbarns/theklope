-- Relance unique des paniers abandonnés au paiement (api/_lib/cartReminder.js).
alter table public.orders add column if not exists cart_reminder_sent_at timestamptz;
notify pgrst, 'reload schema';
