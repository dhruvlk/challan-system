-- Multi-tenant auth: profiles, company memberships, membership-based RLS

-- ─── Profiles (extends auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

-- ─── Company members (multi-user per company) ───────────────────────────────
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'Staff'
    check (role in ('Owner', 'Admin', 'Manager', 'Accountant', 'Staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists idx_company_members_user
  on public.company_members(user_id, is_active);

create index if not exists idx_company_members_company
  on public.company_members(company_id, role);

alter table public.company_members enable row level security;

create trigger update_company_members_updated_at
  before update on public.company_members
  for each row execute function update_updated_at_column();

-- Backfill memberships from legacy companies.user_id
insert into public.company_members (company_id, user_id, role, is_active)
select c.id, c.user_id, 'Owner', true
from public.companies c
on conflict (company_id, user_id) do nothing;

-- Backfill profiles from auth metadata where possible
insert into public.profiles (id, full_name, mobile)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User'),
  u.raw_user_meta_data->>'mobile'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ─── RLS helpers ────────────────────────────────────────────────────────────
create or replace function public.user_belongs_to_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
      and cm.is_active = true
  );
$$;

create or replace function public.user_company_role(p_company_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cm.role
  from public.company_members cm
  where cm.company_id = p_company_id
    and cm.user_id = auth.uid()
    and cm.is_active = true
  limit 1;
$$;

grant execute on function public.user_belongs_to_company(uuid) to authenticated;
grant execute on function public.user_company_role(uuid) to authenticated;

create or replace function public.user_has_company_role(p_company_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
      and cm.role = any(p_roles)
      and cm.is_active = true
  );
$$;

grant execute on function public.user_has_company_role(uuid, text[]) to authenticated;

-- Auto-create Owner membership when company is inserted (backward compatible)
create or replace function public.create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, role, is_active)
  values (new.id, new.user_id, 'Owner', true)
  on conflict (company_id, user_id) do nothing;

  insert into public.profiles (id, full_name, mobile)
  select
    new.user_id,
    coalesce(p.full_name, split_part(u.email, '@', 1), 'User'),
    p.mobile
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = new.user_id
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_company_created_membership on public.companies;
create trigger on_company_created_membership
  after insert on public.companies
  for each row execute function public.create_owner_membership();

-- ─── Company registration RPC ───────────────────────────────────────────────
create or replace function public.register_company_account(
  p_company_name text,
  p_owner_name text,
  p_mobile text,
  p_gst_number text default null,
  p_address text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_company_id uuid;
  v_email text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.company_members
    where user_id = v_user_id and is_active = true
  ) then
    select company_id into v_company_id
    from public.company_members
    where user_id = v_user_id and is_active = true
    order by created_at asc
    limit 1;
    return v_company_id;
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.profiles (id, full_name, mobile)
  values (v_user_id, p_owner_name, p_mobile)
  on conflict (id) do update
    set full_name = excluded.full_name,
        mobile = excluded.mobile,
        updated_at = now();

  insert into public.companies (
    user_id, name, gst_number, address, phone, email, is_active
  )
  values (
    v_user_id, p_company_name, p_gst_number, p_address, p_mobile, v_email, true
  )
  returning id into v_company_id;

  insert into public.challan_sequences (company_id, last_number)
  values (v_company_id, 0)
  on conflict (company_id) do nothing;

  return v_company_id;
end;
$$;

grant execute on function public.register_company_account(text, text, text, text, text) to authenticated;

-- Provision company after email confirmation using signup metadata
create or replace function public.provision_pending_company_account()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_meta jsonb;
  v_company_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.company_members
    where user_id = v_user_id and is_active = true
  ) then
    select company_id into v_company_id
    from public.company_members
    where user_id = v_user_id and is_active = true
    order by created_at asc
    limit 1;
    return v_company_id;
  end if;

  select raw_user_meta_data into v_meta
  from auth.users where id = v_user_id;

  if v_meta->>'company_name' is null then
    return null;
  end if;

  return public.register_company_account(
    v_meta->>'company_name',
    coalesce(v_meta->>'name', v_meta->>'owner_name', 'Owner'),
    coalesce(v_meta->>'mobile', ''),
    v_meta->>'gst_number',
    coalesce(v_meta->>'company_address', v_meta->>'address')
  );
end;
$$;

grant execute on function public.provision_pending_company_account() to authenticated;

-- ─── Replace companies RLS with membership-based policies ───────────────────
drop policy if exists "Users can view their own companies" on public.companies;
drop policy if exists "Users can insert their own companies" on public.companies;
drop policy if exists "Users can update their own companies" on public.companies;
drop policy if exists "Users can delete their own companies" on public.companies;

create policy "Members can view their companies"
  on public.companies for select
  using (public.user_belongs_to_company(id));

create policy "Owners can insert companies"
  on public.companies for insert
  with check (auth.uid() = user_id);

create policy "Members can update their companies"
  on public.companies for update
  using (public.user_belongs_to_company(id));

create policy "Owners can delete their companies"
  on public.companies for delete
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = companies.id
        and cm.user_id = auth.uid()
        and cm.role = 'Owner'
        and cm.is_active = true
    )
  );

