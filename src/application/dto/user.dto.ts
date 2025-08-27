export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  roleKeys?: string[];
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  roleKeys?: string[];
}

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  roles: RoleOutput[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleOutput {
  id: number;
  key: string;
  nameEn: string;
  nameAr: string;
}

export interface AssignRolesInput {
  userId: string;
  roleKeys: string[];
}

export interface ListUsersInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BootstrapSuperAdminInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
}
