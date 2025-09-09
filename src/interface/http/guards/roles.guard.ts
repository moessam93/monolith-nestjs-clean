import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // ✅ Proper error handling for missing user
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ✅ Proper error handling for missing roles
    if (!user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('User has no roles assigned');
    }

    // ✅ Extract role keys from user.roles (handles both string arrays and UserRole objects)
    const userRoleKeys = this.extractRoleKeys(user.roles);
    
    if (userRoleKeys.length === 0) {
      throw new ForbiddenException('User has no valid roles assigned');
    }

    // ✅ Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => userRoleKeys.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoleKeys.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Extract role keys from user.roles array, handling different formats:
   * - Array of strings (role keys) - for JWT payload
   * - Array of UserRole objects with role.key - for full user objects
   */
  private extractRoleKeys(roles: any[]): string[] {
    return roles
      .map((role) => {
        // If it's a string, return as is
        if (typeof role === 'string') {
          return role;
        }
        
        // If it's a UserRole object with a role property
        if (role && typeof role === 'object' && role.role && role.role.key) {
          return role.role.key;
        }
        
        // If it's an object with a key property (direct role object)
        if (role && typeof role === 'object' && role.key) {
          return role.key;
        }
        
        return null;
      })
      .filter(Boolean) as string[];
  }
}
