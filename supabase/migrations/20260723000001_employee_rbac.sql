-- Employee management, permission matrix, and future-ready audit log

-- ─── Profiles: store login email for employee directory ───────────────────────
alter table public.profiles
  add column if not exists email text;

create index if not exists idx_profiles_email
  on public.profiles (email);

-- ─── Company members: designation + invite tracking ───────────────────────────
alter table public.company_members
  add column if not exists designation text;

alter table public.company_members
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

-- ─── Permission modules ───────────────────────────────────────────────────────
create table if not exists public.employee_permissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null
    check (module in (
      'dashboard',
      'companies',
      'customers',
      'delivery_challans',
      'invoices',
      'stock',
      'reports',
      'employees',
      'settings',
      'products'
    )),
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  can_export boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id, module)
);

create index if not exists idx_employee_permissions_user
  on public.employee_permissions (company_id, user_id);

alter table public.employee_permissions enable row level security;

drop policy if exists "Members can read employee permissions" on public.employee_permissions;
create policy "Members can read employee permissions"
  on public.employee_permissions for select
  using (public.user_belongs_to_company(company_id));

drop policy if exists "Owners manage employee permissions" on public.employee_permissions;
create policy "Owners manage employee permissions"
  on public.employee_permissions for all
  using (public.user_has_company_role(company_id, array['Owner']::text[]))
  with check (public.user_has_company_role(company_id, array['Owner']::text[]));

-- ─── Future-ready audit log (no UI wiring yet) ────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  employee_name text,
  action text not null,
  module text,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_company_date
  on public.audit_logs (company_id, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Owners can read audit logs" on public.audit_logs;
create policy "Owners can read audit logs"
  on public.audit_logs for select
  using (public.user_has_company_role(company_id, array['Owner']::text[]));

drop policy if exists "Members can insert audit logs" on public.audit_logs;
create policy "Members can insert audit logs"
  on public.audit_logs for insert
  with check (public.user_belongs_to_company(company_id));

-- ─── Permission helper ────────────────────────────────────────────────────────
create or replace function public.user_has_module_permission(
  p_company_id uuid,
  p_module text,
  p_action text default 'view'
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
  v_active boolean;
  v_perm public.employee_permissions%rowtype;
begin
  select role, is_active
    into v_role, v_active
  from public.company_members
  where company_id = p_company_id
    and user_id = auth.uid()
  limit 1;

  if not found or coalesce(v_active, false) = false then
    return false;
  end if;

  -- Company Owner always has full access
  if v_role = 'Owner' then
    return true;
  end if;

  -- Employee Management is Owner-only
  if p_module = 'employees' then
    return false;
  end if;

  select *
    into v_perm
  from public.employee_permissions
  where company_id = p_company_id
    and user_id = auth.uid()
    and module = p_module
  limit 1;

  if not found then
    -- Legacy members (no matrix yet): Admin/Manager/Accountant keep access;
    -- Staff gets dashboard view only until explicitly configured.
    if v_role in ('Admin', 'Manager', 'Accountant') then
      return true;
    end if;
    if v_role = 'Staff' and p_module = 'dashboard' and lower(p_action) = 'view' then
      return true;
    end if;
    return false;
  end if;

  return case lower(p_action)
    when 'view' then v_perm.can_view
    when 'create' then v_perm.can_create
    when 'edit' then v_perm.can_edit
    when 'delete' then v_perm.can_delete
    when 'export' then v_perm.can_export
    else false
  end;
end;
$$;

grant execute on function public.user_has_module_permission(uuid, text, text) to authenticated;

-- Keep membership writes Owner-only for employee security (Admin can still be granted later)
drop policy if exists "Owners and admins manage company members" on public.company_members;
drop policy if exists "Owners manage company members" on public.company_members;
create policy "Owners manage company members"
  on public.company_members for all
  using (public.user_has_company_role(company_id, array['Owner']::text[]))
  with check (public.user_has_company_role(company_id, array['Owner']::text[]));

-- Members can read company roster; users can always read their own rows (incl. inactive)
drop policy if exists "Members can read company members" on public.company_members;
create policy "Members can read company members"
  on public.company_members for select
  using (
    public.user_belongs_to_company(company_id)
    or user_id = auth.uid()
  );
