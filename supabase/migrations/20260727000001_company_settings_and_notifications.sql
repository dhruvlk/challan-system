-- Company Settings expansions, multi-bank accounts, document numbering, notifications

-- ─── Companies: settings columns ──────────────────────────────────────────────
alter table public.companies
  add column if not exists owner_name text,
  add column if not exists stamp_url text,
  add column if not exists invoice_prefix text default 'INV',
  add column if not exists delivery_challan_prefix text default 'DC',
  add column if not exists invoice_start_number integer not null default 1,
  add column if not exists delivery_challan_start_number integer not null default 1,
  add column if not exists number_fy_format text not null default 'YYYY'
    check (number_fy_format in ('YYYY', 'YYYY-YY', 'none')),
  add column if not exists theme_primary text,
  add column if not exists theme_secondary text,
  add column if not exists invoice_terms text,
  add column if not exists delivery_challan_terms text,
  add column if not exists default_payment_terms text default '45 Days',
  add column if not exists default_gst_type text default 'cgst_sgst'
    check (default_gst_type in ('cgst_sgst', 'igst', 'none')),
  add column if not exists default_unit text default 'Taka',
  add column if not exists default_delivered_by text,
  add column if not exists upi_id text;

-- Backfill invoice terms from legacy terms_conditions
update public.companies
set invoice_terms = coalesce(invoice_terms, terms_conditions)
where invoice_terms is null and terms_conditions is not null;

-- ─── Multi-bank accounts ────────────────────────────────────────────────────
create table if not exists public.company_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bank_name text not null,
  account_name text,
  account_number text,
  ifsc_code text,
  branch text,
  upi_id text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_company_bank_accounts_company
  on public.company_bank_accounts (company_id, is_default desc);

alter table public.company_bank_accounts enable row level security;

drop policy if exists "Members can access company bank accounts" on public.company_bank_accounts;
create policy "Members can access company bank accounts"
  on public.company_bank_accounts for select
  using (public.user_belongs_to_company(company_id));

drop policy if exists "Owners manage company bank accounts" on public.company_bank_accounts;
create policy "Owners manage company bank accounts"
  on public.company_bank_accounts for all
  using (public.user_has_company_role(company_id, array['Owner']::text[]))
  with check (public.user_has_company_role(company_id, array['Owner']::text[]));

-- Seed default bank from legacy company columns when empty
insert into public.company_bank_accounts (
  company_id, bank_name, account_name, account_number, ifsc_code, branch, upi_id, is_default
)
select
  c.id,
  coalesce(nullif(trim(c.bank_name), ''), 'Primary Bank'),
  c.account_name,
  c.account_number,
  c.ifsc_code,
  c.branch,
  c.upi_id,
  true
from public.companies c
where (
  nullif(trim(c.bank_name), '') is not null
  or nullif(trim(c.account_number), '') is not null
  or nullif(trim(c.ifsc_code), '') is not null
)
and not exists (
  select 1 from public.company_bank_accounts b where b.company_id = c.id
);

-- Keep at most one default per company
create or replace function public.ensure_single_default_bank()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.company_bank_accounts
    set is_default = false, updated_at = now()
    where company_id = new.company_id
      and id <> new.id
      and is_default = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ensure_single_default_bank on public.company_bank_accounts;
create trigger trg_ensure_single_default_bank
  before insert or update of is_default on public.company_bank_accounts
  for each row
  when (new.is_default = true)
  execute function public.ensure_single_default_bank();

-- Sync default bank → legacy company columns (PDF helpers)
create or replace function public.sync_company_default_bank()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bank public.company_bank_accounts%rowtype;
begin
  select * into v_bank
  from public.company_bank_accounts
  where company_id = coalesce(new.company_id, old.company_id)
    and is_default = true
  order by updated_at desc
  limit 1;

  if found then
    update public.companies
    set
      bank_name = v_bank.bank_name,
      account_name = v_bank.account_name,
      account_number = v_bank.account_number,
      ifsc_code = v_bank.ifsc_code,
      branch = v_bank.branch,
      upi_id = v_bank.upi_id,
      updated_at = now()
    where id = v_bank.company_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_company_default_bank on public.company_bank_accounts;
create trigger trg_sync_company_default_bank
  after insert or update or delete on public.company_bank_accounts
  for each row execute function public.sync_company_default_bank();

-- ─── Document numbering helpers ─────────────────────────────────────────────
create or replace function public.company_fy_token(
  p_format text,
  p_date date default current_date
)
returns text
language plpgsql
immutable
as $$
declare
  v_year integer := extract(year from p_date)::integer;
  v_month integer := extract(month from p_date)::integer;
  v_fy_start integer;
