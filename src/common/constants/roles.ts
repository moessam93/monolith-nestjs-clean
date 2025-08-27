export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  EXECUTIVE: 'Executive',
} as const;

export const ROLE_KEYS = Object.values(ROLES);

export type RoleKey = typeof ROLES[keyof typeof ROLES];
