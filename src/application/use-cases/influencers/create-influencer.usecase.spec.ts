import { CreateInfluencerUseCase } from './create-influencer.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('CreateInfluencerUseCase', () => {
  let createInfluencerUseCase: CreateInfluencerUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;
  let mockSocialPlatformsRepo: jest.Mocked<ISocialPlatformsRepo>;

  beforeEach(() => {
    mockInfluencersRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockSocialPlatformsRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      exists: jest.fn(),
      list: jest.fn(),
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
        username: 'test_influencer2',
        email: 'influencer2@example.com',
        nameEn: 'Test Influencer',
        nameAr: 'مؤثر اختبار',
        profilePictureUrl: 'https://example.com/profile.jpg',
      };

      const createdInfluencer = new Influencer(
        123,
        'test_influencer2',
        'influencer2@example.com',
        'Test Influencer',
        'مؤثر اختبار',
        'https://example.com/profile.jpg',
        [],
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(null);
      mockInfluencersRepo.create.mockResolvedValue(createdInfluencer);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.username).toBe('test_influencer2');
        expect(result.value.email).toBe('influencer2@example.com');
        expect(result.value.nameEn).toBe('Test Influencer');
        expect(result.value.nameAr).toBe('مؤثر اختبار');
        expect(result.value.profilePictureUrl).toBe('https://example.com/profile.jpg');
        expect(result.value.socialPlatforms).toHaveLength(0);
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalled();
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

      mockInfluencersRepo.findOne.mockResolvedValue(null);
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

      mockInfluencersRepo.findOne.mockResolvedValue(existingInfluencer);

      // Act
      const result = await createInfluencerUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("Influencer username already exists: existing_influencer");
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalled();
      expect(mockInfluencersRepo.create).not.toHaveBeenCalled();
    });
  });
});
