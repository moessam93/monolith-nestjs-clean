import { ListUsersUseCase } from './list-users.usecase';
import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { User } from '../../../domain/entities/user';
import { isOk } from '../../common/result';

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
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

    listUsersUseCase = new ListUsersUseCase(mockUsersRepo);
  });

  describe('execute', () => {
    it('should return paginated users list with default pagination', async () => {
      // Arrange
      const mockUsers = [
        new User('user-1', 'John Doe', 'john@example.com', ['Admin'], undefined, undefined, undefined, new Date(), new Date()),
        new User('user-2', 'Jane Smith', 'jane@example.com', ['Executive'], undefined, undefined, undefined, new Date(), new Date()),
      ];

      mockUsersRepo.list.mockResolvedValue({
        data: mockUsers,
        total: 2,
      });

      // Act
      const result = await listUsersUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(2);
        expect(result.value.data[0].id).toBe('user-1');
        expect(result.value.data[0].name).toBe('John Doe');
        expect(result.value.data[1].id).toBe('user-2');
        expect(result.value.data[1].name).toBe('Jane Smith');
        expect(result.value.meta.total).toBe(2);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(20);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined });
    });

    it('should return paginated users list with custom pagination and search', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'john',
      };

      const mockUsers = [
        new User('user-1', 'John Doe', 'john@example.com', ['Admin'], undefined, undefined, undefined, new Date(), new Date()),
      ];

      mockUsersRepo.list.mockResolvedValue({
        data: mockUsers,
        total: 10,
      });

      // Act
      const result = await listUsersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.meta.page).toBe(2);
        expect(result.value.meta.limit).toBe(5);
        expect(result.value.meta.total).toBe(10);
      }

      expect(mockUsersRepo.list).toHaveBeenCalledWith({ page: 2, limit: 5, search: 'john' });
    });

    it('should return empty list when no users found', async () => {
      // Arrange
      mockUsersRepo.list.mockResolvedValue({
        data: [],
        total: 0,
      });

      // Act
      const result = await listUsersUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(0);
      }
    });
  });
});
