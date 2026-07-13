export const USER_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'Accountant',
  'Staff',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const AUTH_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
} as const;

export type AuthMethod = (typeof AUTH_METHODS)[keyof typeof AUTH_METHODS];
