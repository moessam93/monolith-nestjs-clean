import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { IRolesRepo } from '../../../domain/repositories/roles-repo';
import { AssignRolesInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';

export class AssignRolesUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
    private readonly rolesRepo: IRolesRepo,
  ) {}

  async execute(input: AssignRolesInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserNotFoundError | InsufficientPermissionsError | RoleNotFoundError>> {
    const { userId, roleKeys } = input;

    // Check permissions
    if (currentUserRoles && !currentUserRoles.includes('SuperAdmin')) {
      return err(new InsufficientPermissionsError('SuperAdmin'));
    }

    // Check if user exists
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    // Verify all roles exist
    const roles = await this.rolesRepo.findByKeys(roleKeys);
    if (roles.length !== roleKeys.length) {
      const missingRoles = roleKeys.filter(key => !roles.some(role => role.key === key));
      return err(new RoleNotFoundError(missingRoles));
    }

    // Assign roles
    await this.usersRepo.setRoles(userId, roleKeys);

    // Get updated user
    const updatedUser = await this.usersRepo.findById(userId);

    return ok({
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      phoneNumber: updatedUser!.phoneNumber,
      phoneCountryCode: updatedUser!.phoneCountryCode,
      roles: [], // This will be populated by the mapper later
      createdAt: updatedUser!.createdAt!,
      updatedAt: updatedUser!.updatedAt!,
    });
  }
}
