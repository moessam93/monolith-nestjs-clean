import { UpdateUserUseCase } from './update-user.usecase';
import { IUnitOfWork, IRepositories } from '../../../domain/uow/unit-of-work';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserNotFoundError, UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let mockUnitOfWork: jest.Mocked<IUnitOfWork>;
  let mockRepositories: jest.Mocked<IRepositories>;

  beforeEach(() => {
    mockRepositories = {
      users: {
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
      },
      roles: {
        findByKeys: jest.fn(),
        findByKey: jest.fn(),
        exists: jest.fn(),
        ensureKeys: jest.fn(),
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      beats: {} as any,
      brands: {} as any,
      influencers: {} as any,
      socialPlatforms: {} as any,
    };

    mockUnitOfWork = {
      execute: jest.fn(),
    };

    updateUserUseCase = new UpdateUserUseCase(mockUnitOfWork);
  });

  describe('execute', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        id: userId,
        name: 'Updated Name',
        email: 'updated@example.com',
        phoneNumber: '+1987654321',
        phoneNumberCountryCode: '+1',
      };

      const existingUser = new User(
        userId,
        'Old Name',
        'old@example.com',
        ['Admin'],
        '+1234567890',
        '+1',
        'password-hash',
        new Date(),
        new Date(),
      );

      const updatedUser = new User(
        userId,
        'Updated Name',
        'updated@example.com',
        ['Admin'],
        '+1987654321',
        '+1',
        'password-hash',
        new Date(),
        new Date(),
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');

      (mockRepositories.users.findById as jest.Mock).mockResolvedValue(existingUser);
      (mockRepositories.users.findByEmail as jest.Mock).mockResolvedValue(null); // Email not taken by another user
      (mockRepositories.users.update as jest.Mock).mockResolvedValue(updatedUser);
      (mockRepositories.roles.findByKeys as jest.Mock).mockResolvedValue([adminRole]);
      
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await updateUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(userId);
        expect(result.value.name).toBe('Updated Name');
        expect(result.value.email).toBe('updated@example.com');
        expect(result.value.phoneNumber).toBe('+1987654321');
        expect(result.value.phoneNumberCountryCode).toBe('+1');
        expect(result.value.roles).toHaveLength(1);
        expect(result.value.roles[0].key).toBe('Admin');
      }

      expect(mockRepositories.users.findById).toHaveBeenCalledWith(userId);
      expect(mockRepositories.users.findByEmail).toHaveBeenCalledWith('updated@example.com');
      expect(mockRepositories.users.update).toHaveBeenCalledWith(expect.objectContaining({
        id: userId,
        name: 'Updated Name',
        email: 'updated@example.com',
      }));
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      // Arrange
      const input = {
        id: 'nonexistent-user',
        name: 'Updated Name',
      };

      (mockRepositories.users.findById as jest.Mock).mockResolvedValue(null);
      
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await updateUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserNotFoundError);
        expect(result.error.code).toBe('USER_NOT_FOUND');
      }

      expect(mockRepositories.users.findById).toHaveBeenCalledWith('nonexistent-user');
      expect(mockRepositories.users.update).not.toHaveBeenCalled();
    });

    it('should return UserAlreadyExistsError when email is already taken', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        id: userId,
        email: 'taken@example.com',
      };

      const existingUser = new User(
        userId,
        'Current User',
        'current@example.com',
        [],
      );

      const userWithTakenEmail = new User(
        'other-user',
        'Other User',
        'taken@example.com',
        [],
      );

      (mockRepositories.users.findById as jest.Mock).mockResolvedValue(existingUser);
      (mockRepositories.users.findByEmail as jest.Mock).mockResolvedValue(userWithTakenEmail);
      
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await updateUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
        expect(result.error.code).toBe('USER_ALREADY_EXISTS');
      }

      expect(mockRepositories.users.findById).toHaveBeenCalledWith(userId);
      expect(mockRepositories.users.findByEmail).toHaveBeenCalledWith('taken@example.com');
      expect(mockRepositories.users.update).not.toHaveBeenCalled();
    });

    it('should allow user to keep same email', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        id: userId,
        name: 'Updated Name',
        email: 'same@example.com', // Same email as current
      };

      const existingUser = new User(
        userId,
        'Old Name',
        'same@example.com',
        ['Admin'],
      );

      const updatedUser = new User(
        userId,
        'Updated Name',
        'same@example.com',
        ['Admin'],
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');

      (mockRepositories.users.findById as jest.Mock).mockResolvedValue(existingUser);
      // Don't call findByEmail since email hasn't changed
      (mockRepositories.users.update as jest.Mock).mockResolvedValue(updatedUser);
      (mockRepositories.roles.findByKeys as jest.Mock).mockResolvedValue([adminRole]);
      
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await updateUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.name).toBe('Updated Name');
        expect(result.value.email).toBe('same@example.com');
      }

      expect(mockRepositories.users.findById).toHaveBeenCalledWith(userId);
      expect(mockRepositories.users.findByEmail).not.toHaveBeenCalled(); // Should not check email since it's the same
      expect(mockRepositories.users.update).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        id: userId,
        name: 'Only Name Updated', // Only updating name
      };

      const existingUser = new User(
        userId,
        'Old Name',
        'keep@example.com',
        ['Admin'],
        '+1234567890',
        '+1',
        'password-hash',
        new Date(),
        new Date(),
      );

      const updatedUser = new User(
        userId,
        'Only Name Updated',
        'keep@example.com', // Email unchanged
        ['Admin'],
        '+1234567890', // Phone unchanged
        '+1', // Country code unchanged
        'password-hash',
        new Date(),
        new Date(),
      );

      const adminRole = new Role(1, 'Admin', 'Administrator', 'المدير');

      (mockRepositories.users.findById as jest.Mock).mockResolvedValue(existingUser);
      (mockRepositories.users.update as jest.Mock).mockResolvedValue(updatedUser);
      (mockRepositories.roles.findByKeys as jest.Mock).mockResolvedValue([adminRole]);
      
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await updateUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.name).toBe('Only Name Updated');
        expect(result.value.email).toBe('keep@example.com'); // Unchanged
        expect(result.value.phoneNumber).toBe('+1234567890'); // Unchanged
      }

      expect(mockRepositories.users.update).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Only Name Updated',
        email: 'keep@example.com',
        phoneNumber: '+1234567890',
        phoneNumberCountryCode: '+1',
      }));
    });
  });
});
