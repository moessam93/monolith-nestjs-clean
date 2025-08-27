import { User } from '../entities/user';

export interface IUsersRepo {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  list(options?: { page?: number; limit?: number; search?: string }): Promise<{ data: User[]; total: number }>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  setRoles(userId: string, roleKeys: string[]): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  count(): Promise<number>;
}
