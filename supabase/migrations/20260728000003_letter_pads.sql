-- Letter Pads module

create table if not exists public.letter_pads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  letter_date date not null default current_date,
  subject text,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_letter_pads_company
  on public.letter_pads(company_id, created_at desc);

alter table public.letter_pads enable row level security;

create policy "Members can access letter pads"
  on public.letter_pads for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create or replace function public.set_letter_pads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_letter_pads_updated_at on public.letter_pads;
create trigger update_letter_pads_updated_at
  before update on public.letter_pads
  for each row execute function public.set_letter_pads_updated_at();
