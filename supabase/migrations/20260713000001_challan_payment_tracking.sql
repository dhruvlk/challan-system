-- Challan payment tracking: summary fields on challans + payment history table

-- ─── Payment summary on challans ────────────────────────────────────────────
alter table public.challans
  add column if not exists payment_status text not null default 'Pending'
    check (payment_status in ('Pending', 'Partially Paid', 'Paid', 'Overdue')),
  add column if not exists payment_received_date date,
  add column if not exists payment_amount_received numeric(14, 2) not null default 0,
  add column if not exists payment_reference text,
  add column if not exists payment_notes text,
  add column if not exists payment_mode text;

create index if not exists idx_challans_payment_status
  on public.challans(company_id, payment_status);

create index if not exists idx_challans_due_date
  on public.challans(company_id, due_date);

-- Backfill existing rows
update public.challans
set
  payment_status = 'Pending',
  payment_amount_received = coalesce(payment_amount_received, 0)
where payment_status is null or payment_amount_received is null;

-- ─── Payment history (extensible for partial payments / reconciliation) ─────
create table if not exists public.challan_payments (
  id uuid primary key default gen_random_uuid(),
  challan_id uuid references public.challans(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  amount numeric(14, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_mode text,
  reference_number text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_challan_payments_challan
  on public.challan_payments(challan_id, payment_date desc);

create index if not exists idx_challan_payments_company
  on public.challan_payments(company_id, payment_date desc);

alter table public.challan_payments enable row level security;

create policy "Users can access payments for their company challans"
  on public.challan_payments for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = challan_payments.company_id
      and companies.user_id = auth.uid()
    )
  );
