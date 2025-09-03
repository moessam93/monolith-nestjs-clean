import { UserRole } from './user-role';
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public userRoles: UserRole[],
    public phoneNumber?: string,
    public phoneNumberCountryCode?: string,
    public passwordHash?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
