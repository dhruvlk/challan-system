-- Create companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  logo_url text,
  gst_number text,
  address text,
  phone text,
  email text,
  pan_number text,
  bank_details text,
  signature_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.companies enable row level security;

-- Policies for companies
create policy "Users can view their own companies"
  on companies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own companies"
  on companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own companies"
  on companies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own companies"
  on companies for delete
  using (auth.uid() = user_id);

-- Create parties table
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  contact_person text,
  mobile text,
  gst_number text,
  address text,
  city text,
  state text,
  pincode text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.parties enable row level security;

-- Policies for parties
create policy "Users can access parties of their companies"
  on parties for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = parties.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Create challans table
create table public.challans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  challan_number text not null,
  date date not null,
  party_id uuid references public.parties(id) on delete restrict not null,
  bill_number text,
  vehicle_number text,
  driver_name text,
  driver_mobile text,
  delivery_location text,
  broker text,
  payment_within_value integer,
  payment_within_unit text,
  due_date date,
  amount_in_words text,
  notes text,
  status text not null default 'Draft' check (status in ('Draft', 'Pending', 'Delivered', 'Returned', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (company_id, challan_number)
);

alter table public.challans enable row level security;

-- Policies for challans
create policy "Users can access challans of their companies"
  on challans for all
  using (
    exists (
      select 1 from public.companies
      where companies.id = challans.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Create challan_items table
create table public.challan_items (
  id uuid primary key default gen_random_uuid(),
  challan_id uuid references public.challans(id) on delete cascade not null,
  quality text,
  fabric_name text,
  color text,
  design text,
  roll_number text,
  lot_number text,
  meter numeric(10, 2),
  weight numeric(10, 2),
  rate numeric(10, 2),
  amount numeric(10, 2),
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.challan_items enable row level security;

-- Policies for challan_items
create policy "Users can access challan items of their companies"
  on challan_items for all
  using (
    exists (
      select 1 from public.challans
      join public.companies on companies.id = challans.company_id
      where challans.id = challan_items.challan_id
      and companies.user_id = auth.uid()
    )
  );

-- Function to handle timestamp update
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply triggers for updated_at
create trigger update_companies_updated_at
    before update on companies
    for each row
    execute function update_updated_at_column();

create trigger update_parties_updated_at
    before update on parties
    for each row
    execute function update_updated_at_column();

create trigger update_challans_updated_at
    before update on challans
    for each row
    execute function update_updated_at_column();

create trigger update_challan_items_updated_at
    before update on challan_items
    for each row
    execute function update_updated_at_column();
