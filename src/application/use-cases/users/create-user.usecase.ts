import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { CreateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { User } from '../../../domain/entities/user';
import { UserAlreadyExistsError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';

export class CreateUserUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: CreateUserInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserAlreadyExistsError | InsufficientPermissionsError>> {
    const { name, email, password, phoneNumber, phoneNumberCountryCode, roleKeys = [] } = input;

    return this.unitOfWork.execute(async ({ users, roles }) => {
      // Check permissions for role assignment
      if (roleKeys.length > 0 && currentUserRoles && !currentUserRoles.includes('SuperAdmin')) {
        return err(new InsufficientPermissionsError('SuperAdmin'));
      }

      // Check if user already exists
      const existingUser = await users.findByEmail(email);
      if (existingUser) {
        return err(new UserAlreadyExistsError(email));
      }

      // Hash password
      const passwordHash = await this.passwordHasher.hash(password);

      // Create user entity
      const userId = crypto.randomUUID();
      const user = new User(
        userId,
        name,
        email,
        [],
        phoneNumber,
        phoneNumberCountryCode,
        passwordHash,
        new Date(),
        new Date(),
      );

      // Create user
      const createdUser = await users.create(user);

      // Assign roles if provided
      if (roleKeys.length > 0) {
        await users.setRoles(createdUser.id, roleKeys);
      }

      // Return final user with roles
      const finalUser = await users.findById(createdUser.id);
      
      // Get role details for output
      const roleDetails = await roles.findByKeys(finalUser!.roles);
      
      return ok(UserOutputMapper.toOutput(finalUser!, roleDetails));
    });
  }
}
