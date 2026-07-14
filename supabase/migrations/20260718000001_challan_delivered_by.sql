-- Rename driver_name to delivered_by for clearer challan semantics

alter table public.challans
  rename column driver_name to delivered_by;
