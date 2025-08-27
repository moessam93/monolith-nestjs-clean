import { GetBeatUseCase } from './get-beat.usecase';
import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { Beat } from '../../../domain/entities/beat';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { isOk, isErr } from '../../common/result';

describe('GetBeatUseCase', () => {
  let getBeatUseCase: GetBeatUseCase;
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

    getBeatUseCase = new GetBeatUseCase(mockBeatsRepo);
  });

  describe('execute', () => {
    it('should return beat when found', async () => {
      // Arrange
      const beatId = 123;
      const mockBeat = new Beat(
        123,
        'Test beat caption',
        'https://example.com/video.mp4',
        'https://example.com/thumb.jpg',
        'active',
        1,
        2,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      mockBeatsRepo.findById.mockResolvedValue(mockBeat);

      // Act
      const result = await getBeatUseCase.execute(beatId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.caption).toBe('Test beat caption');
        expect(result.value.mediaUrl).toBe('https://example.com/video.mp4');
        expect(result.value.thumbnailUrl).toBe('https://example.com/thumb.jpg');
        expect(result.value.statusKey).toBe('active');
        expect(result.value.influencerId).toBe(1);
        expect(result.value.brandId).toBe(2);
        expect(result.value.createdAt).toEqual(new Date('2024-01-01'));
        expect(result.value.updatedAt).toEqual(new Date('2024-01-02'));
      }

      expect(mockBeatsRepo.findById).toHaveBeenCalledWith(123);
    });

    it('should return BeatNotFoundError when beat not found', async () => {
      // Arrange
      const beatId = 999;
      mockBeatsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await getBeatUseCase.execute(beatId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BeatNotFoundError);
        expect(result.error.code).toBe('BEAT_NOT_FOUND');
        expect(result.error.message).toContain('Beat not found with ID: 999');
      }

      expect(mockBeatsRepo.findById).toHaveBeenCalledWith(999);
    });

    it('should handle beat with null caption', async () => {
      // Arrange
      const beatId = 123;
      const mockBeat = new Beat(
        123,
        null, // No caption
        'https://example.com/video.mp4',
        'https://example.com/thumb.jpg',
        'active',
        1,
        2,
        new Date(),
        new Date(),
      );

      mockBeatsRepo.findById.mockResolvedValue(mockBeat);

      // Act
      const result = await getBeatUseCase.execute(beatId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.caption).toBeUndefined();
      }
    });
  });
});
