-- Delivery Challans module (parallel to Challans, separate tables)

create table if not exists public.delivery_challans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete restrict not null,
  challan_number text not null,
  date date not null default current_date,
  quality text,
  broker text,
  delivered_by text,
  remarks text,
  notes text,
  status text not null default 'Draft'
    check (status in ('Draft', 'Pending', 'Delivered', 'Returned', 'Cancelled')),
  total_pieces numeric(12, 2) not null default 0,
  total_meters numeric(14, 2) not null default 0,
  total_weight numeric(14, 2) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, challan_number)
);

create table if not exists public.delivery_challan_items (
  id uuid primary key default gen_random_uuid(),
  delivery_challan_id uuid references public.delivery_challans(id) on delete cascade not null,
  sort_order integer not null default 0,
  taka_no text,
  meters numeric(14, 2) not null default 0,
  weight numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_challan_sequences (
  company_id uuid primary key references public.companies(id) on delete cascade,
  last_number integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_delivery_challans_company
  on public.delivery_challans(company_id, created_at desc);

create index if not exists idx_delivery_challans_customer
  on public.delivery_challans(customer_id);

create index if not exists idx_delivery_challan_items_parent
  on public.delivery_challan_items(delivery_challan_id, sort_order);

alter table public.delivery_challans enable row level security;
alter table public.delivery_challan_items enable row level security;
alter table public.delivery_challan_sequences enable row level security;

create policy "Members can access delivery challans"
  on public.delivery_challans for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Members can access delivery challan items"
  on public.delivery_challan_items for all
  using (
    exists (
      select 1 from public.delivery_challans dc
      where dc.id = delivery_challan_items.delivery_challan_id
        and public.user_belongs_to_company(dc.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.delivery_challans dc
      where dc.id = delivery_challan_items.delivery_challan_id
        and public.user_belongs_to_company(dc.company_id)
    )
  );

create policy "Members can manage delivery challan sequences"
  on public.delivery_challan_sequences for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create or replace function public.set_delivery_challans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_delivery_challans_updated_at on public.delivery_challans;
create trigger update_delivery_challans_updated_at
  before update on public.delivery_challans
  for each row execute function public.set_delivery_challans_updated_at();

drop trigger if exists update_delivery_challan_items_updated_at on public.delivery_challan_items;
create trigger update_delivery_challan_items_updated_at
  before update on public.delivery_challan_items
  for each row execute function public.set_delivery_challans_updated_at();

create or replace function public.generate_delivery_challan_number(p_company_id uuid)
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

  insert into public.delivery_challan_sequences (company_id, last_number)
  values (p_company_id, 0)
  on conflict (company_id) do nothing;

  update public.delivery_challan_sequences
  set last_number = last_number + 1,
      updated_at = now()
  where company_id = p_company_id
  returning last_number into v_next;

  return 'DC-' || lpad(v_next::text, 6, '0');
end;
$$;

grant execute on function public.generate_delivery_challan_number(uuid) to authenticated;
