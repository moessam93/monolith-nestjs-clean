export class RoleKey {
  public static readonly SUPER_ADMIN = 'SuperAdmin';
  public static readonly ADMIN = 'Admin';
  public static readonly EXECUTIVE = 'Executive';

  private static readonly VALID_ROLES = [
    RoleKey.SUPER_ADMIN,
    RoleKey.ADMIN,
    RoleKey.EXECUTIVE,
  ];

  private readonly _value: string;

  constructor(value: string) {
    if (!RoleKey.isValid(value)) {
      throw new Error(`Invalid role key: ${value}`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static isValid(value: string): boolean {
    return RoleKey.VALID_ROLES.includes(value);
  }

  static getAllRoles(): string[] {
    return [...RoleKey.VALID_ROLES];
  }

  equals(other: RoleKey): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  isSuperAdmin(): boolean {
    return this._value === RoleKey.SUPER_ADMIN;
  }

  isAdmin(): boolean {
    return this._value === RoleKey.ADMIN;
  }

  isExecutive(): boolean {
    return this._value === RoleKey.EXECUTIVE;
  }
}
