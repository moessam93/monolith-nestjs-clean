import { User } from '../../domain/entities/user';
import { Role } from '../../domain/entities/role';
import { UserOutput, RoleOutput } from '../dto/user.dto';

export class UserOutputMapper {
  static toOutput(user: User, roles: Role[]): UserOutput {
    // Map roles to RoleOutput format
    const roleOutputs: RoleOutput[] = roles.map(role => ({
      id: role.id,
      key: role.key,
      nameEn: role.nameEn,
      nameAr: role.nameAr,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneNumberCountryCode: user.phoneNumberCountryCode,
      roles: roleOutputs,
      createdAt: user.createdAt!,
      updatedAt: user.updatedAt!,
    };
  }
}
