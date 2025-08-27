import { BootstrapFirstSuperAdminUseCase } from './bootstrap-first-superadmin.usecase';
import { IUnitOfWork, IRepositories } from '../../../domain/uow/unit-of-work';
import { PasswordHasherPort } from '../../ports/password-hasher.port';
import { User } from '../../../domain/entities/user';
import { UserAlreadyExistsError } from '../../../domain/errors/user-errors';
import { RoleKey } from '../../../domain/value-objects/role-key';
import { isOk, isErr } from '../../common/result';

describe('BootstrapFirstSuperAdminUseCase', () => {
  let bootstrapUseCase: BootstrapFirstSuperAdminUseCase;
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
      roles: {
        findByKey: jest.fn(),
        findByKeys: jest.fn(),
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

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    bootstrapUseCase = new BootstrapFirstSuperAdminUseCase(
      mockUnitOfWork,
      mockPasswordHasher,
    );
  });

  describe('execute', () => {
    it('should create first SuperAdmin successfully', async () => {
      // Arrange
      const input = {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        phoneCountryCode: '+1',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = new User(
        'user-123',
        'Super Admin',
        'admin@example.com',
        [RoleKey.SUPER_ADMIN],
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
      const result = await bootstrapUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe('user-123');
      }

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
      expect(mockUnitOfWork.execute).toHaveBeenCalled();
    });

    it('should return UserAlreadyExistsError when user already exists', async () => {
      // Arrange
      const input = {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'password123',
      };

      const existingUser = new User(
        'existing-user',
        'Existing User',
        'admin@example.com',
        ['Admin'],
      );

      mockUnitOfWork.execute.mockImplementation(async (work) => {
        mockRepositories.users.findByEmail.mockResolvedValue(existingUser);
        return work(mockRepositories);
      });

      // Act
      const result = await bootstrapUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
        expect(result.error.code).toBe('USER_ALREADY_EXISTS');
      }

      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    });
  });
});
