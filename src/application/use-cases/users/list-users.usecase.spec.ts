import { ListUsersUseCase } from './list-users.usecase';
import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { IRolesRepo } from '../../../domain/repositories/roles-repo';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { isOk } from '../../common/result';

// Mock the UserOutputMapper
jest.mock('../../mappers/user-output.mapper');

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
  let mockUsersRepo: jest.Mocked<IUsersRepo>;
  let mockRolesRepo: jest.Mocked<IRolesRepo>;

  beforeEach(() => {
    mockUsersRepo = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setRoles: jest.fn(),
      exists: jest.fn(),
      existsByEmail: jest.fn(),
      count: jest.fn(),
      findByEmail: jest.fn(),
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
  });
  let mockUserOutputMapper: jest.Mocked<typeof UserOutputMapper>;

  beforeEach(() => {

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

    mockUserOutputMapper = UserOutputMapper as jest.Mocked<typeof UserOutputMapper>;

    listUsersUseCase = new ListUsersUseCase(mockUsersRepo, mockRolesRepo);
  });

  describe('execute', () => {
    it('should return paginated users list with default pagination', async () => {
      // Arrange
      const input = {};

      const users = [
        new User(
          'user-1',
          'John Doe',
          'john@example.com',
          ['Admin'],
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
          ['Executive'],
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
          roles: [{ id: 1, key: 'Admin', nameEn: 'Administrator', nameAr: 'المدير' }],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phoneNumber: '+1987654321',
          phoneNumberCountryCode: '+1',
          roles: [{ id: 2, key: 'Executive', nameEn: 'Executive', nameAr: 'التنفيذي' }],
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
      (mockRolesRepo.findByKeys as jest.Mock).mockResolvedValue(roles);
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

      expect(mockUsersRepo.list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
      });
      expect(mockRolesRepo.findByKeys).toHaveBeenCalledWith(['Admin', 'Executive']);
      expect(mockUserOutputMapper.toOutput).toHaveBeenCalledTimes(2);
    });

    it('should return paginated users list with custom pagination and search', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'john',
      };

      const users = [
        new User(
          'user-1',
          'John Doe',
          'john@example.com',
          ['Admin'],
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
        roles: [{ id: 1, key: 'Admin', nameEn: 'Administrator', nameAr: 'المدير' }],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      const mockResult = {
        data: users,
        total: 100,
        totalFiltered: 3, // 3 users match search
      };

      (mockUsersRepo.list as jest.Mock).mockResolvedValue(mockResult);
      (mockRolesRepo.findByKeys as jest.Mock).mockResolvedValue(roles);
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
        expect(result.value.meta.totalPages).toBe(20); // 100 / 5 = 20
        expect(result.value.meta.hasNextPage).toBe(true);
        expect(result.value.meta.hasPreviousPage).toBe(true);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'john',
      });
      expect(mockRolesRepo.findByKeys).toHaveBeenCalledWith(['Admin']);
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
      (mockRolesRepo.findByKeys as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await listUsersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(50);
        expect(result.value.meta.totalPages).toBe(3); // Math.ceil(50 / 20) = 3 pages (uses result.total for both)
        expect(result.value.meta.hasNextPage).toBe(true); // Page 1 of 3 has next page
        expect(result.value.meta.hasPreviousPage).toBe(false);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'nonexistent',
      });
      expect(mockRolesRepo.findByKeys).toHaveBeenCalledWith([]);
    });
  });
});