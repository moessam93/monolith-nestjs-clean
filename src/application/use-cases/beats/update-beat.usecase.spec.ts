import { UpdateBeatUseCase } from './update-beat.usecase';
import { Beat } from '../../../domain/entities/beat';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { isOk, isErr } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('UpdateBeatUseCase', () => {
  let updateBeatUseCase: UpdateBeatUseCase;
  let mockBeatsRepo: jest.Mocked<IBaseRepository<Beat, number>>;
  let mockInfluencersRepo: jest.Mocked<IBaseRepository<Influencer, number>>;
  let mockBrandsRepo: jest.Mocked<IBaseRepository<Brand, number>>;

  beforeEach(() => {
    mockBeatsRepo = {
      findOne: jest.fn(),
      findMany: jest.fn(),
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

    mockInfluencersRepo = {
      findOne: jest.fn(),
      findMany: jest.fn(),
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

    mockBrandsRepo = {
      findOne: jest.fn(),
      findMany: jest.fn(),
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

    updateBeatUseCase = new UpdateBeatUseCase(mockBeatsRepo, mockInfluencersRepo, mockBrandsRepo);
  });

  describe('execute', () => {
    const mockInfluencer = new Influencer(1, 'testuser', 'test@example.com', 'Test User EN', 'Test User AR', 'profile.jpg', [], new Date(), new Date());
    const mockBrand = new Brand(2, 'Test Brand EN', 'Test Brand AR', 'logo.jpg', 'website.com', new Date(), new Date());

    it('should update beat successfully with all fields', async () => {
      // Arrange
      const input = {
        id: 123,
        caption: 'Updated caption',
        mediaUrl: 'https://example.com/new-video.mp4',
        thumbnailUrl: 'https://example.com/new-thumb.jpg',
        statusKey: 'published',
      };

      const existingBeat = new Beat(
        123,
        'Original caption',
        'https://example.com/original-video.mp4',
        'https://example.com/original-thumb.jpg',
        'draft',
        1,
        2,
        mockInfluencer,
        mockBrand,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      const updatedBeat = new Beat(
        123,
        'Updated caption',
        'https://example.com/new-video.mp4',
        'https://example.com/new-thumb.jpg',
        'published',
        1,
        2,
        mockInfluencer,
        mockBrand,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      mockBeatsRepo.findOne.mockResolvedValue(existingBeat);
      mockBeatsRepo.update.mockResolvedValue(updatedBeat);

      // Act
      const result = await updateBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.caption).toBe('Updated caption');
        expect(result.value.mediaUrl).toBe('https://example.com/new-video.mp4');
        expect(result.value.thumbnailUrl).toBe('https://example.com/new-thumb.jpg');
        expect(result.value.statusKey).toBe('published');
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 123));
      expect(mockBeatsRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
          caption: 'Updated caption',
          mediaUrl: 'https://example.com/new-video.mp4',
          thumbnailUrl: 'https://example.com/new-thumb.jpg',
          statusKey: 'published',
        })
      );
    });

    it('should update beat with partial fields', async () => {
      // Arrange
      const input = {
        id: 123,
        caption: 'Updated caption only',
      };

      const existingBeat = new Beat(
        123,
        'Original caption',
        'https://example.com/original-video.mp4',
        'https://example.com/original-thumb.jpg',
        'draft',
        1,
        2,
        mockInfluencer,
        mockBrand,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      const updatedBeat = new Beat(
        123,
        'Updated caption only',
        'https://example.com/original-video.mp4',
        'https://example.com/original-thumb.jpg',
        'draft',
        1,
        2,
        mockInfluencer,
        mockBrand,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      mockBeatsRepo.findOne.mockResolvedValue(existingBeat);
      mockBeatsRepo.update.mockResolvedValue(updatedBeat);

      // Act
      const result = await updateBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.caption).toBe('Updated caption only');
        expect(result.value.mediaUrl).toBe('https://example.com/original-video.mp4');
        expect(result.value.statusKey).toBe('draft');
      }

      // Verify only caption was updated in the entity
      const updateCall = mockBeatsRepo.update.mock.calls[0][0];
      expect(updateCall.caption).toBe('Updated caption only');
      expect(updateCall.mediaUrl).toBe('https://example.com/original-video.mp4');
    });

    it('should return BeatNotFoundError when beat does not exist', async () => {
      // Arrange
      const input = {
        id: 999,
        caption: 'Updated caption',
      };

      mockBeatsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await updateBeatUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BeatNotFoundError);
        expect(result.error.code).toBe('BEAT_NOT_FOUND');
        expect(result.error.message).toContain('Beat not found with ID: 999');
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 999));
      expect(mockBeatsRepo.update).not.toHaveBeenCalled();
    });

    it('should handle undefined values correctly', async () => {
      // Arrange
      const input = {
        id: 123,
        caption: undefined,
        mediaUrl: 'https://example.com/new-video.mp4',
        thumbnailUrl: undefined,
        statusKey: undefined,
      };

      const existingBeat = new Beat(123, 'Original', 'old.mp4', 'old.jpg', 'draft', 1, 2, mockInfluencer, mockBrand, new Date('2024-01-01'), new Date('2024-01-01'));
      const updatedBeat = new Beat(123, 'Original', 'https://example.com/new-video.mp4', 'old.jpg', 'draft', 1, 2, mockInfluencer, mockBrand, new Date('2024-01-01'), new Date('2024-01-02'));

      mockBeatsRepo.findOne.mockResolvedValue(existingBeat);
      mockBeatsRepo.update.mockResolvedValue(updatedBeat);

      // Act
      const result = await updateBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      
      // Verify undefined fields were not updated
      const updateCall = mockBeatsRepo.update.mock.calls[0][0];
      expect(updateCall.caption).toBe('Original'); // Unchanged
      expect(updateCall.mediaUrl).toBe('https://example.com/new-video.mp4'); // Updated
      expect(updateCall.thumbnailUrl).toBe('old.jpg'); // Unchanged
      expect(updateCall.statusKey).toBe('draft'); // Unchanged
    });
  });
});
