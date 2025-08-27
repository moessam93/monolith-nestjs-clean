import { DeleteBeatUseCase } from './delete-beat.usecase';
import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { Beat } from '../../../domain/entities/beat';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { isOk, isErr } from '../../common/result';

describe('DeleteBeatUseCase', () => {
  let deleteBeatUseCase: DeleteBeatUseCase;
  let mockBeatsRepo: jest.Mocked<IBeatsRepo>;

  beforeEach(() => {
    mockBeatsRepo = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      countByInfluencer: jest.fn(),
      countByBrand: jest.fn(),
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
        new Date(),
        new Date(),
      );

      mockBeatsRepo.findById.mockResolvedValue(existingBeat);
      mockBeatsRepo.delete.mockResolvedValue(undefined);

      // Act
      const result = await deleteBeatUseCase.execute(beatId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockBeatsRepo.findById).toHaveBeenCalledWith(123);
      expect(mockBeatsRepo.delete).toHaveBeenCalledWith(123);
    });

    it('should return BeatNotFoundError when beat does not exist', async () => {
      // Arrange
      const beatId = 999;
      mockBeatsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await deleteBeatUseCase.execute(beatId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BeatNotFoundError);
        expect(result.error.code).toBe('BEAT_NOT_FOUND');
        expect(result.error.message).toContain('Beat not found with ID: 999');
      }

      expect(mockBeatsRepo.findById).toHaveBeenCalledWith(999);
      expect(mockBeatsRepo.delete).not.toHaveBeenCalled();
    });

    it('should verify correct sequence of operations', async () => {
      // Arrange
      const beatId = 123;
      const existingBeat = new Beat(123, 'Test', 'url', 'thumb', 'active', 1, 2);

      mockBeatsRepo.findById.mockResolvedValue(existingBeat);
      mockBeatsRepo.delete.mockResolvedValue(undefined);

      // Act
      await deleteBeatUseCase.execute(beatId);

      // Assert - verify both operations were called
      expect(mockBeatsRepo.findById).toHaveBeenCalledWith(123);
      expect(mockBeatsRepo.delete).toHaveBeenCalledWith(123);
      expect(mockBeatsRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockBeatsRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
