import { GetInfluencerUseCase } from './get-influencer.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { InfluencerNotFoundError } from '../../../domain/errors/influencer-errors';
import { isOk, isErr } from '../../common/result';

describe('GetInfluencerUseCase', () => {
  let getInfluencerUseCase: GetInfluencerUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;

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

    getInfluencerUseCase = new GetInfluencerUseCase(mockInfluencersRepo);
  });

  describe('execute', () => {
    it('should return influencer successfully when influencer exists', async () => {
      // Arrange
      const influencerId = 1;

      const socialPlatforms = [
        new SocialPlatform(1, 'instagram', 'https://instagram.com/testuser', 5000, influencerId, new Date('2023-01-01'), new Date('2023-01-01')),
        new SocialPlatform(2, 'youtube', 'https://youtube.com/testuser', 10000, influencerId, new Date('2023-01-01'), new Date('2023-01-01')),
      ];

      const influencer = new Influencer(
        influencerId,
        'testinfluencer',
        'test@influencer.com',
        'Test Influencer EN',
        'Test Influencer AR',
        'https://profile.jpg',
        socialPlatforms,
        new Date('2023-01-01'),
        new Date('2023-06-01'),
      );

      mockInfluencersRepo.findById.mockResolvedValue(influencer);

      // Act
      const result = await getInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(influencerId);
        expect(result.value.username).toBe('testinfluencer');
        expect(result.value.email).toBe('test@influencer.com');
        expect(result.value.nameEn).toBe('Test Influencer EN');
        expect(result.value.nameAr).toBe('Test Influencer AR');
        expect(result.value.profilePictureUrl).toBe('https://profile.jpg');
        expect(result.value.socialPlatforms).toHaveLength(2);
        expect(result.value.socialPlatforms[0].key).toBe('instagram');
        expect(result.value.socialPlatforms[0].url).toBe('https://instagram.com/testuser');
        expect(result.value.socialPlatforms[0].numberOfFollowers).toBe(5000);
        expect(result.value.socialPlatforms[1].key).toBe('youtube');
        expect(result.value.createdAt).toEqual(new Date('2023-01-01'));
        expect(result.value.updatedAt).toEqual(new Date('2023-06-01'));
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(influencerId);
    });

    it('should return InfluencerNotFoundError when influencer does not exist', async () => {
      // Arrange
      const influencerId = 999;

      mockInfluencersRepo.findById.mockResolvedValue(null);

      // Act
      const result = await getInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InfluencerNotFoundError);
        expect(result.error.code).toBe('INFLUENCER_NOT_FOUND');
        expect(result.error.message).toContain('999');
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(influencerId);
    });

    it('should handle influencer with no social platforms', async () => {
      // Arrange
      const influencerId = 2;

      const influencer = new Influencer(
        influencerId,
        'minimal',
        'minimal@example.com',
        'Minimal User EN',
        'Minimal User AR',
        '',
        [], // No social platforms
        new Date('2023-02-01'),
        new Date('2023-02-01'),
      );

      mockInfluencersRepo.findById.mockResolvedValue(influencer);

      // Act
      const result = await getInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(influencerId);
        expect(result.value.username).toBe('minimal');
        expect(result.value.nameEn).toBe('Minimal User EN');
        expect(result.value.nameAr).toBe('Minimal User AR');
        expect(result.value.profilePictureUrl).toBe('');
        expect(result.value.socialPlatforms).toEqual([]);
        expect(result.value.createdAt).toEqual(new Date('2023-02-01'));
        expect(result.value.updatedAt).toEqual(new Date('2023-02-01'));
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(influencerId);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const influencerId = 1;
      const repositoryError = new Error('Database connection failed');

      mockInfluencersRepo.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getInfluencerUseCase.execute(influencerId)).rejects.toThrow('Database connection failed');

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(influencerId);
    });

    it('should handle influencer with multiple social platforms', async () => {
      // Arrange
      const influencerId = 3;

      const socialPlatforms = [
        new SocialPlatform(1, 'instagram', 'https://instagram.com/multi', 15000, influencerId, new Date(), new Date()),
        new SocialPlatform(2, 'youtube', 'https://youtube.com/multi', 25000, influencerId, new Date(), new Date()),
        new SocialPlatform(3, 'tiktok', 'https://tiktok.com/multi', 50000, influencerId, new Date(), new Date()),
        new SocialPlatform(4, 'twitter', 'https://twitter.com/multi', 8000, influencerId, new Date(), new Date()),
      ];

      const influencer = new Influencer(
        influencerId,
        'multiplatform',
        'multi@platform.com',
        'Multi Platform Influencer EN',
        'Multi Platform Influencer AR',
        'https://multi-profile.jpg',
        socialPlatforms,
        new Date('2022-01-01'),
        new Date('2023-12-01'),
      );

      mockInfluencersRepo.findById.mockResolvedValue(influencer);

      // Act
      const result = await getInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.socialPlatforms).toHaveLength(4);
        expect(result.value.socialPlatforms.map(sp => sp.key)).toEqual(['instagram', 'youtube', 'tiktok', 'twitter']);
        expect(result.value.socialPlatforms.find(sp => sp.key === 'tiktok')?.numberOfFollowers).toBe(50000);
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(influencerId);
    });
  });
});