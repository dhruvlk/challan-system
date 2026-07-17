-- Fix company creation RLS issue:
-- During INSERT ... RETURNING, the STABLE function `user_belongs_to_company` 
-- does not see the new row in company_members inserted by the AFTER INSERT trigger.
-- We fix this by allowing the creator (user_id) to SELECT their company directly.

drop policy if exists "Members can view their companies" on public.companies;
create policy "Members can view their companies"
  on public.companies for select
  using (
    auth.uid() = user_id OR
    public.user_belongs_to_company(id)
  );
