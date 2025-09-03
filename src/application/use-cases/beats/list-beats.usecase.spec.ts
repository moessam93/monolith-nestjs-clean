import { ListBeatsUseCase } from './list-beats.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { isOk } from '../../common/result';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

describe('ListBeatsUseCase', () => {
  let listBeatsUseCase: ListBeatsUseCase;
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

    listBeatsUseCase = new ListBeatsUseCase(mockBeatsRepo);
  });

  describe('execute', () => {
    it('should return paginated beats list with default pagination', async () => {
      // Arrange
      const mockBeats = [
        new Beat(1, 'Beat 1', 'url1.mp4', 'thumb1.jpg', 'active', 1, 1, mockInfluencer, mockBrand, new Date(), new Date()),
        new Beat(2, 'Beat 2', 'url2.mp4', 'thumb2.jpg', 'draft', 2, 2, mockInfluencer, mockBrand, new Date(), new Date()),
      ];

      mockBeatsRepo.list.mockResolvedValue({
        data: mockBeats,
        total: 100,
        totalFiltered: 2,
      });

      // Act
      const result = await listBeatsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(2);
        expect(result.value.data[0].id).toBe(1);
        expect(result.value.data[0].caption).toBe('Beat 1');
        expect(result.value.data[1].id).toBe(2);
        expect(result.value.data[1].caption).toBe('Beat 2');
        expect(result.value.meta.total).toBe(100);
        expect(result.value.meta.totalFiltered).toBe(2);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(10);
      }

      expect(mockBeatsRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          includes: ['influencer', 'brand'],
          pagination: { page: 1, limit: 10 },
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          criteria: []
        })
      );
    });

    it('should return filtered beats list with search and filters', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'test',
        influencerId: 123,
        brandId: 456,
        statusKey: 'active',
      };

      const mockBeats = [
        new Beat(1, 'Test Beat', 'url1.mp4', 'thumb1.jpg', 'active', 123, 456, mockInfluencer, mockBrand, new Date(), new Date()),
      ];

      mockBeatsRepo.list.mockResolvedValue({
        data: mockBeats,
        total: 1000,
        totalFiltered: 1,
      });

      // Act
      const result = await listBeatsUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.meta.page).toBe(2);
        expect(result.value.meta.limit).toBe(5);
        expect(result.value.meta.total).toBe(1000);
        expect(result.value.meta.totalFiltered).toBe(1);
      }

      expect(mockBeatsRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          includes: ['influencer', 'brand'],
          pagination: { page: 2, limit: 5 },
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          criteria: expect.arrayContaining([
            { influencerId: 123 },
            { brandId: 456 },
            { statusKey: 'active' },
            expect.objectContaining({
              OR: expect.any(Array)
            })
          ])
        })
      );
    });

    it('should handle beats with null captions', async () => {
      // Arrange
      const mockBeats = [
        new Beat(1, null, 'url1.mp4', 'thumb1.jpg', 'active', 1, 1, mockInfluencer, mockBrand, new Date(), new Date()),
      ];

      mockBeatsRepo.list.mockResolvedValue({
        data: mockBeats,
        total: 1,
        totalFiltered: 1,
      });

      // Act
      const result = await listBeatsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data[0].caption).toBeUndefined();
      }
    });

    it('should return empty list when no beats found', async () => {
      // Arrange
      mockBeatsRepo.list.mockResolvedValue({
        data: [],
        total: 0,
        totalFiltered: 0,
      });

      // Act
      const result = await listBeatsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(0);
        expect(result.value.meta.totalFiltered).toBe(0);
      }
    });
  });
});
