import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { BootstrapSuperAdminInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { User } from '../../../domain/entities/user';
import { UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { RoleKey } from '../../../domain/value-objects/role-key';

export class BootstrapFirstSuperAdminUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: BootstrapSuperAdminInput): Promise<Result<UserOutput, UserAlreadyExistsError>> {
    const { name, email, password, phoneNumber, phoneCountryCode } = input;

    return this.unitOfWork.execute(async ({ users, roles }) => {
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
        [RoleKey.SUPER_ADMIN],
        phoneNumber,
        phoneCountryCode,
        passwordHash,
        new Date(),
        new Date(),
      );

      // Ensure roles exist
      await roles.ensureKeys([RoleKey.SUPER_ADMIN, RoleKey.ADMIN, RoleKey.EXECUTIVE]);

      // Create user
      const createdUser = await users.create(user);

      // Set roles
      await users.setRoles(createdUser.id, [RoleKey.SUPER_ADMIN]);

      // Return final user with roles
      const finalUser = await users.findById(createdUser.id);
      
      return ok({
        id: finalUser!.id,
        name: finalUser!.name,
        email: finalUser!.email,
        phoneNumber: finalUser!.phoneNumber,
        phoneCountryCode: finalUser!.phoneCountryCode,
        roles: [], // This will be populated by the mapper later
        createdAt: finalUser!.createdAt!,
        updatedAt: finalUser!.updatedAt!,
      });
    });
  }
}
