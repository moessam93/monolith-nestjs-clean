import { CreateBeatUseCase } from './create-beat.usecase';
import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Beat } from '../../../domain/entities/beat';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';
import { isOk, isErr } from '../../common/result';

describe('CreateBeatUseCase', () => {
  let createBeatUseCase: CreateBeatUseCase;
  let mockBeatsRepo: jest.Mocked<IBeatsRepo>;
  let mockInfluencersRepo: jest.Mocked<IInfluencersRepo>;
  let mockBrandsRepo: jest.Mocked<IBrandsRepo>;

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

    mockBrandsRepo = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findByName: jest.fn(),
    };

    createBeatUseCase = new CreateBeatUseCase(
      mockBeatsRepo,
      mockInfluencersRepo,
      mockBrandsRepo,
    );
  });

  describe('execute', () => {
    it('should create beat successfully', async () => {
      // Arrange
      const input = {
        caption: 'Test beat caption',
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        statusKey: 'active',
        influencerId: 1,
        brandId: 2,
      };

      const mockInfluencer = new Influencer(
        1,
        'test_influencer',
        'influencer@example.com',
        'Test Influencer',
        'مؤثر اختبار',
        'https://example.com/profile.jpg',
        [],
        new Date(),
        new Date(),
      );

      const mockBrand = new Brand(
        2,
        'Test Brand',
        'علامة تجارية',
        'https://example.com/logo.jpg',
        'https://testbrand.com',
        new Date(),
        new Date(),
      );

      const createdBeat = new Beat(
        123,
        'Test beat caption',
        'https://example.com/video.mp4',
        'https://example.com/thumb.jpg',
        'active',
        1,
        2,
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findById.mockResolvedValue(mockBrand);
      mockBeatsRepo.create.mockResolvedValue(createdBeat);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.caption).toBe('Test beat caption');
        expect(result.value.mediaUrl).toBe('https://example.com/video.mp4');
        expect(result.value.influencerId).toBe(1);
        expect(result.value.brandId).toBe(2);
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(1);
      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(2);
      expect(mockBeatsRepo.create).toHaveBeenCalled();
    });

    it('should return error when influencer not found', async () => {
      // Arrange
      const input = {
        caption: 'Test beat caption',
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        statusKey: 'active',
        influencerId: 999,
        brandId: 2,
      };

      mockInfluencersRepo.findById.mockResolvedValue(null);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Influencer not found with ID: 999');
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(999);
      expect(mockBrandsRepo.findById).not.toHaveBeenCalled();
      expect(mockBeatsRepo.create).not.toHaveBeenCalled();
    });

    it('should return error when brand not found', async () => {
      // Arrange
      const input = {
        caption: 'Test beat caption',
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        statusKey: 'active',
        influencerId: 1,
        brandId: 999,
      };

      const mockInfluencer = new Influencer(
        1,
        'test_influencer',
        'influencer@example.com',
        'Test Influencer',
        'مؤثر اختبار',
        'https://example.com/profile.jpg',
      );

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Brand not found with ID: 999');
      }

      expect(mockInfluencersRepo.findById).toHaveBeenCalledWith(1);
      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(999);
      expect(mockBeatsRepo.create).not.toHaveBeenCalled();
    });

    it('should create beat without caption', async () => {
      // Arrange
      const input = {
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        statusKey: 'active',
        influencerId: 1,
        brandId: 2,
      };

      const mockInfluencer = new Influencer(1, 'test', 'test@example.com', 'Test', 'تست', 'url');
      const mockBrand = new Brand(2, 'Test Brand', 'علامة', 'logo.jpg', 'website.com');
      const createdBeat = new Beat(123, null, input.mediaUrl, input.thumbnailUrl, input.statusKey, 1, 2);

      mockInfluencersRepo.findById.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findById.mockResolvedValue(mockBrand);
      mockBeatsRepo.create.mockResolvedValue(createdBeat);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.caption).toBeUndefined();
      }
    });
  });
});
