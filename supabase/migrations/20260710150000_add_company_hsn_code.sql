-- Add per-company default HSN code
alter table public.companies
  add column if not exists hsn_code text;
