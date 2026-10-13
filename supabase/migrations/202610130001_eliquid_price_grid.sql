-- Grille de prix e-liquides du 13/10/2026 (src/lib/pricing.js : ELIQUID_PRICE_GRID).
--   10 ml Liquidarom, Freaks, Secret Garden : 2.95 EUR
--   10 ml Alfaliquid, Pulp                  : 4.40 EUR
--   tous les 50 ml (flacons 60/70/75 ml)    : 14.90 EUR
--   tous les 100 ml (flacons 120/150 ml)    : 18.60 EUR
-- Meme regle que priceGridRuleFor et que le panneau Admin > Produits > Grille
-- de prix e-liquides. Fonctions temporaires (pg_temp) : rien ne reste en base.
-- Le resultat liste chaque produit modifie (ancien et nouveau prix).
-- Fichier 100 % ASCII : les caracteres speciaux (accents combinants, apostrophe
-- typographique) sont construits avec chr(), car ils cassaient le copier-coller
-- dans l'editeur SQL de Supabase.

create function pg_temp.tk_ml_values(t text) returns numeric[]
language sql immutable as $$
  select coalesce(array_agg(v order by first_pos), '{}')
  from (
    select trim_scale(replace(m[1], ',', '.')::numeric) as v, min(ord) as first_pos
    from regexp_matches(coalesce(t, ''), '(\d+(?:[.,]\d+)?)\s*ml\y', 'gi') with ordinality as r(m, ord)
    group by 1
  ) s
$$;

create function pg_temp.tk_bottles(n numeric) returns numeric[]
language sql immutable as $$
  select case n when 50 then array[60, 70, 75]::numeric[] when 100 then array[120, 150]::numeric[] else '{}'::numeric[] end
$$;

create function pg_temp.tk_resolve_volume(p_volume text, p_specs jsonb, p_name text) returns text
language plpgsql immutable as $$
declare
  raw text := coalesce(nullif(p_volume, ''), nullif(p_specs->>'Contenance', ''), nullif(p_specs->>'contenance', ''), '');
  from_field numeric[] := pg_temp.tk_ml_values(raw);
  from_name numeric[] := pg_temp.tk_ml_values(p_name);
  field numeric := case when cardinality(from_field) = 1 then from_field[1] end;
  nm numeric := case when cardinality(from_name) = 1 then from_name[1] end;
begin
  if nm is not null and (field is null or field = any(pg_temp.tk_bottles(nm))) then
    if field is not null or coalesce((
      select bool_and(v = nm or v = any(pg_temp.tk_bottles(nm))) from unnest(from_field) as v
    ), true) then
      return nm::text || 'ml';
    end if;
  end if;
  if field is not null then return field::text || 'ml'; end if;
  if cardinality(from_field) = 2 then
    if from_field[2] = any(pg_temp.tk_bottles(from_field[1])) then return from_field[1]::text || 'ml'; end if;
    if from_field[1] = any(pg_temp.tk_bottles(from_field[2])) then return from_field[2]::text || 'ml'; end if;
  end if;
  if cardinality(from_field) = 0 and nm is not null then return nm::text || 'ml'; end if;
  return lower(regexp_replace(btrim(raw), '\s+', '', 'g'));
end
$$;

-- chr(768)-chr(879) : accents combinants apres normalisation NFD.
-- chr(39) et chr(8217) : apostrophes droite et typographique.
create function pg_temp.tk_norm_brand(b text) returns text
language sql immutable as $$
  select btrim(regexp_replace(
    regexp_replace(
      lower(regexp_replace(normalize(coalesce(b, ''), NFD), '[' || chr(768) || '-' || chr(879) || ']', '', 'g')),
      '[' || chr(39) || chr(8217) || ']', '', 'g'),
    '[^a-z0-9]+', ' ', 'g'))
$$;

create function pg_temp.tk_grid_price(p_category text, p_brand text, p_volume text, p_specs jsonb, p_name text) returns numeric
language plpgsql immutable as $$
declare
  cat text := lower(btrim(coalesce(p_category, '')));
  vol text;
  brand text;
begin
  if not (cat = 'eliquide' or cat like 'eliquide-%') then return null; end if;
  vol := pg_temp.tk_resolve_volume(p_volume, p_specs, p_name);
  brand := pg_temp.tk_norm_brand(p_brand);
  if vol = '10ml' and brand in ('liquidarom', 'freaks', 'secret garden', 'secrets garden') then return 2.95; end if;
  if vol = '10ml' and brand in ('alfaliquid', 'pulp') then return 4.40; end if;
  if vol = '50ml' then return 14.90; end if;
  if vol = '100ml' then return 18.60; end if;
  return null;
end
$$;

with targets as (
  select id, price as old_price,
    pg_temp.tk_grid_price(category, brand, volume, specs, name) as new_price
  from public.products
), changed as (
  update public.products p
  set price = t.new_price
  from targets t
  where p.id = t.id
    and t.new_price is not null
    and p.price is distinct from t.new_price
  returning p.id, p.name, p.brand, p.volume, t.old_price, p.price as new_price
)
select * from changed order by new_price, brand, name;
