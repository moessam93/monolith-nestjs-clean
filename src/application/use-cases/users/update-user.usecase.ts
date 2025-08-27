import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { IRolesRepo } from '../../../domain/repositories/roles-repo';
import { UpdateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';

export class UpdateUserUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
    private readonly rolesRepo: IRolesRepo,
  ) {}

  async execute(input: UpdateUserInput): Promise<Result<UserOutput, UserNotFoundError | UserAlreadyExistsError>> {
    const { id, name, email, phoneNumber, phoneNumberCountryCode } = input;

    // Check if user exists
    const user = await this.usersRepo.findById(id);
    if (!user) {
      return err(new UserNotFoundError(id));
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await this.usersRepo.findByEmail(email);
      if (existingUser) {
        return err(new UserAlreadyExistsError(email));
      }
    }

    // Update user properties
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (phoneNumberCountryCode !== undefined) user.phoneNumberCountryCode = phoneNumberCountryCode;

    // Save updated user
    const updatedUser = await this.usersRepo.update(user);

    // Get role details for output
    const roleDetails = await this.rolesRepo.findByKeys(updatedUser.roles);
    
    return ok(UserOutputMapper.toOutput(updatedUser, roleDetails));
  }
}
