import { createClient } from '@/lib/supabase/client';
import type { CompanyBankAccount } from '@/types';
import type { CompanyBankAccountRow } from '@/types/database';

const supabase = () => createClient();

function mapBank(row: CompanyBankAccountRow): CompanyBankAccount {
  return row;
}

export async function getCompanyBankAccounts(companyId: string): Promise<CompanyBankAccount[]> {
  const { data, error } = await supabase()
    .from('company_bank_accounts')
    .select('*')
    .eq('company_id', companyId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapBank);
}

export async function upsertCompanyBankAccount(
  input: Omit<CompanyBankAccount, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<CompanyBankAccount> {
  const payload = {
    id: input.id,
    company_id: input.company_id,
    bank_name: input.bank_name,
    account_name: input.account_name ?? null,
    account_number: input.account_number ?? null,
    ifsc_code: input.ifsc_code ?? null,
    branch: input.branch ?? null,
    upi_id: input.upi_id ?? null,
    is_default: input.is_default ?? false,
  };

  const { data, error } = await supabase()
    .from('company_bank_accounts')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapBank(data);
}

export async function deleteCompanyBankAccount(id: string): Promise<void> {
  const { error } = await supabase().from('company_bank_accounts').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultCompanyBankAccount(
  companyId: string,
  accountId: string
): Promise<void> {
  const { error } = await supabase()
    .from('company_bank_accounts')
    .update({ is_default: true })
    .eq('company_id', companyId)
    .eq('id', accountId);

  if (error) throw error;
}
