import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { UpdateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';

export class UpdateUserUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: UpdateUserInput): Promise<Result<UserOutput, UserNotFoundError | UserAlreadyExistsError>> {
    const { id, name, email, phoneNumber, phoneNumberCountryCode } = input;

    return this.unitOfWork.execute(async ({ users, roles }) => {
      // Check if user exists
      const user = await users.findById(id);
      if (!user) {
        return err(new UserNotFoundError(id));
      }

      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await users.findByEmail(email);
        if (existingUser) {
          return err(new UserAlreadyExistsError(email));
        }
      }

      // Update user properties
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (phoneNumberCountryCode !== undefined) user.phoneNumberCountryCode = phoneNumberCountryCode;

      // Save updated user (all in same transaction)
      const updatedUser = await users.update(user);

      // Get role details for output
      const roleDetails = await roles.findByKeys(updatedUser.roles);
      
      return ok(UserOutputMapper.toOutput(updatedUser, roleDetails));
    });
  }
}
