import { Role } from "./role";

export class UserRole {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly roleId: number,
    public readonly role?: Role,
  ) {}
}