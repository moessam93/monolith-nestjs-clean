import { ListUsersUseCase } from './list-users.usecase';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { isOk } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { UserRole } from '../../../domain/entities/user-role';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

// Mock the UserOutputMapper
jest.mock('../../mappers/user-output.mapper');

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
  let mockUsersRepo: jest.Mocked<IBaseRepository<User, string>>;
  let mockRolesRepo: jest.Mocked<IBaseRepository<Role, number>>;

  let mockUserOutputMapper: jest.Mocked<typeof UserOutputMapper>;

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
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockUserOutputMapper = UserOutputMapper as jest.Mocked<typeof UserOutputMapper>;

    listUsersUseCase = new ListUsersUseCase(mockUsersRepo, mockRolesRepo);
  });

  describe('execute', () => {
    it('should return paginated users list with default pagination', async () => {
      // Arrange
      const input = {};

      const userRoles = [
        new UserRole(1, 'user-1', 1),
        new UserRole(2, 'user-2', 2),
      ];
      const users = [
        new User(
          'user-1',
          'John Doe',
          'john@example.com',
          userRoles.slice(0, 1),
          '+1234567890',
          '+1',
          'password-hash',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new User(
          'user-2',
          'Jane Smith',
          'jane@example.com',
          userRoles.slice(1, 2),
          '+1987654321',
          '+1',
          'password-hash',
          new Date('2023-02-01'),
          new Date('2023-02-01'),
        ),
      ];

      const roles = [
        new Role(1, 'Admin', 'Administrator', 'المدير'),
        new Role(2, 'Executive', 'Executive', 'التنفيذي'),
      ];

      const userOutputs = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          phoneNumberCountryCode: '+1',
          roles: [roles[0]],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phoneNumber: '+1987654321',
          phoneNumberCountryCode: '+1',
          roles: [roles[1]],
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2023-02-01'),
        },
      ];

      const mockResult = {
        data: users,
        total: 25,
        totalFiltered: 25,
      };

      (mockUsersRepo.list as jest.Mock).mockResolvedValue(mockResult);
      (mockRolesRepo.findMany as jest.Mock).mockResolvedValue(roles);
      mockUserOutputMapper.toOutput
        .mockReturnValueOnce(userOutputs[0])
        .mockReturnValueOnce(userOutputs[1]);
      

      // Act
      const result = await listUsersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(2);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(20); // Default limit
        expect(result.value.meta.total).toBe(25);
        expect(result.value.meta.totalPages).toBe(2); // 25 / 20 = 1.25 -> 2 pages
        expect(result.value.meta.hasNextPage).toBe(true);
        expect(result.value.meta.hasPreviousPage).toBe(false);

        // Check user data
        expect(result.value.data[0].id).toBe('user-1');
        expect(result.value.data[0].name).toBe('John Doe');
        expect(result.value.data[0].roles[0].key).toBe('Admin');

        expect(result.value.data[1].id).toBe('user-2');
        expect(result.value.data[1].name).toBe('Jane Smith');
        expect(result.value.data[1].roles[0].key).toBe('Executive');
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          includes: ['userRoles.role'],
          pagination: { page: 1, limit: 20 },
          criteria: []
        })
      );
      expect(mockRolesRepo.findMany).toHaveBeenCalledTimes(2);
      expect(mockUserOutputMapper.toOutput).toHaveBeenCalledTimes(2);
    });

    it('should return paginated users list with custom pagination and search', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'john',
      };

      const userRoles = [
        new UserRole(1, 'user-1', 1),
      ];

      const users = [
        new User(
          'user-1',
          'John Doe',
          'john@example.com',
          userRoles.slice(0, 1),
          '+1234567890',
          '+1',
          'password-hash',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];

      const roles = [
        new Role(1, 'Admin', 'Administrator', 'المدير'),
      ];

      const userOutput = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        phoneNumberCountryCode: '+1',
        roles: [roles[0]],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      const mockResult = {
        data: users,
        total: 100,
        totalFiltered: 3, // 3 users match search
      };

      (mockUsersRepo.list as jest.Mock).mockResolvedValue(mockResult);
      (mockRolesRepo.findMany as jest.Mock).mockResolvedValue(roles);
      mockUserOutputMapper.toOutput.mockReturnValue(userOutput);
      

      // Act
      const result = await listUsersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.meta.page).toBe(2);
        expect(result.value.meta.limit).toBe(5);
        expect(result.value.meta.total).toBe(100); // Uses result.total, not totalFiltered
        expect(result.value.meta.totalPages).toBe(1); // 100 / 5 = 20
        expect(result.value.meta.hasNextPage).toBe(false);
        expect(result.value.meta.hasPreviousPage).toBe(true);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          includes: ['userRoles.role'],
          pagination: { page: 2, limit: 5 },
          criteria: expect.arrayContaining([
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } }
          ])
        })
      );
      expect(mockRolesRepo.findMany).toHaveBeenCalledWith(new BaseSpecification<Role>().whereIn('id', [1]));
    });

    it('should return empty list when no users found', async () => {
      // Arrange
      const input = {
        search: 'nonexistent',
      };

      const mockResult = {
        data: [],
        total: 50,
        totalFiltered: 0,
      };

      (mockUsersRepo.list as jest.Mock).mockResolvedValue(mockResult);
      (mockRolesRepo.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await listUsersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(50);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(20);
        expect(result.value.meta.hasNextPage).toBe(false);
        expect(result.value.meta.hasPreviousPage).toBe(false);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          includes: ['userRoles.role'],
          pagination: { page: 1, limit: 20 },
          criteria: expect.arrayContaining([
            { name: { contains: 'nonexistent', mode: 'insensitive' } },
            { email: { contains: 'nonexistent', mode: 'insensitive' } }
          ])
        })
      );
    });
  });
});