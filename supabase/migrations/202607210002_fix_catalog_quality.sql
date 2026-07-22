begin;

-- Legacy imports applied liquid option templates to hardware. Besides being
-- misleading, those arrays forced customers to choose a nicotine strength for
-- a kit or accessory. These fields are meaningful only for liquids/DIY.
update public.products
set nicotine = '[]'::jsonb,
    flavors = '[]'::jsonb
where category not in ('eliquide', 'diy')
  and (nicotine <> '[]'::jsonb or flavors <> '[]'::jsonb);

-- The 5.90 EUR item is the 10 ml Freaks product. Restricting by price makes
-- this correction idempotent and avoids rewriting a future intentional SKU.
update public.products
set name = 'Classico Senois 10 ml - Freaks',
    brand = 'Freaks',
    volume = '10ml',
    specs = jsonb_set(coalesce(specs, '{}'::jsonb), '{Contenance}', '"10 ml"'::jsonb, true)
where id = 'senois-1-156'
  and price = 5.90;

-- This SKU had correct 50 ml price/specs but an incorrect normalized volume,
-- which made server-side bundle pricing treat it as a 10 ml bottle.
update public.products
set volume = '50ml'
where id = 'cerise-griotte-50ml-0mg-217'
  and price = 19.90
  and coalesce(specs->>'Contenance', '') ilike '%50%ml%';

-- The live catalog already has the correct 50 ml name/price/nicotine for these
-- SKUs, but inherited 10 ml prose and specs from an older import.
update public.products
set specs = jsonb_set(coalesce(specs, '{}'::jsonb), '{Contenance}', '"50 ml"'::jsonb, true),
    short = 'E-liquide MACADA MIAM en flacon de 50 ml, sans nicotine (0 mg).',
    long = 'Découvrez MACADA MIAM en format 50 ml sans nicotine (0 mg), sélectionné par THEKLOPE pour ses saveurs et sa qualité.'
where id = 'macada-miam-110'
  and volume = '50ml'
  and price = 19.90;

update public.products
set specs = jsonb_set(coalesce(specs, '{}'::jsonb), '{Contenance}', '"50 ml"'::jsonb, true),
    short = 'E-liquide MANTARO en flacon de 50 ml, sans nicotine (0 mg).',
    long = 'Découvrez MANTARO en format 50 ml sans nicotine (0 mg), sélectionné par THEKLOPE pour ses saveurs et sa qualité.'
where id = 'mantaro-116'
  and volume = '50ml'
  and price = 19.90;

-- These are confirmed duplicate imports. Historical order_items deliberately
-- retain their product_id text (there is no FK to products); the product delete
-- trigger also removes deleted IDs from related_product_ids. Locking the SKU
-- rows serializes this migration with checkout stock reservation; an active
-- reservation/returnable fulfillment keeps its product row intact.
select id
from public.products
where id in (
  'classico-grege-50-ml-freaks',
  'e-liquide-cafe-10ml-liquidarom'
)
for update;

delete from public.products product
where product.id in (
  'classico-grege-50-ml-freaks',
  'e-liquide-cafe-10ml-liquidarom'
)
and not exists (
  select 1
  from public.order_items item
  join public.orders active_order on active_order.id = item.order_id
  where item.product_id = product.id
    and (
      (
        active_order.stock_reservation_status in ('reserved', 'consumed')
        and active_order.status not in ('shipped', 'delivered', 'refunded')
      )
      or (
        active_order.status = 'pending_payment'
        and active_order.payment_status = 'unpaid'
        and active_order.stock_reservation_status = 'none'
      )
    )
);

commit;
