-- Challan item: dynamic total pieces + unit support (Mts/Kgs)

alter table public.challan_items
  add column if not exists total_pieces numeric(12, 2) not null default 1;

-- Normalize legacy unit values to Mts
update public.challan_items
set unit = 'Mts'
where unit is null
   or unit in ('Mtrs', 'Meter', 'Meters', 'mtrs', 'meter');
