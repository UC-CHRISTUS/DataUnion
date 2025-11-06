/**
 * User Roles Constants
 * 
 * Enum values stored in database (public.user_role)
 * These values MUST match the database enum exactly.
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  ENCODER: 'encoder',
  FINANCE: 'finance',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Role Display Names (Spanish for UI)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.ENCODER]: 'Codificador',
  [USER_ROLES.FINANCE]: 'Finanzas',
};

/**
 * Role Descriptions (Spanish for UI)
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Acceso completo al sistema',
  [USER_ROLES.ENCODER]: 'Codificación de episodios',
  [USER_ROLES.FINANCE]: 'Gestión financiera y reportes',
};

/**
 * Get all roles as array for dropdowns
 */
export const getRoleOptions = () => {
  return Object.values(USER_ROLES).map(role => ({
    value: role,
    label: ROLE_LABELS[role as UserRole],
    description: ROLE_DESCRIPTIONS[role as UserRole],
  }));
};

