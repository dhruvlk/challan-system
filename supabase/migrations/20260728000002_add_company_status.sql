-- Add status column to companies
alter table public.companies 
  add column if not exists status text not null default 'Active' 
  check (status in ('Active', 'Archived'));

-- RPC to check if a company has related business data
create or replace function public.check_company_has_data(p_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parties where company_id = p_company_id limit 1
  ) or exists (
    select 1 from public.challans where company_id = p_company_id limit 1
  ) or exists (
    select 1 from public.delivery_challans where company_id = p_company_id limit 1
  ) or exists (
    select 1 from public.stocks where company_id = p_company_id limit 1
  ) or exists (
    select 1 from public.products where company_id = p_company_id limit 1
  ) or (
    (select count(*) from public.company_members where company_id = p_company_id and role != 'Owner') > 0
  );
$$;

grant execute on function public.check_company_has_data(uuid) to authenticated;
