import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { UpdateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, UserAlreadyExistsError } from '../../../domain/errors/user-errors';

export class UpdateUserUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
  ) {}

  async execute(input: UpdateUserInput): Promise<Result<UserOutput, UserNotFoundError | UserAlreadyExistsError>> {
    const { id, name, email, phoneNumber, phoneCountryCode } = input;

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
    if (phoneCountryCode !== undefined) user.phoneCountryCode = phoneCountryCode;

    // Save updated user
    const updatedUser = await this.usersRepo.update(user);

    return ok({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      phoneCountryCode: updatedUser.phoneCountryCode,
      roles: [], // This will be populated by the mapper later
      createdAt: updatedUser.createdAt!,
      updatedAt: updatedUser.updatedAt!,
    });
  }
}
