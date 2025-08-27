import { LoginUseCase } from './login.usecase';
import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { TokenSignerPort } from '../../ports/token-signer.port';
import { User } from '../../../domain/entities/user';
import { InvalidCredentialsError, UserNotFoundError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUsersRepo: jest.Mocked<IUsersRepo>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;
  let mockTokenSigner: jest.Mocked<TokenSignerPort>;

  beforeEach(() => {
    mockUsersRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setRoles: jest.fn(),
      exists: jest.fn(),
      existsByEmail: jest.fn(),
      count: jest.fn(),
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
      mockPasswordHasher,
      mockTokenSigner,
    );
  });

  describe('execute', () => {
    it('should return login output when credentials are valid', async () => {
      // Arrange
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        ['Admin'],
        undefined,
        undefined,
        'hashed-password',
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'password123',
        expiresIn: '1h',
      };

      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenSigner.sign.mockResolvedValue({
        token: 'jwt-token',
        exp: 1234567890,
      });

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
        expect(result.value.email).toBe('john@example.com');
        expect(result.value.name).toBe('John Doe');
        expect(result.value.roles).toEqual(['Admin']);
        expect(result.value.access_token).toBe('jwt-token');
      }

      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockTokenSigner.sign).toHaveBeenCalledWith(
        {
          sub: 'user-123',
          email: 'john@example.com',
          name: 'John Doe',
          roles: ['Admin'],
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

      mockUsersRepo.findByEmail.mockResolvedValue(null);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when password is incorrect', async () => {
      // Arrange
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        ['Admin'],
        undefined,
        undefined,
        'hashed-password',
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'wrong-password',
        expiresIn: '1h',
      };

      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
      }

      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when user has no password hash', async () => {
      // Arrange
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        ['Admin'],
        undefined,
        undefined,
        undefined, // No password hash
        new Date(),
        new Date(),
      );

      const input = {
        email: 'john@example.com',
        password: 'password123',
        expiresIn: '1h',
      };

      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
      }

      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockTokenSigner.sign).not.toHaveBeenCalled();
    });
  });
});
