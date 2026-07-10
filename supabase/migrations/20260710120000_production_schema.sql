-- Production schema: companies, customers, products, challans, challan_items
-- Run after initial migration or on fresh project

-- ─── Extend companies ───────────────────────────────────────────────────────
alter table public.companies
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists pincode text,
  add column if not exists website text,
  add column if not exists tagline text,
  add column if not exists bank_name text,
  add column if not exists account_name text,
  add column if not exists account_number text,
  add column if not exists ifsc_code text,
  add column if not exists branch text,
  add column if not exists terms_conditions text,
  add column if not exists is_active boolean not null default false,
  add column if not exists hsn_code text;

-- ─── Rename parties → customers & extend ────────────────────────────────────
alter table public.parties rename to customers;

alter table public.customers
  add column if not exists email text,
  add column if not exists broker text;

alter table public.challans rename column party_id to customer_id;

-- Update RLS policy names (drop old, recreate)
drop policy if exists "Users can access parties of their companies" on public.customers;

create policy "Users can access customers of their companies"
  on public.customers for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = customers.company_id
      and companies.user_id = auth.uid()
    )
  );

-- ─── Products ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  hsn_code text,
  unit text not null default 'Mtrs',
  default_rate numeric(12, 2) not null default 0,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_company_id on public.products(company_id);
create index if not exists idx_products_name on public.products(company_id, name);

alter table public.products enable row level security;

create policy "Users can access products of their companies"
  on public.products for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = products.company_id
      and companies.user_id = auth.uid()
    )
  );

create trigger update_products_updated_at
  before update on public.products
  for each row execute function update_updated_at_column();

-- ─── Extend challans (tax, created_by) ───────────────────────────────────────
alter table public.challans
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists subtotal numeric(14, 2) not null default 0,
  add column if not exists discount numeric(14, 2) not null default 0,
  add column if not exists cgst_percent numeric(5, 2) not null default 2.5,
  add column if not exists sgst_percent numeric(5, 2) not null default 2.5,
  add column if not exists igst_percent numeric(5, 2) not null default 0,
  add column if not exists cgst_amount numeric(14, 2) not null default 0,
  add column if not exists sgst_amount numeric(14, 2) not null default 0,
  add column if not exists igst_amount numeric(14, 2) not null default 0,
  add column if not exists other_charges numeric(14, 2) not null default 0,
  add column if not exists grand_total numeric(14, 2) not null default 0,
  add column if not exists payment_terms text;

create index if not exists idx_challans_company_date on public.challans(company_id, date desc);
create index if not exists idx_challans_customer on public.challans(customer_id);
create index if not exists idx_challans_status on public.challans(company_id, status);
create index if not exists idx_challans_number on public.challans(company_id, challan_number);

-- ─── Extend challan_items ───────────────────────────────────────────────────
alter table public.challan_items
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists description text,
  add column if not exists quantity numeric(12, 2),
  add column if not exists unit text;

create index if not exists idx_challan_items_challan on public.challan_items(challan_id);
create index if not exists idx_challan_items_product on public.challan_items(product_id);

-- ─── Challan number sequences (per company) ─────────────────────────────────
create table if not exists public.challan_sequences (
  company_id uuid primary key references public.companies(id) on delete cascade,
  last_number integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.challan_sequences enable row level security;

create policy "Users can manage sequences for their companies"
  on public.challan_sequences for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = challan_sequences.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Atomic challan number generator: CH-000001, CH-000002, ...
create or replace function public.generate_challan_number(p_company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if not exists (
    select 1 from public.companies
    where id = p_company_id and user_id = auth.uid()
  ) then
    raise exception 'Unauthorized company access';
  end if;

  insert into public.challan_sequences (company_id, last_number)
  values (p_company_id, 0)
  on conflict (company_id) do nothing;

  update public.challan_sequences
  set last_number = last_number + 1,
      updated_at = now()
  where company_id = p_company_id
  returning last_number into v_next;

  return 'CH-' || lpad(v_next::text, 6, '0');
end;
$$;

grant execute on function public.generate_challan_number(uuid) to authenticated;

-- ─── Storage: company logos ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Users can upload logos for their companies"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their logos"
  on storage.objects for update
  using (
    bucket_id = 'company-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their logos"
  on storage.objects for delete
  using (
    bucket_id = 'company-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read company logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');
