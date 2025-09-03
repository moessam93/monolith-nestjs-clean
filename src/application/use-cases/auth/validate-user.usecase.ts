import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { UserValidationInput, UserValidationOutput } from '../../dto/auth.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError } from '../../../domain/errors/user-errors';
import { User } from '../../../domain/entities/user';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Role } from 'src/domain/entities/role';

export class ValidateUserUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
  ) {}

  async execute(input: UserValidationInput): Promise<Result<UserValidationOutput, UserNotFoundError>> {
    const { userId } = input;

    const user = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('id', userId).include(['userRoles.role']));
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    const roleDetails = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereIn('id', user.userRoles.map(ur => ur.roleId)));

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleDetails.map(role => ({id: role.id, nameEn: role.nameEn, nameAr: role.nameAr, key: role.key})),
    });
  }
}
