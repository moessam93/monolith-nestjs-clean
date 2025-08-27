import { DomainError } from './domain-error';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  
  constructor(email: string) {
    super(`User already exists with email: ${email}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  
  constructor() {
    super('Invalid credentials provided');
  }
}

export class InsufficientPermissionsError extends DomainError {
  readonly code = 'INSUFFICIENT_PERMISSIONS';
  
  constructor(requiredRole?: string) {
    super(requiredRole ? `Insufficient permissions. Required role: ${requiredRole}` : 'Insufficient permissions');
  }
}
