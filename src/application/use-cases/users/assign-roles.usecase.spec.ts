import { AssignRolesUseCase } from './assign-roles.usecase';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserNotFoundError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { RoleNotFoundError } from '../../../domain/errors/role-errors';
import { isOk, isErr } from '../../common/result';
import { IBaseRepository } from 'src/domain/repositories/base-repo';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { UserRole } from '../../../domain/entities/user-role';

describe('AssignRolesUseCase', () => {
  let assignRolesUseCase: AssignRolesUseCase;
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
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        createMany: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
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
      const mockUserRoles = [new UserRole(1, userId, 1), new UserRole(2, userId, 2)];
      const user = new User(
        userId,
        'John Doe',
        'john@example.com',
        mockUserRoles,
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
        mockUserRoles,
        undefined,
        undefined,
        'password-hash',
        new Date(),
        new Date(),
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');
      const executiveRole = new Role(2, 'Executive', 'Executive', 'التنفيذي');

      (mockUsersRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(user) // First call
        .mockResolvedValueOnce(updatedUser); // Second call after update
      (mockRolesRepo.findMany as jest.Mock)
        .mockResolvedValueOnce([adminRole, executiveRole]) // Role verification
        .mockResolvedValueOnce([adminRole, executiveRole]); // For output mapping
      (mockUsersRepo.update as jest.Mock).mockResolvedValueOnce(undefined);
      
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

      expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(2);
      expect(mockRolesRepo.findMany).toHaveBeenCalledWith(new BaseSpecification<Role>().whereEqual('key', ['Admin', 'Executive']));
      expect(mockUsersRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: userId,
        userRoles: mockUserRoles,
      }));
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
      expect(mockUsersRepo.findOne).not.toHaveBeenCalled();
      expect(mockRolesRepo.findMany).not.toHaveBeenCalled();
      expect(mockUsersRepo.update).not.toHaveBeenCalled();
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = {
        userId: 'nonexistent-user',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['SuperAdmin'];

      (mockUsersRepo.findOne as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<User>().whereEqual('id', 'nonexistent-user'));
      expect(mockRolesRepo.findMany).not.toHaveBeenCalled();
      expect(mockUsersRepo.update).not.toHaveBeenCalled();
    });

    it('should return RoleNotFoundError when some roles do not exist', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: ['Admin', 'NonExistentRole'],
      };
      const currentUserRoles = ['SuperAdmin'];
      const userRoles = [new UserRole(1, userId, 1)]; 
      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');

      const user = new User(
        userId,
        'John Doe',
        'john@example.com',
        userRoles,
        undefined,
        undefined,
        'password-hash',
        new Date(),
        new Date(),
      );


      (mockUsersRepo.findOne as jest.Mock).mockResolvedValue(user);
      (mockRolesRepo.findMany as jest.Mock).mockResolvedValue([adminRole]); // Only 1 role returned instead of 2
      
      // Act
      const result = await assignRolesUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(RoleNotFoundError);
        expect(result.error.code).toBe('ROLE_NOT_FOUND');
      }

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<User>().whereEqual('id', userId));
      expect(mockRolesRepo.findMany).toHaveBeenCalledWith(new BaseSpecification<Role>().whereEqual('key', ['Admin', 'NonExistentRole']));
      expect(mockUsersRepo.update).not.toHaveBeenCalled();
    });

    it('should work without currentUserRoles (system call)', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        userId,
        roleKeys: ['Admin'],
      };
      // No currentUserRoles provided (system call)

      const user = new User(userId, 'John Doe', 'john@example.com', [], undefined, undefined, 'password-hash', new Date(), new Date());
      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');
      const userRoles = [new UserRole(1, userId, 1)];
      const updatedUser = new User(userId, 'John Doe', 'john@example.com',userRoles, undefined, undefined, 'password-hash', new Date(), new Date());

      (mockUsersRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);
      (mockRolesRepo.findMany as jest.Mock)
        .mockResolvedValueOnce([adminRole])
        .mockResolvedValueOnce([adminRole]);
      (mockUsersRepo.update as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Act
      const result = await assignRolesUseCase.execute(input); // No currentUserRoles

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(userId);
        expect(result.value.roles).toHaveLength(1);
        expect(result.value.roles[0].key).toBe('Admin');
      }

      expect(mockUsersRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: userId,
        userRoles: userRoles,
      }));
    });
  });
});
