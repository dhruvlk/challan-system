-- Quality-wise textile stock management (separate from product meter inventory)

-- ─── Stocks master ────────────────────────────────────────────────────────────
create table if not exists public.stocks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  quality_name text not null,
  available_taka numeric(14, 2) not null default 0 check (available_taka >= 0),
  sold_taka numeric(14, 2) not null default 0 check (sold_taka >= 0),
  minimum_stock numeric(14, 2) not null default 10 check (minimum_stock >= 0),
  hsn_code text,
  remarks text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, quality_name)
);

create index if not exists idx_stocks_company
  on public.stocks(company_id, quality_name);

create index if not exists idx_stocks_company_available
  on public.stocks(company_id, available_taka);

alter table public.stocks enable row level security;

create policy "Members can access stocks"
  on public.stocks for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

drop trigger if exists update_stocks_updated_at on public.stocks;
create or replace function public.set_stocks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_stocks_updated_at
  before update on public.stocks
  for each row execute function public.set_stocks_updated_at();

-- ─── Quality stock movements ledger ───────────────────────────────────────────
-- Named stock_movements to avoid clash with product stock_transactions.
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  stock_id uuid references public.stocks(id) on delete cascade not null,
  transaction_type text not null
    check (transaction_type in (
      'Opening Stock',
      'Sale',
      'Manual Adjustment',
      'Delete Challan Restore',
      'Edit Challan Update'
    )),
  quantity numeric(14, 2) not null,
  previous_stock numeric(14, 2) not null,
  current_stock numeric(14, 2) not null,
  reference_type text
    check (reference_type is null or reference_type in ('invoice', 'delivery_challan', 'manual')),
  reference_id uuid,
  challan_id uuid references public.challans(id) on delete set null,
  delivery_challan_id uuid references public.delivery_challans(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_movements_company_date
  on public.stock_movements(company_id, created_at desc);

create index if not exists idx_stock_movements_stock
  on public.stock_movements(stock_id, created_at desc);

create index if not exists idx_stock_movements_challan
  on public.stock_movements(challan_id);

create index if not exists idx_stock_movements_delivery
  on public.stock_movements(delivery_challan_id);

alter table public.stock_movements enable row level security;

create policy "Members can access stock movements"
  on public.stock_movements for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- Link quality stock on invoice line items + delivery challan header
alter table public.challan_items
  add column if not exists stock_id uuid references public.stocks(id) on delete set null;

alter table public.delivery_challans
  add column if not exists stock_id uuid references public.stocks(id) on delete set null;

create index if not exists idx_challan_items_stock
  on public.challan_items(stock_id);

create index if not exists idx_delivery_challans_stock
  on public.delivery_challans(stock_id);

-- ─── Atomic quality stock processor ───────────────────────────────────────────
-- p_delta: positive = deduct (sale), negative = restore
create or replace function public.process_quality_stock_change(
  p_company_id uuid,
  p_stock_id uuid,
  p_delta numeric,
  p_transaction_type text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_challan_id uuid default null,
  p_delivery_challan_id uuid default null,
  p_notes text default null,
  p_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev numeric;
  v_new numeric;
  v_sold numeric;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  if p_delta = 0 then
    return;
  end if;

  select available_taka, sold_taka
    into v_prev, v_sold
  from public.stocks
  where id = p_stock_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Stock quality not found';
  end if;

  v_new := v_prev - p_delta;

  if v_new < 0 then
    raise exception 'Only % Taka Available', round(v_prev, 2);
  end if;

  update public.stocks
  set available_taka = v_new,
      sold_taka = case
        when p_transaction_type in ('Sale', 'Edit Challan Update', 'Delete Challan Restore')
          then greatest(0, v_sold + p_delta)
        else v_sold
      end,
      updated_at = now()
  where id = p_stock_id;

  insert into public.stock_movements (
    company_id,
    stock_id,
    transaction_type,
    quantity,
    previous_stock,
    current_stock,
    reference_type,
    reference_id,
    challan_id,
    delivery_challan_id,
    notes,
    created_by
  ) values (
    p_company_id,
    p_stock_id,
    p_transaction_type,
    abs(p_delta),
    v_prev,
    v_new,
    p_reference_type,
    p_reference_id,
    p_challan_id,
    p_delivery_challan_id,
    p_notes,
    p_user_id
  );
end;
$$;

grant execute on function public.process_quality_stock_change(
  uuid, uuid, numeric, text, text, uuid, uuid, uuid, text, uuid
) to authenticated;
