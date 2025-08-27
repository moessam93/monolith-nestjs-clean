import { DomainError } from './domain-error';

export class RoleNotFoundError extends DomainError {
  readonly code = 'ROLE_NOT_FOUND';
  
  constructor(roles: string[]) {
    super(`One or more roles not found: ${roles.join(', ')}`);
  }
}
