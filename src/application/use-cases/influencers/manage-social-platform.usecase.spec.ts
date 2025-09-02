import { ManageSocialPlatformUseCase } from './manage-social-platform.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('ManageSocialPlatformUseCase', () => {
  let manageSocialPlatformUseCase: ManageSocialPlatformUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;
  let mockSocialPlatformsRepo: jest.Mocked<ISocialPlatformsRepo>;

  beforeEach(() => {
    mockInfluencersRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockSocialPlatformsRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      list: jest.fn(),
    };

    manageSocialPlatformUseCase = new ManageSocialPlatformUseCase(
      mockInfluencersRepo,
      mockSocialPlatformsRepo,
    );
  });

  describe('addOrUpdate', () => {
    it('should create new social platform when it does not exist', async () => {
      // Arrange
      const input = {
        influencerId: 123,
        key: 'instagram',
        url: 'https://instagram.com/test_user',
        numberOfFollowers: 10000,
      };

      const mockInfluencer = new Influencer(
        123,
        'test_user',
        'test@example.com',
        'Test User',
        'المستخدم التجريبي',
        'profile.jpg',
      );

      const createdSocialPlatform = new SocialPlatform(
        456,
        'instagram',
        'https://instagram.com/test_user',
        10000,
        123,
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findOne.mockResolvedValue(null);
      mockSocialPlatformsRepo.create.mockResolvedValue(createdSocialPlatform);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(456);
        expect(result.value.key).toBe('instagram');
        expect(result.value.url).toBe('https://instagram.com/test_user');
        expect(result.value.numberOfFollowers).toBe(10000);
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 123));
      expect(mockSocialPlatformsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', 123).whereEqual('key', 'instagram'));
      expect(mockSocialPlatformsRepo.create).toHaveBeenCalled();
      expect(mockSocialPlatformsRepo.update).not.toHaveBeenCalled();
    });

    it('should update existing social platform', async () => {
      // Arrange
      const input = {
        influencerId: 123,
        key: 'instagram',
        url: 'https://instagram.com/updated_user',
        numberOfFollowers: 15000,
      };

      const mockInfluencer = new Influencer(123, 'test_user', 'test@example.com', 'Test', 'تست', 'profile.jpg');
      
      const existingSocialPlatform = new SocialPlatform(
        456,
        'instagram',
        'https://instagram.com/old_user',
        10000,
        123,
        new Date(),
        new Date(),
      );

      const updatedSocialPlatform = new SocialPlatform(
        456,
        'instagram',
        'https://instagram.com/updated_user',
        15000,
        123,
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findOne.mockResolvedValue(existingSocialPlatform);
      mockSocialPlatformsRepo.update.mockResolvedValue(updatedSocialPlatform);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.url).toBe('https://instagram.com/updated_user');
        expect(result.value.numberOfFollowers).toBe(15000);
      }

      expect(mockSocialPlatformsRepo.update).toHaveBeenCalled();
      expect(mockSocialPlatformsRepo.create).not.toHaveBeenCalled();
    });

    it('should return error when influencer not found', async () => {
      // Arrange
      const input = {
        influencerId: 999,
        key: 'instagram',
        url: 'https://instagram.com/test_user',
        numberOfFollowers: 10000,
      };

      mockInfluencersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Influencer not found with ID: 999');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 999));
      expect(mockSocialPlatformsRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return error when creating new platform without required fields', async () => {
      // Arrange
      const input = {
        influencerId: 123,
        key: 'instagram',
        // Missing url and numberOfFollowers
      };

      const mockInfluencer = new Influencer(123, 'test_user', 'test@example.com', 'Test', 'تست', 'profile.jpg');

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Existing social platform for influencer with ID: 123 and key: instagram and url:  already exists');
      }
    });
  });

  describe('remove', () => {
    it('should remove social platform successfully', async () => {
      // Arrange
      const influencerId = 123;
      const key = 'instagram';

      const mockInfluencer = new Influencer(123, 'test_user', 'test@example.com', 'Test', 'تست', 'profile.jpg');
      const existingSocialPlatform = new SocialPlatform(456, 'instagram', 'url', 10000, 123);

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findOne.mockResolvedValue(existingSocialPlatform);
      mockSocialPlatformsRepo.delete.mockResolvedValue(undefined);

      // Act
      const result = await manageSocialPlatformUseCase.remove(influencerId, key);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 123));
      expect(mockSocialPlatformsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', 123).whereEqual('key', 'instagram'));
      expect(mockSocialPlatformsRepo.delete).toHaveBeenCalledWith(456);
    });

    it('should return error when influencer not found', async () => {
      // Arrange
      const influencerId = 999;
      const key = 'instagram';

      mockInfluencersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.remove(influencerId, key);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Influencer not found with ID: 999');
      }
    });

    it('should return error when social platform not found', async () => {
      // Arrange
      const influencerId = 123;
      const key = 'youtube';

      const mockInfluencer = new Influencer(123, 'test_user', 'test@example.com', 'Test', 'تست', 'profile.jpg');

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.remove(influencerId, key);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("Social platform 'youtube' not found for influencer 123");
      }

      expect(mockSocialPlatformsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', 123).whereEqual('key', 'youtube'));
      expect(mockSocialPlatformsRepo.delete).not.toHaveBeenCalled();
    });
  });
});
