-- Retire les promotions restantes sur les liquides (13/10/2026, demande du gerant) :
--   - prix barre (old_price), affiche dans les pages lues par Google ;
--   - badge promo (PRIX ROUGE).
-- Uniquement les e-liquides (eliquide, eliquide-*) et les sels de nicotine.
-- Le materiel, la fidelite, le parrainage et les bons MERCI ne changent pas.
-- Le resultat liste chaque liquide modifie (ancien prix barre, ancien badge).

with targets as (
  select id, old_price as previous_old_price, badge as previous_badge
  from public.products
  where (lower(btrim(category)) = 'eliquide'
      or lower(btrim(category)) like 'eliquide-%'
      or lower(btrim(category)) = 'sels-nicotine')
    and (old_price is not null or badge = 'promo')
), changed as (
  update public.products p
  set old_price = null,
      badge = case when p.badge = 'promo' then null else p.badge end
  from targets t
  where p.id = t.id
  returning p.id, p.name, p.brand, p.price, t.previous_old_price, t.previous_badge
)
select * from changed order by brand, name;
