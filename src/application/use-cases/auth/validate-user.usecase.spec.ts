import { ValidateUserUseCase } from './validate-user.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { User } from '../../../domain/entities/user';
import { UserNotFoundError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';
import { UserRole } from '../../../domain/entities/user-role';
import { Role } from '../../../domain/entities/role';

describe('ValidateUserUseCase', () => {
  let validateUserUseCase: ValidateUserUseCase;
  let mockUsersRepo: jest.Mocked<IBaseRepository<User, string>>;
  let mockRolesRepo: jest.Mocked<IBaseRepository<Role, number>>;
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
      findMany: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };

    validateUserUseCase = new ValidateUserUseCase(mockUsersRepo, mockRolesRepo);
  });

  describe('execute', () => {
    it('should return user validation output when user exists', async () => {
      // Arrange
      const mockUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        [new UserRole(1, 'user-123', 1)],
        undefined,
        undefined,
        'hashed-password',
        new Date(),
        new Date(),
      );

      const input = { userId: 'user-123' };
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      mockRolesRepo.findMany.mockResolvedValue([new Role(1, 'Admin', 'Admin', 'المدير')]);

      // Act
      const result = await validateUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
        expect(result.value.email).toBe('john@example.com');
        expect(result.value.name).toBe('John Doe');
        expect(result.value.roles).toEqual([{id: 1, nameEn: 'Admin', nameAr: 'المدير', key: 'Admin'}]);
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ id: 'user-123' }],
          includes: ['userRoles.role']
        })
      );
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = { userId: 'nonexistent-user' };
      mockUsersRepo.findOne.mockResolvedValue(null);
      mockRolesRepo.findMany.mockResolvedValue([]);
      // Act
      const result = await validateUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: [{ id: 'nonexistent-user' }],
          includes: ['userRoles.role']
        })
      );
    });
  });
});
