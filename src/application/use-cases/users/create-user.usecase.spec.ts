import { CreateUserUseCase } from './create-user.usecase';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserAlreadyExistsError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { UserRole } from '../../../domain/entities/user-role';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;
  let mockUsersRepo: jest.Mocked<IBaseRepository<User, string>>;
  let mockRolesRepo: jest.Mocked<IBaseRepository<Role, number>>;
  let mockUserRolesRepo: jest.Mocked<IBaseRepository<UserRole, number>>;

  beforeEach(() => {
    mockUsersRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
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
    mockUserRolesRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
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
    createUserUseCase = new CreateUserUseCase(
      mockUsersRepo,
      mockRolesRepo,
      mockUserRolesRepo,
      mockPasswordHasher,
    );
  });

  describe('execute', () => {
   it('should return InsufficientPermissionsError when non-SuperAdmin tries to assign roles', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['Executive']; // Not SuperAdmin
      const mockRoles = [new Role(1, 'Admin', 'Administrator', 'المدير')];
      const mockUserRoles = [new UserRole(1, 'user-123', 1)];

      mockUsersRepo.findOne.mockResolvedValue(null);
      mockRolesRepo.findMany.mockResolvedValue(mockRoles);
      mockUserRolesRepo.createMany.mockResolvedValue(mockUserRoles);

      mockUsersRepo.create.mockResolvedValue(new User('user-123', 'John Doe', 'john@example.com', [], undefined, undefined, 'password-hash', new Date(), new Date()));

      // Act
      const result = await createUserUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InsufficientPermissionsError);
      }
    });

    it('should return UserAlreadyExistsError when email already exists', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const existingUser = new User(
        'existing-user',
        'Existing User',
        'john@example.com',
        [],
        undefined,
        undefined,
        'password-hash',
        new Date(),
        new Date(),
      );

      mockUsersRepo.findOne.mockResolvedValue(existingUser);
      
      mockUsersRepo.create.mockResolvedValue(new User('existing-user', 'Existing User', 'john@example.com', [], undefined, undefined, 'password-hash', new Date(), new Date()));

      // Act
      const result = await createUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
      }
    });
  });
});
