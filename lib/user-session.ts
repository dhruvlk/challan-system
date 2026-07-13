import type { User } from '@/types/auth';
import { isUserRole } from '@/types/auth';
import type { UserRole } from '@/constants/auth';
import type { Profile } from '@/types/membership';
import type { CompanyMember } from '@/types/membership';

export function buildAppUser(
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  profile: Profile | null,
  membership: CompanyMember | null
): User {
  const metadataRole = authUser.user_metadata?.role as string | undefined;
  let role: UserRole = membership?.role ?? 'Staff';
  if (!membership?.role && isUserRole(metadataRole)) {
    role = metadataRole;
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name:
      profile?.full_name
      ?? (authUser.user_metadata?.name as string)
      ?? authUser.email?.split('@')[0]
      ?? 'User',
    mobile: profile?.mobile ?? (authUser.user_metadata?.mobile as string) ?? null,
    role,
    companyId: membership?.company_id ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}
