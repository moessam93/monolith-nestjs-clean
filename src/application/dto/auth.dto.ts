export interface LoginInput {
  email: string;
  password: string;
  expiresIn?: string;
}

export interface LoginOutput {
  id: string;
  email: string;
  name: string;
  roles: UserRoleOutput[];
  access_token: string;
  expiredAt: Date;
}

export interface UserValidationInput {
  userId: string;
}

export interface UserValidationOutput {
  id: string;
  email: string;
  name: string;
  roles: UserRoleOutput[];
}

export interface UserRoleOutput {
  id: number;
  nameEn: string;
  nameAr: string;
  key: string;
}
