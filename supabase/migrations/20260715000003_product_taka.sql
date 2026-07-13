-- Simple textile stock: taka (manual rolls count) on products

alter table public.products
  add column if not exists taka numeric(14, 2) not null default 0;

comment on column public.products.taka is 'Number of rolls/pieces — updated manually, not by challans';
comment on column public.products.current_stock is 'Available meters in stock — auto-updated by challans';
