import { User } from '../../../../domain/entities/user';
import { BaseMapper } from './base.mapper';
import { UserRolesMapper } from './userroles.mapper';

export class UserMapper {
  static toDomain(prismaUser: any): User {
    return BaseMapper.genericToDomainWithProcessors(
      User,
      prismaUser,
      ['id', 'name', 'email', 'userRoles', 'phoneNumber', 'phoneNumberCountryCode', 'passwordHash', 'createdAt', 'updatedAt'],
      {
        userRoles: (userRolesArray: any[]) => 
          (userRolesArray ?? [])
            .map((userRole: any) => UserRolesMapper.toDomain(userRole))
            .filter(Boolean)
      }
    );
  }

  static toPrisma(user: User) {
    return BaseMapper.genericToPrismaWithProcessors(
      user,
      [], // No fields to exclude
      {
        // Convert empty/falsy values to null for optional fields
        phoneNumber: (value: any) => value || null,
        phoneNumberCountryCode: (value: any) => value || null,
        // Ensure passwordHash is properly typed (non-null assertion)
        passwordHash: (value: any) => value!,
      }
    );
  }

  static toPrismaCreate(user: User) {
    return BaseMapper.baseToPrismaCreate(
      user,
      UserMapper.toPrisma,
      (data) => {
        // Entity-specific validation for user creation
        if (!data.passwordHash) {
          throw new Error('Password hash is required for user creation');
        }
      }
    );
  }

  static toPrismaUpdate(user: User) {
    return BaseMapper.baseToPrismaUpdate(user, UserMapper.toPrisma);
  }
}
