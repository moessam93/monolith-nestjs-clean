import { AssignRolesInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { ROLES } from '../../../domain/constants/roles';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { UserRole } from '../../../domain/entities/user-role';

export class AssignRolesUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
  ) {}

  async execute(input: AssignRolesInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserNotFoundError | InsufficientPermissionsError | RoleNotFoundError>> {
    const { userId, roleKeys } = input;

    // Check permissions
    if (currentUserRoles && !currentUserRoles.includes(ROLES.SUPER_ADMIN)) {
      return err(new InsufficientPermissionsError(ROLES.SUPER_ADMIN));
    }

    // Check if user exists
    const user = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('id', userId));
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    // Verify all roles exist
    const rolesList = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereEqual('key', roleKeys));
    if (rolesList.length !== roleKeys.length) {
      const missingRoles = roleKeys.filter(key => !rolesList.some(role => role.key === key));
      return err(new RoleNotFoundError(missingRoles));
    }

    user.userRoles = rolesList.map(role => new UserRole(role.id, userId, role.id));

    // Assign roles
    await this.usersRepo.update(user);
    // Get updated user
    const updatedUser = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('id', userId));
      
    return ok(UserOutputMapper.toOutput(updatedUser!, rolesList));
  }
}
