
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { TokenSignerPort } from '../../ports/token-signer.port';
import { LoginInput, LoginOutput } from '../../dto/auth.dto';
import { Result, ok, err } from '../../common/result';
import { InvalidCredentialsError, UserNotFoundError } from '../../../domain/errors/user-errors';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { User } from '../../../domain/entities/user';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Role } from '../../../domain/entities/role';

export class LoginUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenSigner: TokenSignerPort,
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput, UserNotFoundError | InvalidCredentialsError>> {
    const { email, password, expiresIn = '1h' } = input;

    // Find user by email
    const user = await this.usersRepo.findOne(new BaseSpecification<User>().whereEqual('email', email).include(['userRoles.role']));
    if (!user) {
      return err(new UserNotFoundError(email));
    }

    // Verify password
    if (!user.passwordHash) {
      return err(new InvalidCredentialsError());
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return err(new InvalidCredentialsError());
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.userRoles,
    };

    const { token, exp } = await this.tokenSigner.sign(payload, { expiresIn });

    // Calculate expiration date
    const expiredAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 60 * 60 * 1000); // fallback to 1 hour
    const roleDetails = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereIn('id', user.userRoles.map(ur => ur.roleId)));

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleDetails.map(role => ({id: role.id, nameEn: role.nameEn, nameAr: role.nameAr, key: role.key})),
      access_token: token,
      expiredAt,
    });
  }
}
