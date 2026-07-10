import { createClient } from '@/lib/supabase/client';
import { mapCompany, companyToInsert } from '@/lib/mappers';
import type { Company } from '@/types';

const supabase = () => createClient();

const SELECTED_KEY = 'challan_system_selected_company_id';

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase()
    .from('companies')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data ?? []).map(mapCompany);
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  const { data, error } = await supabase()
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return mapCompany(data);
}

export async function getActiveCompany(companyId: string): Promise<Company | undefined> {
  const company = await getCompanyById(companyId);
  return company ?? undefined;
}

export async function getSelectedCompanyId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_KEY);
}

export async function setSelectedCompanyId(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_KEY, id);

  await supabase()
    .from('companies')
    .update({ is_active: false })
    .neq('id', id);

  await supabase()
    .from('companies')
    .update({ is_active: true })
    .eq('id', id);
}

export async function addCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'> & { user_id: string }): Promise<Company> {
  const { data, error } = await supabase()
    .from('companies')
    .insert(companyToInsert(company))
    .select()
    .single();

  if (error) throw error;
  return mapCompany(data);
}

export async function updateCompany(company: Company): Promise<Company> {
  const { id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest } = company;
  const { data, error } = await supabase()
    .from('companies')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCompany(data);
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase().from('companies').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadCompanyLogo(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase().storage.from('company-logos').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase().storage.from('company-logos').getPublicUrl(path);
  return data.publicUrl;
}
