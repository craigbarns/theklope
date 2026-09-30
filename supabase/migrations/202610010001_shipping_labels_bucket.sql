-- Stockage PRIVÉ des étiquettes d'expédition (PDF Colissimo). Elles portent
-- le nom et l'adresse du client : aucun accès public, aucune politique RLS
-- pour les rôles anon/authenticated. Seul le service role (API serveur) lit
-- et écrit ; l'admin reçoit un lien signé valable une heure.
insert into storage.buckets (id, name, public)
values ('shipping-labels', 'shipping-labels', false)
on conflict (id) do update set public = false;