begin
  if p_format = 'none' or p_format is null then
    return '';
  end if;

  if p_format = 'YYYY-YY' then
    -- Indian financial year (Apr–Mar)
    if v_month >= 4 then
      v_fy_start := v_year;
    else
      v_fy_start := v_year - 1;
    end if;
    return lpad((v_fy_start % 100)::text, 2, '0') || '-' || lpad(((v_fy_start + 1) % 100)::text, 2, '0');
  end if;

  -- YYYY (calendar year)
  return v_year::text;
end;
$$;

create or replace function public.format_document_number(
  p_prefix text,
  p_fy text,
  p_number integer
)
returns text
language plpgsql
immutable
as $$
declare
  v_prefix text := coalesce(nullif(trim(p_prefix), ''), 'DOC');
begin
  if p_fy is null or p_fy = '' then
    return v_prefix || '-' || lpad(p_number::text, 4, '0');
  end if;
  return v_prefix || '-' || p_fy || '-' || lpad(p_number::text, 4, '0');
end;
$$;

create or replace function public.generate_challan_number(p_company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
  v_current integer;
  v_start integer;
  v_prefix text;
  v_fy_format text;
  v_fy text;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  select
    coalesce(nullif(trim(invoice_prefix), ''), 'INV'),
    coalesce(invoice_start_number, 1),
    coalesce(number_fy_format, 'YYYY')
  into v_prefix, v_start, v_fy_format
  from public.companies
  where id = p_company_id;

  insert into public.challan_sequences (company_id, last_number)
  values (p_company_id, 0)
  on conflict (company_id) do nothing;

  select last_number into v_current
  from public.challan_sequences
  where company_id = p_company_id
  for update;

  if coalesce(v_current, 0) < coalesce(v_start, 1) then
    v_next := coalesce(v_start, 1);
  else
    v_next := v_current + 1;
  end if;

  update public.challan_sequences
  set last_number = v_next,
      updated_at = now()
  where company_id = p_company_id;

  v_fy := public.company_fy_token(v_fy_format, current_date);
  return public.format_document_number(v_prefix, v_fy, v_next);
end;
$$;

create or replace function public.generate_delivery_challan_number(p_company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
  v_current integer;
  v_start integer;
  v_prefix text;
  v_fy_format text;
  v_fy text;
begin
  if not public.user_belongs_to_company(p_company_id) then
    raise exception 'Unauthorized company access';
  end if;

  select
    coalesce(nullif(trim(delivery_challan_prefix), ''), 'DC'),
    coalesce(delivery_challan_start_number, 1),
    coalesce(number_fy_format, 'YYYY')
  into v_prefix, v_start, v_fy_format
  from public.companies
  where id = p_company_id;

  insert into public.delivery_challan_sequences (company_id, last_number)
  values (p_company_id, 0)
  on conflict (company_id) do nothing;

  select last_number into v_current
  from public.delivery_challan_sequences
  where company_id = p_company_id
  for update;

  if coalesce(v_current, 0) < coalesce(v_start, 1) then
    v_next := coalesce(v_start, 1);
  else
    v_next := v_current + 1;
  end if;

  update public.delivery_challan_sequences
  set last_number = v_next,
      updated_at = now()
  where company_id = p_company_id;

  v_fy := public.company_fy_token(v_fy_format, current_date);
  return public.format_document_number(v_prefix, v_fy, v_next);
end;
$$;

-- Owners-only settings update (RLS already membership-scoped; tighten company update for non-owners optional)
-- Keep existing company policies; app enforces Owner via permission module.

-- ─── Notifications ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null
    check (type in (
      'low_stock',
      'out_of_stock',
      'payment_due',
      'overdue_payment',
      'invoice_created',
      'delivery_challan_created',
      'company_updated',
      'employee_login',
      'system_update'
    )),
  title text not null,
  message text,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_company_created
  on public.notifications (company_id, created_at desc);

create index if not exists idx_notifications_unread
  on public.notifications (company_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Members read company notifications" on public.notifications;
create policy "Members read company notifications"
  on public.notifications for select
  using (
    public.user_belongs_to_company(company_id)
    and (user_id is null or user_id = auth.uid())
  );

drop policy if exists "Members insert company notifications" on public.notifications;
create policy "Members insert company notifications"
  on public.notifications for insert
  with check (public.user_belongs_to_company(company_id));

drop policy if exists "Members update company notifications" on public.notifications;
create policy "Members update company notifications"
  on public.notifications for update
  using (
    public.user_belongs_to_company(company_id)
    and (user_id is null or user_id = auth.uid())
  );

drop policy if exists "Members delete company notifications" on public.notifications;
create policy "Members delete company notifications"
  on public.notifications for delete
  using (
    public.user_belongs_to_company(company_id)
    and (user_id is null or user_id = auth.uid())
  );
