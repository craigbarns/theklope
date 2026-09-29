-- Taux de nicotine en rupture, cochés depuis l'admin (liste des produits ou
-- fiche produit). Le stock chiffré reste global par produit ; un taux présent
-- dans cette liste reste affiché (grisé) mais ne peut plus être commandé.
-- Sans risque : ajoute une colonne vide, ne modifie aucune donnée existante.
begin;

alter table public.products
  add column if not exists nicotine_out_of_stock jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_nicotine_out_of_stock_is_array'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_nicotine_out_of_stock_is_array
      check (jsonb_typeof(nicotine_out_of_stock) = 'array');
  end if;
end
$$;

commit;

-- Recharge le cache de schéma de l'API Supabase pour que la colonne soit
-- utilisable immédiatement.
notify pgrst, 'reload schema';
