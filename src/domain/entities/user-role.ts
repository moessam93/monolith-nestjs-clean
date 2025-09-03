export class UserRole {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly roleId: number,
  ) {}
}