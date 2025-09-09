import { UserRole } from '../../../../domain/entities/user-role';
import { BaseMapper } from './base.mapper';
import { RoleMapper } from './role.mapper';

export class UserRolesMapper {
  static toDomain(prismaUserRole: any): UserRole {
    return BaseMapper.genericToDomainWithProcessors(
      UserRole,
      prismaUserRole,
      ['id', 'userId', 'roleId', 'role'],
      {
        role: (roleData: any) => roleData ? RoleMapper.toDomain(roleData) : undefined
      }
    );
  }

  static toPrisma(userRole: UserRole) {
    return BaseMapper.genericToPrisma(userRole);
  }

  static toPrismaCreate(userRole: UserRole) {
    return BaseMapper.baseToPrismaCreate(userRole, UserRolesMapper.toPrisma);
  }

  static toPrismaUpdate(userRole: UserRole) {
    return BaseMapper.baseToPrismaUpdate(userRole, UserRolesMapper.toPrisma);
  }
}