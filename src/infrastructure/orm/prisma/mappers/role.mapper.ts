import { Role } from '../../../../domain/entities/role';

export class RoleMapper {
  static toDomain(prismaRole: any): Role {
    return new Role(
      prismaRole.id,
      prismaRole.key,
      prismaRole.nameEn,
      prismaRole.nameAr,
    );
  }

  static toPrisma(role: Role) {
    return {
      id: role.id,
      key: role.key,
      nameEn: role.nameEn,
      nameAr: role.nameAr,
    };
  }

  static toPrismaCreate(role: Role) {
    const data = RoleMapper.toPrisma(role);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    return data;
  }

  static toPrismaUpdate(role: Role) {
    const data = RoleMapper.toPrisma(role);
    // Remove id for updates
    delete (data as any).id;
    return data;
  }
}
