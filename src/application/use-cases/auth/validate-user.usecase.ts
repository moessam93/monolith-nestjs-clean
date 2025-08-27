import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { UserValidationInput, UserValidationOutput } from '../../dto/auth.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError } from '../../../domain/errors/user-errors';

export class ValidateUserUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
  ) {}

  async execute(input: UserValidationInput): Promise<Result<UserValidationOutput, UserNotFoundError>> {
    const { userId } = input;

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      return err(new UserNotFoundError(userId));
    }

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    });
  }
}
