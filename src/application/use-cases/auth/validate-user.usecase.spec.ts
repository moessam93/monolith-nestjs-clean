import { ValidateUserUseCase } from './validate-user.usecase';
import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { User } from '../../../domain/entities/user';
import { UserNotFoundError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';

describe('ValidateUserUseCase', () => {
  let validateUserUseCase: ValidateUserUseCase;
  let mockUsersRepo: jest.Mocked<IUsersRepo>;

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

    validateUserUseCase = new ValidateUserUseCase(mockUsersRepo);
  });

  describe('execute', () => {
    it('should return user validation output when user exists', async () => {
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

      const input = { userId: 'user-123' };
      mockUsersRepo.findById.mockResolvedValue(mockUser);

      // Act
      const result = await validateUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
        expect(result.value.email).toBe('john@example.com');
        expect(result.value.name).toBe('John Doe');
        expect(result.value.roles).toEqual(['Admin']);
      }

      expect(mockUsersRepo.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = { userId: 'nonexistent-user' };
      mockUsersRepo.findById.mockResolvedValue(null);

      // Act
      const result = await validateUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findById).toHaveBeenCalledWith('nonexistent-user');
    });
  });
});
