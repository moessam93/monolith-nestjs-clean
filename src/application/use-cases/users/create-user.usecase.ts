import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { CreateUserInput, UserOutput } from '../../dto/user.dto';
import { Result, ok, err } from '../../common/result';
import { User } from '../../../domain/entities/user';
import { UserAlreadyExistsError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { BadRequestException } from '@nestjs/common';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Role } from '../../../domain/entities/role';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { UserRole } from '../../../domain/entities/user-role';

export class CreateUserUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
    private readonly userRoles: IBaseRepository<UserRole, number>,
    private readonly passwordHasher: PasswordHasherPort,
  ) { }

  async execute(input: CreateUserInput, currentUserRoles?: string[]): Promise<Result<UserOutput, UserAlreadyExistsError | InsufficientPermissionsError | BadRequestException>> {
    const { name, email, password, phoneNumber, phoneNumberCountryCode, roleKeys = [] } = input;

    // Check permissions for role assignment
    if (roleKeys.length > 0 && currentUserRoles && !currentUserRoles.includes('SuperAdmin')) {
      return err(new InsufficientPermissionsError('SuperAdmin'));
    }

    // Check if user already exists
    const existingUser = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('email', email));
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
    const createdUser = await this.usersRepo.create(user);

    // Assign roles if provided
    if (roleKeys.length > 0) {
      // Get roles by keys
      const roles = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereEqual('key', roleKeys));

      // Add new roles
      if (roles.length > 0) {
        await this.userRoles.createMany(roles.map(role => new UserRole(0, createdUser.id, role.id)));
      }
    }

    // Return final user with roles
    const finalUser = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('id', createdUser.id).include(['userRoles']));

    // Get role details for output
    const roleDetails = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereIn('id', finalUser!.userRoles.map(ur => ur.roleId)));
      
    return ok(UserOutputMapper.toOutput(finalUser!, roleDetails));
  }
}