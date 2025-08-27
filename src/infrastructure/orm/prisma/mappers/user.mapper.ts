import { User } from '../../../../domain/entities/user';

export class UserMapper {
  static toDomain(prismaUser: any): User {
    const roles = (prismaUser.userRoles ?? [])
      .map((userRole: any) => userRole.role?.key)
      .filter(Boolean);

    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.email,
      roles,
      prismaUser.phoneNumber,
      prismaUser.phoneNumberCountryCode,
      prismaUser.passwordHash,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  static toPrisma(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      phoneNumberCountryCode: user.phoneNumberCountryCode || null,
      passwordHash: user.passwordHash!,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toPrismaCreate(user: User) {
    const data = UserMapper.toPrisma(user);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    // Ensure passwordHash is defined for creation
    if (!data.passwordHash) {
      throw new Error('Password hash is required for user creation');
    }
    return data;
  }

  static toPrismaUpdate(user: User) {
    const data = UserMapper.toPrisma(user);
    // Remove id and timestamps for updates
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    return data;
  }
}
