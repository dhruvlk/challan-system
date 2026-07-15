-- Delivery-challan-only quality stock; fixed Low Stock threshold; drop min/sold columns

-- ─── Stocks schema cleanup ────────────────────────────────────────────────────
alter table public.stocks drop column if exists minimum_stock;
alter table public.stocks drop column if exists sold_taka;

-- Drop type constraints before remapping values
alter table public.stock_movements
  drop constraint if exists stock_movements_transaction_type_check;

alter table public.stock_movements
  drop constraint if exists stock_movements_reference_type_check;

-- ─── Remap legacy movement types ──────────────────────────────────────────────
update public.stock_movements
set transaction_type = 'Delivery Challan'
where transaction_type = 'Sale';

update public.stock_movements
set transaction_type = 'Delivery Challan Edit'
where transaction_type = 'Edit Challan Update';

update public.stock_movements
set transaction_type = 'Delivery Challan Delete'
where transaction_type = 'Delete Challan Restore';

update public.stock_movements
set transaction_type = 'Manual Stock Adjustment'
where transaction_type = 'Manual Adjustment';

-- Clear legacy invoice links (stock is delivery-challan only going forward)
update public.stock_movements
set reference_type = null,
    challan_id = null
where reference_type = 'invoice';

alter table public.stock_movements
  add constraint stock_movements_transaction_type_check
  check (transaction_type in (
    'Opening Stock',
    'Delivery Challan',
    'Delivery Challan Edit',
    'Delivery Challan Delete',
    'Manual Stock Adjustment'
  ));

alter table public.stock_movements
  add constraint stock_movements_reference_type_check
  check (
    reference_type is null
    or reference_type in ('delivery_challan', 'manual')
  );

-- ─── Atomic processor (available_taka only; positive delta = deduct) ───────────
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
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  if p_delta = 0 then
    return;
  end if;

  select available_taka
    into v_prev
  from public.stocks
  where id = p_stock_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Stock quality not found';
  end if;

  v_new := v_prev - p_delta;

  if v_new < 0 then
    raise exception 'Only % Taka Available.', round(v_prev, 2);
  end if;

  update public.stocks
  set available_taka = v_new,
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
