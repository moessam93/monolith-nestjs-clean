import { ManageSocialPlatformUseCase } from './manage-social-platform.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk, isErr } from '../../common/result';

describe('ManageSocialPlatformUseCase', () => {
  let manageSocialPlatformUseCase: ManageSocialPlatformUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;
  let mockSocialPlatformsRepo: jest.Mocked<ISocialPlatformsRepo>;

  beforeEach(() => {
    mockInfluencersRepo = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByUsername: jest.fn(),
      existsByEmail: jest.fn(),
    };

    mockSocialPlatformsRepo = {
      findById: jest.fn(),
      findByInfluencerId: jest.fn(),
      findByInfluencerAndKey: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByInfluencerAndKey: jest.fn(),
      exists: jest.fn(),
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

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findByInfluencerAndKey.mockResolvedValue(null);
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

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(123);
      expect(mockSocialPlatformsRepo.findByInfluencerAndKey).toHaveBeenCalledWith(123, 'instagram');
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

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findByInfluencerAndKey.mockResolvedValue(existingSocialPlatform);
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

      mockInfluencersRepo.findById.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Influencer not found with ID: 999');
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(999);
      expect(mockSocialPlatformsRepo.findByInfluencerAndKey).not.toHaveBeenCalled();
    });

    it('should return error when creating new platform without required fields', async () => {
      // Arrange
      const input = {
        influencerId: 123,
        key: 'instagram',
        // Missing url and numberOfFollowers
      };

      const mockInfluencer = new Influencer(123, 'test_user', 'test@example.com', 'Test', 'تست', 'profile.jpg');

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findByInfluencerAndKey.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.addOrUpdate(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('URL and numberOfFollowers are required for new social platform');
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

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findByInfluencerAndKey.mockResolvedValue(existingSocialPlatform);
      mockSocialPlatformsRepo.deleteByInfluencerAndKey.mockResolvedValue(undefined);

      // Act
      const result = await manageSocialPlatformUseCase.remove(influencerId, key);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(123);
      expect(mockSocialPlatformsRepo.findByInfluencerAndKey).toHaveBeenCalledWith(123, 'instagram');
      expect(mockSocialPlatformsRepo.deleteByInfluencerAndKey).toHaveBeenCalledWith(123, 'instagram');
    });

    it('should return error when influencer not found', async () => {
      // Arrange
      const influencerId = 999;
      const key = 'instagram';

      mockInfluencersRepo.findById.mockResolvedValue(null);

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

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockSocialPlatformsRepo.findByInfluencerAndKey.mockResolvedValue(null);

      // Act
      const result = await manageSocialPlatformUseCase.remove(influencerId, key);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("Social platform 'youtube' not found for influencer 123");
      }

      expect(mockSocialPlatformsRepo.deleteByInfluencerAndKey).not.toHaveBeenCalled();
    });
  });
});
