import { CreateBeatUseCase } from './create-beat.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';
import { isOk, isErr } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('CreateBeatUseCase', () => {
  let createBeatUseCase: CreateBeatUseCase;
  let mockBeatsRepo: jest.Mocked<IBaseRepository<Beat, number>>;
  let mockInfluencersRepo: jest.Mocked<IBaseRepository<Influencer, number>>;
  let mockBrandsRepo: jest.Mocked<IBaseRepository<Brand, number>>;

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

    mockBrandsRepo = {
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
        mockInfluencer,
        mockBrand,
        new Date(),
        new Date(),
      );

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findOne.mockResolvedValue(mockBrand);
      mockBeatsRepo.create.mockResolvedValue(createdBeat);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.caption).toBe('Test beat caption');
        expect(result.value.mediaUrl).toBe('https://example.com/video.mp4');
        expect(result.value.influencer.id).toBe(1);
        expect(result.value.brand.id).toBe(2);
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 1));
      expect(mockBrandsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Brand>().whereEqual('id', 2));
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

      mockInfluencersRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Influencer not found with ID: 999');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 999));
      expect(mockBrandsRepo.findOne).not.toHaveBeenCalled();
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

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await createBeatUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('Brand not found with ID: 999');
      }

      expect(mockInfluencersRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Influencer>().whereEqual('id', 1));
      expect(mockBrandsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Brand>().whereEqual('id', 999));
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
      const createdBeat = new Beat(123, null, input.mediaUrl, input.thumbnailUrl, input.statusKey, 1, 2, mockInfluencer, mockBrand);

      mockInfluencersRepo.findOne.mockResolvedValue(mockInfluencer);
      mockBrandsRepo.findOne.mockResolvedValue(mockBrand);
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