-- ─── Company members RLS ─────────────────────────────────────────────────────
create policy "Users can view own memberships"
  on public.company_members for select
  using (user_id = auth.uid());

create policy "Members can view company memberships"
  on public.company_members for select
  using (public.user_belongs_to_company(company_id));

create policy "Owners and admins can manage memberships"
  on public.company_members for all
  using (public.user_has_company_role(company_id, array['Owner', 'Admin']))
  with check (public.user_has_company_role(company_id, array['Owner', 'Admin']));

-- ─── Replace child-table RLS policies ───────────────────────────────────────
drop policy if exists "Users can access customers of their companies" on public.customers;
create policy "Members can access customers"
  on public.customers for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

drop policy if exists "Users can access products of their companies" on public.products;
create policy "Members can access products"
  on public.products for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

drop policy if exists "Users can access challans of their companies" on public.challans;
create policy "Members can access challans"
  on public.challans for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

drop policy if exists "Users can access challan items of their companies" on public.challan_items;
create policy "Members can access challan items"
  on public.challan_items for all
  using (
    exists (
      select 1 from public.challans c
      where c.id = challan_items.challan_id
        and public.user_belongs_to_company(c.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.challans c
      where c.id = challan_items.challan_id
        and public.user_belongs_to_company(c.company_id)
    )
  );

drop policy if exists "Users can manage sequences for their companies" on public.challan_sequences;
create policy "Members can manage challan sequences"
  on public.challan_sequences for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

drop policy if exists "Users can access payments for their company challans" on public.challan_payments;
create policy "Members can access challan payments"
  on public.challan_payments for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- ─── Update challan number generator ────────────────────────────────────────
create or replace function public.generate_challan_number(p_company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if not public.user_belongs_to_company(p_company_id) then
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

-- ─── Storage: allow members to manage company logos ─────────────────────────
drop policy if exists "Users can upload logos for their companies" on storage.objects;
drop policy if exists "Users can update their logos" on storage.objects;
drop policy if exists "Users can delete their logos" on storage.objects;

create policy "Members can upload company logos"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos'
    and (
      public.user_belongs_to_company(((storage.foldername(name))[1])::uuid)
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

create policy "Members can update company logos"
  on storage.objects for update
  using (
    bucket_id = 'company-logos'
    and (
      public.user_belongs_to_company(((storage.foldername(name))[1])::uuid)
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

create policy "Members can delete company logos"
  on storage.objects for delete
  using (
    bucket_id = 'company-logos'
    and (
      public.user_belongs_to_company(((storage.foldername(name))[1])::uuid)
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );
