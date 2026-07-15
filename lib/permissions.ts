import {
  emptyPermissionMatrix,
  fullPermissionMatrix,
  type PermissionAction,
  type PermissionModule,
} from '@/constants/permissions';
import type { PermissionFlags, PermissionMatrix } from '@/types/permissions';

export function actionToFlag(action: PermissionAction): keyof PermissionFlags {
  switch (action) {
    case 'view':
      return 'can_view';
    case 'create':
      return 'can_create';
    case 'edit':
      return 'can_edit';
    case 'delete':
      return 'can_delete';
    case 'export':
      return 'can_export';
  }
}

export function hasPermission(
  matrix: PermissionMatrix | null | undefined,
  module: PermissionModule,
  action: PermissionAction,
  options?: { isOwner?: boolean }
): boolean {
  if (options?.isOwner) return true;
  if (!matrix) return false;
  const flags = matrix[module];
  if (!flags) return false;
  return Boolean(flags[actionToFlag(action)]);
}

export function matrixFromRows(
  rows: Array<{
    module: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_export: boolean;
  }>
): PermissionMatrix {
  const matrix = emptyPermissionMatrix();
  for (const row of rows) {
    const module = row.module as PermissionModule;
    if (!(module in matrix)) continue;
    matrix[module] = {
      can_view: row.can_view,
      can_create: row.can_create,
      can_edit: row.can_edit,
      can_delete: row.can_delete,
      can_export: row.can_export,
    };
  }
  return matrix;
}

export function ownerMatrix(): PermissionMatrix {
  return fullPermissionMatrix();
}

export function sanitizeEmployeeMatrix(matrix: PermissionMatrix): PermissionMatrix {
  const next = emptyPermissionMatrix();
  for (const module of Object.keys(next) as PermissionModule[]) {
    const flags = matrix[module] ?? next[module];
    next[module] = {
      can_view: Boolean(flags.can_view),
      can_create: Boolean(flags.can_create),
      can_edit: Boolean(flags.can_edit),
      can_delete: Boolean(flags.can_delete),
      can_export: Boolean(flags.can_export),
    };
    // Employees never receive Employee Management access via matrix
    if (module === 'employees') {
      next[module] = {
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_export: false,
      };
    }
  }
  return next;
}

export function matrixToRows(
  companyId: string,
  userId: string,
  matrix: PermissionMatrix
): Array<{
  company_id: string;
  user_id: string;
  module: PermissionModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}> {
  const sanitized = sanitizeEmployeeMatrix(matrix);
  return (Object.keys(sanitized) as PermissionModule[])
    .filter((module) => module !== 'employees')
    .map((module) => ({
      company_id: companyId,
      user_id: userId,
      module,
      ...sanitized[module],
    }));
}
