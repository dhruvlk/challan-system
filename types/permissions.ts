import type {
  PermissionAction,
  PermissionModule,
} from '@/constants/permissions';

export type PermissionFlags = {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
};

export type EmployeePermission = PermissionFlags & {
  id?: string;
  company_id: string;
  user_id: string;
  module: PermissionModule;
  created_at?: string;
  updated_at?: string;
};

export type PermissionMatrix = Record<PermissionModule, PermissionFlags>;

export type EmployeeStatus = 'active' | 'inactive';

export type Employee = {
  membership_id: string;
  user_id: string;
  company_id: string;
  role: string;
  designation: string | null;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  mobile: string | null;
  avatar_url: string | null;
  permissions: PermissionMatrix;
};

export type CreateEmployeeInput = {
  companyId: string;
  fullName: string;
  email: string;
  mobile?: string | null;
  password?: string;
  sendInvite?: boolean;
  designation?: string | null;
  isActive?: boolean;
  permissions: PermissionMatrix;
};

export type UpdateEmployeeInput = {
  companyId: string;
  membershipId: string;
  userId: string;
  fullName: string;
  mobile?: string | null;
  designation?: string | null;
  isActive: boolean;
  password?: string;
  permissions: PermissionMatrix;
};

export type { PermissionAction, PermissionModule };
