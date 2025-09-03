import { DeleteBeatUseCase } from './delete-beat.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';

describe('DeleteBeatUseCase', () => {
  let deleteBeatUseCase: DeleteBeatUseCase;
  let mockBeatsRepo: jest.Mocked<IBaseRepository<Beat, number>>;

  const mockInfluencer = new Influencer(1, 'testuser', 'test@example.com', 'Test User EN', 'Test User AR', 'profile.jpg', [], new Date(), new Date());
  const mockBrand = new Brand(2, 'Test Brand EN', 'Test Brand AR', 'logo.jpg', 'website.com', new Date(), new Date());

  beforeEach(() => {
    mockBeatsRepo = {
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

    deleteBeatUseCase = new DeleteBeatUseCase(mockBeatsRepo);
  });

  describe('execute', () => {
    it('should delete beat successfully when it exists', async () => {
      // Arrange
      const beatId = 123;
      const existingBeat = new Beat(
        123,
        'Test beat',
        'https://example.com/video.mp4',
        'https://example.com/thumb.jpg',
        'active',
        1,
        2,
        mockInfluencer,
        mockBrand,
        new Date(),
        new Date(),
      );

      mockBeatsRepo.findOne.mockResolvedValue(existingBeat);
      mockBeatsRepo.delete.mockResolvedValue(undefined);

      // Act
      const result = await deleteBeatUseCase.execute(beatId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 123));
      expect(mockBeatsRepo.delete).toHaveBeenCalledWith(123);
    });

    it('should return BeatNotFoundError when beat does not exist', async () => {
      // Arrange
      const beatId = 999;
      mockBeatsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await deleteBeatUseCase.execute(beatId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BeatNotFoundError);
        expect(result.error.code).toBe('BEAT_NOT_FOUND');
        expect(result.error.message).toContain('Beat not found with ID: 999');
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 999));
      expect(mockBeatsRepo.delete).not.toHaveBeenCalled();
    });

    it('should verify correct sequence of operations', async () => {
      // Arrange
      const beatId = 123;
      const existingBeat = new Beat(123, 'Test', 'url', 'thumb', 'active', 1, 2, mockInfluencer, mockBrand);

      mockBeatsRepo.findOne.mockResolvedValue(existingBeat);
      mockBeatsRepo.delete.mockResolvedValue(undefined);

      // Act
      await deleteBeatUseCase.execute(beatId);

      // Assert - verify both operations were called
      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 123));
      expect(mockBeatsRepo.delete).toHaveBeenCalledWith(123);
      expect(mockBeatsRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockBeatsRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
