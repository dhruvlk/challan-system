-- Inventory management: product stock fields + stock transaction ledger

-- ─── Extend products with stock columns ───────────────────────────────────────
alter table public.products
  add column if not exists current_stock numeric(14, 2) not null default 0,
  add column if not exists reserved_stock numeric(14, 2) not null default 0,
  add column if not exists minimum_stock numeric(14, 2) not null default 0;

create index if not exists idx_products_stock
  on public.products(company_id, current_stock);

-- ─── Stock transactions ledger ────────────────────────────────────────────────
create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  transaction_type text not null
    check (transaction_type in (
      'Purchase',
      'Sale',
      'Sale Return',
      'Purchase Return',
      'Manual Adjustment',
      'Opening Stock'
    )),
  challan_id uuid references public.challans(id) on delete set null,
  quantity numeric(14, 2) not null check (quantity > 0),
  previous_stock numeric(14, 2) not null,
  new_stock numeric(14, 2) not null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_transactions_company_date
  on public.stock_transactions(company_id, created_at desc);

create index if not exists idx_stock_transactions_product
  on public.stock_transactions(product_id, created_at desc);

create index if not exists idx_stock_transactions_challan
  on public.stock_transactions(challan_id);

alter table public.stock_transactions enable row level security;

create policy "Members can access stock transactions"
  on public.stock_transactions for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- ─── Atomic stock movement processor ──────────────────────────────────────────
create or replace function public.process_challan_stock_update(
  p_company_id uuid,
  p_challan_id uuid,
  p_changes jsonb,
  p_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_change jsonb;
  v_product_id uuid;
  v_delta numeric;
  v_prev numeric;
  v_new numeric;
  v_txn_type text;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  if p_changes is null or jsonb_array_length(p_changes) = 0 then
    return;
  end if;

  for v_change in select * from jsonb_array_elements(p_changes)
  loop
    v_product_id := (v_change->>'product_id')::uuid;
    v_delta := (v_change->>'delta')::numeric;

    if v_delta = 0 then
      continue;
    end if;

    select current_stock into v_prev
    from public.products
    where id = v_product_id and company_id = p_company_id
    for update;

    if not found then
      raise exception 'Product not found for stock update';
    end if;

    v_new := v_prev - v_delta;

    if v_new < 0 then
      raise exception 'Insufficient Stock Available';
    end if;

    update public.products
    set current_stock = v_new,
        updated_at = now()
    where id = v_product_id;

    if v_delta > 0 then
      v_txn_type := 'Sale';
    else
      v_txn_type := 'Sale Return';
    end if;

    insert into public.stock_transactions (
      company_id,
      product_id,
      transaction_type,
      challan_id,
      quantity,
      previous_stock,
      new_stock,
      notes,
      created_by
    )
    values (
      p_company_id,
      v_product_id,
      v_txn_type,
      p_challan_id,
      abs(v_delta),
      v_prev,
      v_new,
      case
        when p_challan_id is not null then 'Challan stock movement'
        else null
      end,
      p_user_id
    );
  end loop;
end;
$$;

grant execute on function public.process_challan_stock_update(uuid, uuid, jsonb, uuid) to authenticated;

-- ─── Opening stock / manual adjustment ────────────────────────────────────────
create or replace function public.record_stock_movement(
  p_company_id uuid,
  p_product_id uuid,
  p_transaction_type text,
  p_quantity numeric,
  p_challan_id uuid default null,
  p_user_id uuid default null,
  p_notes text default null
)
returns public.stock_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev numeric;
  v_new numeric;
  v_row public.stock_transactions;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  select current_stock into v_prev
  from public.products
  where id = p_product_id and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if p_transaction_type in ('Purchase', 'Sale Return', 'Opening Stock') then
    v_new := v_prev + p_quantity;
  elsif p_transaction_type in ('Sale', 'Purchase Return', 'Manual Adjustment') then
    v_new := v_prev - p_quantity;
  else
    raise exception 'Invalid transaction type';
  end if;

  if v_new < 0 then
    raise exception 'Insufficient Stock Available';
  end if;

  update public.products
  set current_stock = v_new,
      updated_at = now()
  where id = p_product_id;

  insert into public.stock_transactions (
    company_id, product_id, transaction_type, challan_id,
    quantity, previous_stock, new_stock, notes, created_by
  )
  values (
    p_company_id, p_product_id, p_transaction_type, p_challan_id,
    p_quantity, v_prev, v_new, p_notes, p_user_id
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.record_stock_movement(uuid, uuid, text, numeric, uuid, uuid, text) to authenticated;
