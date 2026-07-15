-- Fix employee management: coworker profile reads + reliable employee listing RPC

-- Owners/admins and fellow company members can read coworker profiles (incl. inactive staff)
drop policy if exists "Members can view company profiles" on public.profiles;
create policy "Members can view company profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.company_members viewer
      join public.company_members peer
        on peer.company_id = viewer.company_id
       and peer.user_id = profiles.id
      where viewer.user_id = auth.uid()
        and viewer.is_active = true
    )
  );

-- Listing helper used by the app (bypasses profile RLS edges safely)
create or replace function public.list_company_employees(p_company_id uuid)
returns table (
  membership_id uuid,
  user_id uuid,
  company_id uuid,
  role text,
  designation text,
  is_active boolean,
  invited_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  full_name text,
  email text,
  mobile text,
  avatar_url text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.user_has_company_role(p_company_id, array['Owner']::text[]) then
    raise exception 'Only the company owner can list employees';
  end if;

  return query
  select
    cm.id as membership_id,
    cm.user_id,
    cm.company_id,
    cm.role,
    cm.designation,
    cm.is_active,
    cm.invited_by,
    cm.created_at,
    cm.updated_at,
    coalesce(p.full_name, split_part(au.email, '@', 1), 'Employee') as full_name,
    coalesce(p.email, au.email, '') as email,
    p.mobile,
    p.avatar_url
  from public.company_members cm
  left join public.profiles p on p.id = cm.user_id
  left join auth.users au on au.id = cm.user_id
  where cm.company_id = p_company_id
    and cm.role <> 'Owner'
  order by cm.created_at desc;
end;
$$;

grant execute on function public.list_company_employees(uuid) to authenticated;
