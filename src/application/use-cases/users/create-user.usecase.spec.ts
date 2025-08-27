import { CreateUserUseCase } from './create-user.usecase';
import { IUnitOfWork, IRepositories } from '../../../domain/uow/unit-of-work';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { User } from '../../../domain/entities/user';
import { UserAlreadyExistsError, InsufficientPermissionsError } from '../../../domain/errors/user-errors';
import { isOk, isErr } from '../../common/result';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUnitOfWork: jest.Mocked<IUnitOfWork>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;
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
      roles: {} as any,
      beats: {} as any,
      brands: {} as any,
      influencers: {} as any,
      socialPlatforms: {} as any,
    };

    mockUnitOfWork = {
      execute: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    createUserUseCase = new CreateUserUseCase(
      mockUnitOfWork,
      mockPasswordHasher,
    );
  });

  describe('execute', () => {
    it('should create user successfully without roles', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        phoneCountryCode: '+1',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        [],
        '+1234567890',
        '+1',
        hashedPassword,
        new Date(),
        new Date(),
      );

      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        mockRepositories.users.findByEmail.mockResolvedValue(null);
        mockRepositories.users.create.mockResolvedValue(createdUser);
        mockRepositories.users.findById.mockResolvedValue(createdUser);
        
        return work(mockRepositories);
      });

      // Act
      const result = await createUserUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
        expect(result.value.name).toBe('John Doe');
        expect(result.value.email).toBe('john@example.com');
      }

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    });

    it('should create user with roles when current user is SuperAdmin', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['SuperAdmin'];

      const hashedPassword = 'hashed-password';
      const createdUser = new User(
        'user-123',
        'John Doe',
        'john@example.com',
        ['Admin'],
        undefined,
        undefined,
        hashedPassword,
        new Date(),
        new Date(),
      );

      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUnitOfWork.execute.mockImplementation(async (work) => {
        mockRepositories.users.findByEmail.mockResolvedValue(null);
        mockRepositories.users.create.mockResolvedValue(createdUser);
        mockRepositories.users.findById.mockResolvedValue(createdUser);
        
        return work(mockRepositories);
      });

      // Act
      const result = await createUserUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isOk(result)).toBe(true);
      expect(mockRepositories.users.setRoles).toHaveBeenCalledWith('user-123', ['Admin']);
    });

    it('should return InsufficientPermissionsError when non-SuperAdmin tries to assign roles', async () => {
      // Arrange
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roleKeys: ['Admin'],
      };
      const currentUserRoles = ['Executive']; // Not SuperAdmin

      mockUnitOfWork.execute.mockImplementation(async (work) => {
        return work(mockRepositories);
      });

      // Act
      const result = await createUserUseCase.execute(input, currentUserRoles);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InsufficientPermissionsError);
        expect(result.error.code).toBe('INSUFFICIENT_PERMISSIONS');
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
      );

      mockUnitOfWork.execute.mockImplementation(async (work) => {
        mockRepositories.users.findByEmail.mockResolvedValue(existingUser);
        return work(mockRepositories);
      });

      // Act
      const result = await createUserUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
        expect(result.error.code).toBe('USER_ALREADY_EXISTS');
      }
    });
  });
});
