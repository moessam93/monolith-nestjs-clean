import { Role } from '../entities/role';

export interface IRolesRepo {
  findByKey(key: string): Promise<Role | null>;
  findByKeys(keys: string[]): Promise<Role[]>;
  exists(key: string): Promise<boolean>;
  ensureKeys(keys: string[]): Promise<void>;
  list(): Promise<Role[]>;
  create(role: Role): Promise<Role>;
  update(role: Role): Promise<Role>;
  delete(id: number): Promise<void>;
}
