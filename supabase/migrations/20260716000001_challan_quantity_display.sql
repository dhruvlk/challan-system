-- Free-text quantity display (e.g. "4500 Mts", "598 Kgs")

alter table public.challan_items
  add column if not exists quantity_display text;

-- Backfill from legacy numeric quantity + unit
update public.challan_items
set quantity_display = trim(
  coalesce(nullif(meter::text, ''), nullif(quantity::text, '')) || ' ' ||
  case when unit = 'Kgs' then 'Kgs' else 'Mts' end
)
where quantity_display is null
  and (meter is not null or quantity is not null);
