import { UserRole } from '../../../../domain/entities/user-role';
import { BaseMapper } from './base.mapper';

export class UserRolesMapper {
  static toDomain(prismaUserRole: any): UserRole {
    return BaseMapper.genericToDomain(
      UserRole,
      prismaUserRole,
      ['id', 'userId', 'roleId']
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