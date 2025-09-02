import { DeleteInfluencerUseCase } from './delete-influencer.usecase';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { InfluencerNotFoundError } from '../../../domain/errors/influencer-errors';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('DeleteInfluencerUseCase', () => {
  let deleteInfluencerUseCase: DeleteInfluencerUseCase;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;

  beforeEach(() => {
    mockInfluencersRepo = {
      findMany: jest.fn(),
      findOne: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    deleteInfluencerUseCase = new DeleteInfluencerUseCase(mockInfluencersRepo);
  });

  describe('execute', () => {
    it('should delete influencer successfully when influencer exists', async () => {
      // Arrange
      const influencerId = 1;

      const socialPlatform = new SocialPlatform(1, 'instagram', 'https://instagram.com/deletetest', 5000, influencerId, new Date(), new Date());

      const influencer = new Influencer(
        influencerId,
        'deletetest',
        'delete@test.com',
        'Delete Test User EN',
        'Delete Test User AR',
        'https://delete-profile.jpg',
        [socialPlatform],
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(influencer);
      mockInfluencersRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).toHaveBeenCalledWith(influencerId);
    });

    it('should return InfluencerNotFoundError when influencer does not exist', async () => {
      // Arrange
      const influencerId = 999;

      mockInfluencersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await deleteInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(InfluencerNotFoundError);
        expect(result.error.code).toBe('INFLUENCER_NOT_FOUND');
        expect(result.error.message).toContain('999');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).not.toHaveBeenCalled();
    });

    it('should handle repository delete errors gracefully', async () => {
      // Arrange
      const influencerId = 1;

      const influencer = new Influencer(
        influencerId,
        'testuser',
        'test@example.com',
        'Test User EN',
        'Test User AR',
        'https://profile.jpg',
        [],
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      const deleteError = new Error('Cannot delete influencer with existing beats');

      mockInfluencersRepo.findOne.mockResolvedValue(influencer);
      mockInfluencersRepo.delete.mockRejectedValue(deleteError);

      // Act & Assert
      await expect(deleteInfluencerUseCase.execute(influencerId)).rejects.toThrow('Cannot delete influencer with existing beats');

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).toHaveBeenCalledWith(influencerId);
    });

    it('should handle repository findById errors gracefully', async () => {
      // Arrange
      const influencerId = 1;
      const repositoryError = new Error('Database connection failed');

      mockInfluencersRepo.findOne.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(deleteInfluencerUseCase.execute(influencerId)).rejects.toThrow('Database connection failed');

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).not.toHaveBeenCalled();
    });

    it('should verify influencer exists before attempting deletion', async () => {
      // Arrange
      const influencerId = 1;

      const socialPlatforms = [
        new SocialPlatform(1, 'instagram', 'https://instagram.com/existing', 10000, influencerId, new Date(), new Date()),
        new SocialPlatform(2, 'tiktok', 'https://tiktok.com/existing', 20000, influencerId, new Date(), new Date()),
      ];

      const influencer = new Influencer(
        influencerId,
        'existinguser',
        'existing@example.com',
        'Existing User EN',
        'Existing User AR',
        'https://existing-profile.jpg',
        socialPlatforms,
        new Date('2022-01-01'),
        new Date('2023-06-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(influencer);
      mockInfluencersRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);

      // Verify the operations were called
      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).toHaveBeenCalledWith(influencerId);
      expect(mockInfluencersRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockInfluencersRepo.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of influencer with no social platforms', async () => {
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
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(influencer);
      mockInfluencersRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteInfluencerUseCase.execute(influencerId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      expect(mockInfluencersRepo.delete).toHaveBeenCalledWith(influencerId);
    });
  });
});