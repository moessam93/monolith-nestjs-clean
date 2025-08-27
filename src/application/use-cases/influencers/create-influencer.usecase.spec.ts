import { CreateInfluencerUseCase } from './create-influencer.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk, isErr } from '../../common/result';

describe('CreateInfluencerUseCase', () => {
  let createInfluencerUseCase: CreateInfluencerUseCase;
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

    createInfluencerUseCase = new CreateInfluencerUseCase(
      mockInfluencersRepo,
      mockSocialPlatformsRepo,
    );
  });

  describe('execute', () => {
    it('should create influencer successfully without social platforms', async () => {
      // Arrange
      const input = {
        username: 'test_influencer',
        email: 'influencer@example.com',
        nameEn: 'Test Influencer',
        nameAr: 'مؤثر اختبار',
        profilePictureUrl: 'https://example.com/profile.jpg',
      };

      const createdInfluencer = new Influencer(
        123,
        'test_influencer',
        'influencer@example.com',
        'Test Influencer',
        'مؤثر اختبار',
        'https://example.com/profile.jpg',
        [],
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      mockInfluencersRepo.findByUsername.mockResolvedValue(null);
      mockInfluencersRepo.findByEmail.mockResolvedValue(null);
      mockInfluencersRepo.create.mockResolvedValue(createdInfluencer);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.username).toBe('test_influencer');
        expect(result.value.email).toBe('influencer@example.com');
        expect(result.value.nameEn).toBe('Test Influencer');
        expect(result.value.nameAr).toBe('مؤثر اختبار');
        expect(result.value.profilePictureUrl).toBe('https://example.com/profile.jpg');
        expect(result.value.socialPlatforms).toHaveLength(0);
      }

      expect(mockInfluencersRepo.findByUsername).toHaveBeenCalledWith('test_influencer');
      expect(mockInfluencersRepo.findByEmail).toHaveBeenCalledWith('influencer@example.com');
      expect(mockInfluencersRepo.create).toHaveBeenCalled();
    });

    it('should create influencer with social platforms', async () => {
      // Arrange
      const input = {
        username: 'test_influencer',
        email: 'influencer@example.com',
        nameEn: 'Test Influencer',
        nameAr: 'مؤثر اختبار',
        profilePictureUrl: 'https://example.com/profile.jpg',
        socialPlatforms: [
          {
            key: 'instagram',
            url: 'https://instagram.com/test_influencer',
            numberOfFollowers: 10000,
          },
          {
            key: 'tiktok',
            url: 'https://tiktok.com/@test_influencer',
            numberOfFollowers: 5000,
          },
        ],
      };

      const createdInfluencer = new Influencer(
        123,
        'test_influencer',
        'influencer@example.com',
        'Test Influencer',
        'مؤثر اختبار',
        'https://example.com/profile.jpg',
        [],
        new Date(),
        new Date(),
      );

      const createdInstagramPlatform = new SocialPlatform(
        1,
        'instagram',
        'https://instagram.com/test_influencer',
        10000,
        123,
        new Date(),
        new Date(),
      );

      const createdTikTokPlatform = new SocialPlatform(
        2,
        'tiktok',
        'https://tiktok.com/@test_influencer',
        5000,
        123,
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findByUsername.mockResolvedValue(null);
      mockInfluencersRepo.findByEmail.mockResolvedValue(null);
      mockInfluencersRepo.create.mockResolvedValue(createdInfluencer);
      mockSocialPlatformsRepo.create
        .mockResolvedValueOnce(createdInstagramPlatform)
        .mockResolvedValueOnce(createdTikTokPlatform);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.socialPlatforms).toHaveLength(2);
        expect(result.value.socialPlatforms[0].key).toBe('instagram');
        expect(result.value.socialPlatforms[0].numberOfFollowers).toBe(10000);
        expect(result.value.socialPlatforms[1].key).toBe('tiktok');
        expect(result.value.socialPlatforms[1].numberOfFollowers).toBe(5000);
      }

      expect(mockSocialPlatformsRepo.create).toHaveBeenCalledTimes(2);
    });

    it('should return error when username already exists', async () => {
      // Arrange
      const input = {
        username: 'existing_influencer',
        email: 'new@example.com',
        nameEn: 'Test Influencer',
        nameAr: 'مؤثر اختبار',
        profilePictureUrl: 'https://example.com/profile.jpg',
      };

      const existingInfluencer = new Influencer(
        999,
        'existing_influencer',
        'existing@example.com',
        'Existing Influencer',
        'مؤثر موجود',
        'https://example.com/existing.jpg',
      );

      mockInfluencersRepo.findByUsername.mockResolvedValue(existingInfluencer);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("Influencer with username 'existing_influencer' already exists");
      }

      expect(mockInfluencersRepo.findByUsername).toHaveBeenCalledWith('existing_influencer');
      expect(mockInfluencersRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockInfluencersRepo.create).not.toHaveBeenCalled();
    });

    it('should return error when email already exists', async () => {
      // Arrange
      const input = {
        username: 'new_influencer',
        email: 'existing@example.com',
        nameEn: 'Test Influencer',
        nameAr: 'مؤثر اختبار',
        profilePictureUrl: 'https://example.com/profile.jpg',
      };

      const existingInfluencer = new Influencer(
        999,
        'existing_user',
        'existing@example.com',
        'Existing Influencer',
        'مؤثر موجود',
        'https://example.com/existing.jpg',
      );

      mockInfluencersRepo.findByUsername.mockResolvedValue(null);
      mockInfluencersRepo.findByEmail.mockResolvedValue(existingInfluencer);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("Influencer with email 'existing@example.com' already exists");
      }

      expect(mockInfluencersRepo.findByUsername).toHaveBeenCalledWith('new_influencer');
      expect(mockInfluencersRepo.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockInfluencersRepo.create).not.toHaveBeenCalled();
    });
  });
});
