-- Add total_taka + sold_taka; Available = Total - Sold

alter table public.stocks
  add column if not exists total_taka numeric(14, 2);

alter table public.stocks
  add column if not exists sold_taka numeric(14, 2);

-- Net sold from delivery ledger rows (previous - current available)
with net_sold as (
  select
    m.stock_id,
    greatest(0, coalesce(sum(m.previous_stock - m.current_stock), 0)) as sold
  from public.stock_movements m
  where m.transaction_type in (
    'Delivery Challan',
    'Delivery Challan Edit',
    'Delivery Challan Delete',
    'Sale',
    'Edit Challan Update',
    'Delete Challan Restore'
  )
  group by m.stock_id
)
update public.stocks s
set sold_taka = coalesce(n.sold, 0)
from net_sold n
where n.stock_id = s.id;

update public.stocks
set sold_taka = 0
where sold_taka is null;

update public.stocks
set total_taka = available_taka + sold_taka
where total_taka is null;

update public.stocks
set available_taka = greatest(0, total_taka - sold_taka);

alter table public.stocks
  alter column total_taka set default 0;

alter table public.stocks
  alter column total_taka set not null;

alter table public.stocks
  alter column sold_taka set default 0;

alter table public.stocks
  alter column sold_taka set not null;

alter table public.stocks
  drop constraint if exists stocks_total_taka_check;
alter table public.stocks
  add constraint stocks_total_taka_check check (total_taka >= 0);

alter table public.stocks
  drop constraint if exists stocks_sold_taka_check;
alter table public.stocks
  add constraint stocks_sold_taka_check check (sold_taka >= 0);

alter table public.stocks
  drop constraint if exists stocks_available_matches_total_sold;
alter table public.stocks
  add constraint stocks_available_matches_total_sold
  check (available_taka = total_taka - sold_taka);

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
  v_total numeric;
  v_sold numeric;
  v_prev_available numeric;
  v_new_sold numeric;
  v_new_available numeric;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  if p_delta = 0 then
    return;
  end if;

  select total_taka, sold_taka, available_taka
    into v_total, v_sold, v_prev_available
  from public.stocks
  where id = p_stock_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Stock quality not found';
  end if;

  v_new_sold := v_sold + p_delta;

  if v_new_sold < 0 then
    v_new_sold := 0;
  end if;

  if v_new_sold > v_total then
    raise exception 'Only % Taka Available.', round(v_prev_available, 2);
  end if;

  v_new_available := v_total - v_new_sold;

  update public.stocks
  set sold_taka = v_new_sold,
      available_taka = v_new_available,
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
    v_prev_available,
    v_new_available,
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
