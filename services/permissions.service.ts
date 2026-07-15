import { createClient } from '@/lib/supabase/client';
import {
  emptyPermissionMatrix,
  fullPermissionMatrix,
} from '@/constants/permissions';
import { matrixFromRows, ownerMatrix } from '@/lib/permissions';
import type { PermissionMatrix } from '@/types/permissions';

const supabase = () => createClient();

/** Legacy members with no permission rows keep working until an owner configures them. */
function legacyFallbackMatrix(role: string | null | undefined): PermissionMatrix {
  if (role === 'Admin' || role === 'Manager' || role === 'Accountant') {
    const matrix = fullPermissionMatrix();
    matrix.employees = {
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_export: false,
    };
    return matrix;
  }
  // Staff without an explicit matrix: dashboard only
  const matrix = emptyPermissionMatrix();
  matrix.dashboard = {
    can_view: true,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_export: false,
  };
  return matrix;
}

export async function getEmployeePermissions(
  companyId: string,
  userId: string
): Promise<{ matrix: PermissionMatrix; hasRows: boolean }> {
  const { data, error } = await supabase()
    .from('employee_permissions')
    .select('module, can_view, can_create, can_edit, can_delete, can_export')
    .eq('company_id', companyId)
    .eq('user_id', userId);

  if (error) throw error;
  const rows = data ?? [];
  return {
    matrix: matrixFromRows(rows),
    hasRows: rows.length > 0,
  };
}

export async function getPermissionsForSessionUser(
  companyId: string,
  userId: string,
  role: string | null | undefined
): Promise<PermissionMatrix> {
  if (role === 'Owner') {
    return ownerMatrix();
  }
  const { matrix, hasRows } = await getEmployeePermissions(companyId, userId);
  if (!hasRows) {
    return legacyFallbackMatrix(role);
  }
  return matrix;
}
