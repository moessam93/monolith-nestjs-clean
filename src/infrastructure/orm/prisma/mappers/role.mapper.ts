import { Role } from '../../../../domain/entities/role';
import { BaseMapper } from './base.mapper';

export class RoleMapper {
  // Using generic methods - much cleaner!
  static toDomain(prismaRole: any): Role {
    return BaseMapper.genericToDomain(
      Role,
      prismaRole,
      ['id', 'key', 'nameEn', 'nameAr']
    );
  }

  static toPrisma(role: Role) {
    return BaseMapper.genericToPrisma(role);
  }

  static toPrismaCreate(role: Role) {
    return BaseMapper.baseToPrismaCreate(role, RoleMapper.toPrisma);
  }

  static toPrismaUpdate(role: Role) {
    return BaseMapper.baseToPrismaUpdate(role, RoleMapper.toPrisma);
  }
}
