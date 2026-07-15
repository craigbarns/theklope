begin;

alter table public.products
  add column if not exists related_product_ids jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_related_product_ids_is_array'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_related_product_ids_is_array
      check (jsonb_typeof(related_product_ids) = 'array');
  end if;
end
$$;

create or replace function public.remove_deleted_product_from_related_ids()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products as product
  set related_product_ids = coalesce(
    (
      select jsonb_agg(entry.value order by entry.ordinality)
      from jsonb_array_elements(product.related_product_ids)
        with ordinality as entry(value, ordinality)
      where not exists (
        select 1
        from deleted_products as deleted
        where entry.value = to_jsonb(deleted.id)
      )
    ),
    '[]'::jsonb
  )
  where exists (
    select 1
    from deleted_products as deleted
    where product.related_product_ids ? deleted.id
  );

  return null;
end;
$$;

drop trigger if exists products_remove_deleted_related_ids on public.products;
create trigger products_remove_deleted_related_ids
after delete on public.products
referencing old table as deleted_products
for each statement execute function public.remove_deleted_product_from_related_ids();

commit;
