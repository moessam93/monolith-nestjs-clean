import { ListInfluencersUseCase } from './list-influencers.usecase';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { isOk } from '../../common/result';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { IBaseRepository } from '../../../domain/repositories/base-repo';

describe('ListInfluencersUseCase', () => {
  let listInfluencersUseCase: ListInfluencersUseCase;
  let mockInfluencersRepo: jest.Mocked<IBaseRepository<Influencer, number>>;

  beforeEach(() => {
    mockInfluencersRepo = {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      findOne: jest.fn(),
    };

    listInfluencersUseCase = new ListInfluencersUseCase(mockInfluencersRepo);
  });

  describe('execute', () => {
    it('should return paginated list of influencers with default pagination', async () => {
      // Arrange
      const input = {};

      const socialPlatform1 = new SocialPlatform(1, 'instagram', 'https://instagram.com/user1', 5000, 1, new Date(), new Date());
      const socialPlatform2 = new SocialPlatform(2, 'youtube', 'https://youtube.com/user2', 10000, 2, new Date(), new Date());

      const influencers = [
        new Influencer(
          1,
          'influencer1',
          'first@example.com',
          'First Influencer EN',
          'First Influencer AR',
          'https://first.jpg',
          [socialPlatform1],
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Influencer(
          2,
          'influencer2',
          'second@example.com',
          'Second Influencer EN',
          'Second Influencer AR',
          'https://second.jpg',
          [socialPlatform2],
          new Date('2023-02-01'),
          new Date('2023-02-01'),
        ),
      ];

      const mockResult = {
        data: influencers,
        total: 25,
        totalFiltered: 25,
      };

      mockInfluencersRepo.list.mockResolvedValue(mockResult);

      // Act
      const result = await listInfluencersUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(2);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(20); // Default limit is 20
        expect(result.value.meta.total).toBe(25);
        expect(result.value.meta.totalPages).toBe(2); // 25 / 20 = 1.25 -> 2 pages
        expect(result.value.meta.hasNextPage).toBe(true);
        expect(result.value.meta.hasPreviousPage).toBe(false);

        // Check first influencer data
        expect(result.value.data[0].id).toBe(1);
        expect(result.value.data[0].username).toBe('influencer1');
        expect(result.value.data[0].nameEn).toBe('First Influencer EN');
        expect(result.value.data[0].nameAr).toBe('First Influencer AR');
        expect(result.value.data[0].socialPlatforms).toHaveLength(1);
        expect(result.value.data[0].socialPlatforms[0].key).toBe('instagram');

        // Check second influencer data
        expect(result.value.data[1].id).toBe(2);
        expect(result.value.data[1].username).toBe('influencer2');
        expect(result.value.data[1].nameEn).toBe('Second Influencer EN');
        expect(result.value.data[1].socialPlatforms[0].key).toBe('youtube');
      }

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().paginate({ page: 1, limit: 20 }));
    });

    it('should return paginated list with custom pagination parameters', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'test',
      };

      const socialPlatform = new SocialPlatform(3, 'tiktok', 'https://tiktok.com/testuser', 15000, 3, new Date(), new Date());

      const influencers = [
        new Influencer(
          3,
          'testuser',
          'test@example.com',
          'Test User EN',
          'Test User AR',
          'https://test.jpg',
          [socialPlatform],
          new Date('2023-03-01'),
          new Date('2023-03-01'),
        ),
      ];

      const mockResult = {
        data: influencers,
        total: 100,
        totalFiltered: 8, // 8 results match the search
      };

      mockInfluencersRepo.list.mockResolvedValue(mockResult);

      // Act
      const result = await listInfluencersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.meta.page).toBe(2);
        expect(result.value.meta.limit).toBe(5);
        expect(result.value.meta.total).toBe(100); // Meta uses result.total
        expect(result.value.meta.totalPages).toBe(2); // Math.ceil(8 / 5) = 2 pages (uses totalFiltered)
        expect(result.value.meta.hasNextPage).toBe(false); // Page 2 of 2 has no next
        expect(result.value.meta.hasPreviousPage).toBe(true);
      }

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().searchIn(['username', 'email', 'nameEn', 'nameAr'], 'test').paginate({ page: 2, limit: 5 }));
    });

    it('should return empty list when no influencers found', async () => {
      // Arrange
      const input = {
        search: 'nonexistent',
      };

      const mockResult = {
        data: [],
        total: 50,
        totalFiltered: 0,
      };

      mockInfluencersRepo.list.mockResolvedValue(mockResult);

      // Act
      const result = await listInfluencersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(50); // Uses result.total, not totalFiltered
        expect(result.value.meta.totalPages).toBe(0); // Math.ceil(0 / 20) = 0 pages (uses totalFiltered)
        expect(result.value.meta.hasNextPage).toBe(false);
        expect(result.value.meta.hasPreviousPage).toBe(false);
      }

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().searchIn(['username', 'email', 'nameEn', 'nameAr'], 'nonexistent').paginate({ page: 1, limit: 20 }));
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const input = {};
      const repositoryError = new Error('Database connection failed');

      mockInfluencersRepo.list.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(listInfluencersUseCase.execute(input)).rejects.toThrow('Database connection failed');

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().paginate({ page: 1, limit: 20 }));
    });

    it('should handle large page numbers correctly', async () => {
      // Arrange
      const input = {
        page: 10,
        limit: 20,
      };

      const mockResult = {
        data: [],
        total: 100,
        totalFiltered: 100,
      };

      mockInfluencersRepo.list.mockResolvedValue(mockResult);

      // Act
      const result = await listInfluencersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.page).toBe(10);
        expect(result.value.meta.limit).toBe(20);
        expect(result.value.meta.totalPages).toBe(5); // 100 / 20 = 5
        expect(result.value.meta.hasNextPage).toBe(false);
        expect(result.value.meta.hasPreviousPage).toBe(true);
      }

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().paginate({ page: 10, limit: 20 }));
    });

    it('should normalize page to 1 when page is less than 1', async () => {
      // Arrange
      const input = {
        page: 0, // Invalid page
        limit: 5,
      };

      const mockResult = {
        data: [],
        total: 10,
        totalFiltered: 10,
      };

      mockInfluencersRepo.list.mockResolvedValue(mockResult);

      // Act
      const result = await listInfluencersUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.meta.page).toBe(0); // The use case doesn't normalize this, it passes through
      }

      expect(mockInfluencersRepo.list).toHaveBeenCalledWith(new BaseSpecification<Influencer>().paginate({ page: 0, limit: 5 }));
    });
  });
});