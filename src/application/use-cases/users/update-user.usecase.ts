import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { UpdateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { UserNotFoundError, UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Role } from '../../../domain/entities/role';
import { User } from '../../../domain/entities/user';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class UpdateUserUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
  ) {}

  async execute(input: UpdateUserInput): Promise<Result<UserOutput, UserNotFoundError | UserAlreadyExistsError>> {
    const { id, name, email, phoneNumber, phoneNumberCountryCode } = input;

    // Check if user exists
    const user = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('id', id).include(['userRoles.role']));
    if (!user) {
      return err(new UserNotFoundError(id));
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('email', email));
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
    const updatedUser = await this.usersRepo.update(user);
    const roleDetails = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereIn('id', updatedUser.userRoles.map(ur => ur.roleId)));

    return ok(UserOutputMapper.toOutput(updatedUser, roleDetails));
  }
}
