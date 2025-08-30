import { AssignRolesUseCase } from './assign-roles.usecase';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';
import { isOk, isErr } from '../../common/result';
import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { IRolesRepo } from '../../../domain/repositories/roles-repo';

describe('AssignRolesUseCase', () => {
  let assignRolesUseCase: AssignRolesUseCase;
  let mockUsersRepo: jest.Mocked<IUsersRepo>;
  let mockRolesRepo: jest.Mocked<IRolesRepo>;

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
      mockRolesRepo = {
        findByKeys: jest.fn(),
        findByKey: jest.fn(),
        exists: jest.fn(),
        ensureKeys: jest.fn(),
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }

    assignRolesUseCase = new AssignRolesUseCase(mockUsersRepo, mockRolesRepo);
  });

  describe('execute', () => {
    it('should assign roles to user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: ['Admin', 'Executive'],
      };
      const currentUserRoles = ['SuperAdmin'];

      const user = new User(
        userId,
        'John Doe',
        'john@example.com',
        ['Executive'], // Current roles
        undefined,
        undefined,
        'password-hash',
        new Date(),
        new Date(),
      );

      const updatedUser = new User(
        userId,
        'John Doe',
        'john@example.com',
        ['Admin', 'Executive'], // Updated roles
        undefined,
        undefined,
        'password-hash',
        new Date(),
        new Date(),
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');
      const executiveRole = new Role(2, 'Executive', 'Executive', 'التنفيذي');

      (mockUsersRepo.findById as jest.Mock)
        .mockResolvedValueOnce(user) // First call
        .mockResolvedValueOnce(updatedUser); // Second call after update
      (mockRolesRepo.findByKeys as jest.Mock)
        .mockResolvedValueOnce([adminRole, executiveRole]) // Role verification
        .mockResolvedValueOnce([adminRole, executiveRole]); // For output mapping
      (mockUsersRepo.setRoles as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(userId);
        expect(result.value.name).toBe('John Doe');
        expect(result.value.roles).toHaveLength(2);
        expect(result.value.roles.map(r => r.key)).toEqual(['Admin', 'Executive']);
      }

      expect(mockUsersRepo.findById).toHaveBeenCalledTimes(2);
      expect(mockRolesRepo.findByKeys).toHaveBeenCalledWith(['Admin', 'Executive']);
      expect(mockUsersRepo.setRoles).toHaveBeenCalledWith(userId, ['Admin', 'Executive']);
    });

    it('should return InsufficientPermissionsError when user is not SuperAdmin', async () => {
      // Arrange
      const input = {
        userId: 'user-123',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['Executive']; // Not SuperAdmin

      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InsufficientPermissionsError);
        expect(result.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      }

      // Should not proceed with any other operations
      expect(mockUsersRepo.findById).not.toHaveBeenCalled();
      expect(mockRolesRepo.findByKeys).not.toHaveBeenCalled();
      expect(mockUsersRepo.setRoles).not.toHaveBeenCalled();
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = {
        userId: 'nonexistent-user',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['SuperAdmin'];

      (mockUsersRepo.findById as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findById).toHaveBeenCalledWith('nonexistent-user');
      expect(mockRolesRepo.findByKeys).not.toHaveBeenCalled();
      expect(mockUsersRepo.setRoles).not.toHaveBeenCalled();
    });

    it('should return RoleNotFoundError when some roles do not exist', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: ['Admin', 'NonExistentRole'],
      };
      const currentUserRoles = ['SuperAdmin'];

      const user = new User(
        userId,
        'John Doe',
        'john@example.com',
        [],
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');
      // Only Admin role exists, NonExistentRole doesn't

      (mockUsersRepo.findById as jest.Mock).mockResolvedValue(user);
      (mockRolesRepo.findByKeys as jest.Mock).mockResolvedValue([adminRole]); // Only 1 role returned instead of 2
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(RoleNotFoundError);
        expect(result.error.code).toBe('ROLE_NOT_FOUND');
      }

      expect(mockUsersRepo.findById).toHaveBeenCalledWith(userId);
      expect(mockRolesRepo.findByKeys).toHaveBeenCalledWith(['Admin', 'NonExistentRole']);
      expect(mockUsersRepo.setRoles).not.toHaveBeenCalled();
    });

    it('should work without currentUserRoles (system call)', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: ['Admin'],
      };
      // No currentUserRoles provided (system call)

      const user = new User(userId, 'John Doe', 'john@example.com', []);
      const updatedUser = new User(userId, 'John Doe', 'john@example.com', ['Admin']);
      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');

      (mockUsersRepo.findById as jest.Mock)
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);
      (mockRolesRepo.findByKeys as jest.Mock)
        .mockResolvedValueOnce([adminRole])
        .mockResolvedValueOnce([adminRole]);
      (mockUsersRepo.setRoles as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Act
      const result = await assignRolesUseCase.execute(input); // No currentUserRoles

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(userId);
        expect(result.value.roles).toHaveLength(1);
        expect(result.value.roles[0].key).toBe('Admin');
      }

      expect(mockUsersRepo.setRoles).toHaveBeenCalledWith(userId, ['Admin']);
    });

    it('should assign empty roles array to remove all roles', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: [], // Remove all roles
      };
      const currentUserRoles = ['SuperAdmin'];

      const user = new User(userId, 'John Doe', 'john@example.com', ['Admin', 'Executive']);
      const updatedUser = new User(userId, 'John Doe', 'john@example.com', []);

      (mockUsersRepo.findById as jest.Mock)
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);
      (mockRolesRepo.findByKeys as jest.Mock)
        .mockResolvedValueOnce([]) // No roles to verify
        .mockResolvedValueOnce([]); // No roles for output
      (mockUsersRepo.setRoles as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(userId);
        expect(result.value.roles).toHaveLength(0);
      }

      expect(mockUsersRepo.setRoles).toHaveBeenCalledWith(userId, []);
    });
  });
});
