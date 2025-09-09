import { LoginUseCase } from './login.usecase';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { TokenSignerPort } from '../../ports/token-signer.port';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserRole } from '../../../domain/entities/user-role';
import { InvalidCredentialsError, UserNotFoundError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUsersRepo: jest.Mocked<IBaseRepository<User, string>>;
  let mockRolesRepo: jest.Mocked<IBaseRepository<Role, number>>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;
  let mockTokenSigner: jest.Mocked<TokenSignerPort>;

  beforeEach(() => {
    mockUsersRepo = {
      findOne: jest.fn(),
      findMany: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockRolesRepo = {
      findOne: jest.fn(),
      findMany: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenSigner = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    loginUseCase = new LoginUseCase(
      mockUsersRepo,
      mockRolesRepo,
      mockPasswordHasher,
      mockTokenSigner,
    );
  });

  describe('execute', () => {
    it('should return login output when credentials are valid', async () => {
      // Arrange
      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');
      const userRole = new UserRole(1, 'user-123', 1, adminRole); // Include the full role object
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        [userRole],
        '+1234567890',
        '+1',
        'hashed-password',
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'password123',
        expiresIn: '1h',
      };

      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      mockRolesRepo.findMany.mockResolvedValue([adminRole]);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenSigner.sign.mockResolvedValue({
        token: 'jwt-token',
        exp: 1234567890,
      });

      const result = await loginUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
        expect(result.value.email).toBe('john@example.com');
        expect(result.value.name).toBe('John Doe');
        expect(result.value.roles).toEqual([{id: 1, nameEn: 'Administrator', nameAr: 'المدير', key: 'Admin'}]);
        expect(result.value.access_token).toBe('jwt-token');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ email: 'john@example.com' }],
          includes: ['userRoles.role']
        })
      );
      expect(mockRolesRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ id: { in: [1] } }]
        })
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockTokenSigner.sign).toHaveBeenCalledWith(
        {
          sub: 'user-123',
          email: 'john@example.com',
          name: 'John Doe',
          roles: ['Admin'], // Now expects role keys instead of UserRole objects
        },
        { expiresIn: '1h' }
      );
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
        expiresIn: '1h',
      };

      mockUsersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ email: 'nonexistent@example.com' }],
          includes: ['userRoles.role']
        })
      );
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when password is incorrect', async () => {
      // Arrange
      const userRole = new UserRole(1, 'user-123', 1);
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        [userRole],
        '+1234567890',
        '+1',
        'hashed-password',
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'wrong-password',
        expiresIn: '1h',
      };

      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ email: 'john@example.com' }],
          includes: ['userRoles.role']
        })
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when user has no password hash', async () => {
      // Arrange
      const userRole = new UserRole(1, 'user-123', 1);
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        [userRole],
        '+1234567890',
        '+1',
        undefined, // No password hash
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'password123',
        expiresIn: '1h',
      };

      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ email: 'john@example.com' }],
          includes: ['userRoles.role']
        })
      );
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });
  });
});
