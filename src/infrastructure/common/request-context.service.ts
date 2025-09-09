import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

export interface JwtUser {
  sub: string;      // User ID
  email: string;
  name: string;
  roles: string[];
}

export interface RequestUser extends JwtUser {
  // Can extend with additional user properties if needed
}

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private _manualUserId?: string;
  private _manualUserName?: string;
  private _manualUserRoles?: string[];

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  /**
   * Gets the current user ID from JWT token or manual override
   */
  get userId(): string | undefined {
    const user = this.request.user as RequestUser;
    return user?.sub ?? this._manualUserId;
  }

  /**
   * Gets the current user name from JWT token or manual override
   */
  get userName(): string | undefined {
    const user = this.request.user as RequestUser;
    return user?.name ?? this._manualUserName;
  }

  /**
   * Gets the current user email from JWT token
   */
  get userEmail(): string | undefined {
    const user = this.request.user as RequestUser;
    return user?.email;
  }

  /**
   * Gets the current user roles from JWT token or manual override
   * Always returns an array of role keys (strings)
   */
  get userRoles(): string[] {
    const user = this.request.user as RequestUser;
    const roles = user?.roles ?? this._manualUserRoles ?? [];
    
    // Ensure we always return role keys (strings), handling different formats
    return roles.map((role: any) => {
      // If it's already a string, return as is
      if (typeof role === 'string') {
        return role;
      }
      
      // If it's an object with a key property, extract the key
      if (role && typeof role === 'object' && role.key) {
        return role.key;
      }
      
      return null;
    }).filter(Boolean) as string[];
  }

  /**
   * Gets the complete user object from JWT token
   */
  get currentUser(): RequestUser | undefined {
    return this.request.user as RequestUser;
  }

  /**
   * Checks if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  /**
   * Checks if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Checks if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Sets manual user context for testing or system operations
   * Similar to your .NET SetManualUserContext method
   */
  setManualUserContext(userId: string, userName?: string, userRoles?: string[]): void {
    this._manualUserId = userId;
    this._manualUserName = userName;
    this._manualUserRoles = userRoles;
  }

  /**
   * Clears manual user context
   */
  clearManualUserContext(): void {
    this._manualUserId = undefined;
    this._manualUserName = undefined;
    this._manualUserRoles = undefined;
  }

  /**
   * Checks if the current request is authenticated
   */
  get isAuthenticated(): boolean {
    return !!this.userId;
  }

  /**
   * Gets request metadata for logging purposes
   */
  getRequestMetadata(): { 
    ip?: string; 
    userAgent?: string; 
    method?: string; 
    url?: string; 
  } {
    return {
      ip: this.request.ip,
      userAgent: this.request.get('User-Agent'),
      method: this.request.method,
      url: this.request.url,
    };
  }
}
