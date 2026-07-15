import { createClient } from '@/lib/supabase/client';
import type { CompanyMember } from '@/types/membership';
import type { UserRole } from '@/constants/auth';

const supabase = () => createClient();

function mapMember(row: Record<string, unknown>): CompanyMember {
  return row as unknown as CompanyMember;
}

export async function getCompanyMemberships(userId: string): Promise<CompanyMember[]> {
  const { data, error } = await supabase()
    .from('company_members')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapMember);
}

/** Includes inactive rows — used to block inactive employee logins. */
export async function getMembershipsIncludingInactive(
  userId: string
): Promise<CompanyMember[]> {
  const { data, error } = await supabase()
    .from('company_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapMember);
}

export async function getPrimaryMembership(userId: string): Promise<CompanyMember | null> {
  const memberships = await getCompanyMemberships(userId);
  return memberships[0] ?? null;
}

/**
 * Returns an error message when the user only has inactive memberships.
 * Owners / users with at least one active membership pass.
 */
export async function getInactiveAccountMessage(
  userId: string
): Promise<string | null> {
  const all = await getMembershipsIncludingInactive(userId);
  if (all.length === 0) return null;
  const hasActive = all.some((m) => m.is_active);
  if (hasActive) return null;
  return 'Your account is inactive. Contact your company owner.';
}

export async function getUserRoleForCompany(
  userId: string,
  companyId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase()
    .from('company_members')
    .select('role')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return (data?.role as UserRole | undefined) ?? null;
}
