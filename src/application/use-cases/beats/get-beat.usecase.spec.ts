import { GetBeatUseCase } from './get-beat.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';

describe('GetBeatUseCase', () => {
  let getBeatUseCase: GetBeatUseCase;
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
        mockInfluencer,
        mockBrand,
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      mockBeatsRepo.findOne.mockResolvedValue(mockBeat);

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
        expect(result.value.influencer.id).toBe(1);
        expect(result.value.brand.id).toBe(2);
        expect(result.value.createdAt).toEqual(new Date('2024-01-01'));
        expect(result.value.updatedAt).toEqual(new Date('2024-01-02'));
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 123).include(['influencer', 'brand']));
    });

    it('should return BeatNotFoundError when beat not found', async () => {
      // Arrange
      const beatId = 999;
      mockBeatsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await getBeatUseCase.execute(beatId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BeatNotFoundError);
        expect(result.error.code).toBe('BEAT_NOT_FOUND');
        expect(result.error.message).toContain('Beat not found with ID: 999');
      }

      expect(mockBeatsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('id', 999).include(['influencer', 'brand']));
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
        mockInfluencer,
        mockBrand,
        new Date(),
        new Date(),
      );

      mockBeatsRepo.findOne.mockResolvedValue(mockBeat);

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
