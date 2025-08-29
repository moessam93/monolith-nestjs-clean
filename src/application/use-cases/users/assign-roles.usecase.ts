import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { IRolesRepo } from '../../../domain/repositories/roles-repo';
import { AssignRolesInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { ROLES } from '../../../domain/constants/roles';

export class AssignRolesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: AssignRolesInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserNotFoundError | InsufficientPermissionsError | RoleNotFoundError>> {
    const { userId, roleKeys } = input;

    return this.unitOfWork.execute(async ({ users, roles }) => {
    // Check permissions
    if (currentUserRoles && !currentUserRoles.includes(ROLES.SUPER_ADMIN)) {
      return err(new InsufficientPermissionsError(ROLES.SUPER_ADMIN));
    }

    // Check if user exists
    const user = await users.findById(userId);
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    // Verify all roles exist
    const rolesList = await roles.findByKeys(roleKeys);
    if (rolesList.length !== roleKeys.length) {
      const missingRoles = roleKeys.filter(key => !rolesList.some(role => role.key === key));
      return err(new RoleNotFoundError(missingRoles));
    }

    // Assign roles
    await users.setRoles(userId, roleKeys);

    // Get updated user
    const updatedUser = await users.findById(userId);

    // Get role details for output
    const roleDetails = await roles.findByKeys(updatedUser!.roles);
    
      return ok(UserOutputMapper.toOutput(updatedUser!, roleDetails));
    });
  }
}
