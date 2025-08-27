export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public roles: string[], // ['SuperAdmin'|'Admin'|'Executive']
    public phoneNumber?: string,
    public phoneCountryCode?: string,
    public passwordHash?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.roles.includes(role));
  }

  addRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  removeRole(role: string): void {
    this.roles = this.roles.filter(r => r !== role);
  }

  setRoles(roles: string[]): void {
    this.roles = [...roles];
  }
}
