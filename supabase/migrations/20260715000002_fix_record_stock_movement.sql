-- Fix: RAISE EXCEPTION cannot be used inside a CASE expression in PostgreSQL.
-- Safe to re-run if record_stock_movement already exists from a partial apply.

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
