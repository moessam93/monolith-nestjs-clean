import { AssignRolesInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { ROLES } from '../../../domain/constants/roles';
import {IUsersRepo} from '../../../domain/repositories/users-repo';
import {IRolesRepo} from '../../../domain/repositories/roles-repo';

export class AssignRolesUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
    private readonly rolesRepo: IRolesRepo,
  ) {}

  async execute(input: AssignRolesInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserNotFoundError | InsufficientPermissionsError | RoleNotFoundError>> {
    const { userId, roleKeys } = input;

    // Check permissions
    if (currentUserRoles && !currentUserRoles.includes(ROLES.SUPER_ADMIN)) {
      return err(new InsufficientPermissionsError(ROLES.SUPER_ADMIN));
    }

    // Check if user exists
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    // Verify all roles exist
    const rolesList = await this.rolesRepo.findByKeys(roleKeys);
    if (rolesList.length !== roleKeys.length) {
      const missingRoles = roleKeys.filter(key => !rolesList.some(role => role.key === key));
      return err(new RoleNotFoundError(missingRoles));
    }

    // Assign roles
    await this.usersRepo.setRoles(userId, roleKeys);

    // Get updated user
    const updatedUser = await this.usersRepo.findById(userId);

    // Get role details for output
    const roleDetails = await this.rolesRepo.findByKeys(updatedUser!.roles);
    
    return ok(UserOutputMapper.toOutput(updatedUser!, roleDetails));
  }
}
