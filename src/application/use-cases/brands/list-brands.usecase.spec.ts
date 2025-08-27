import { ListBrandsUseCase } from './list-brands.usecase';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Brand } from '../../../domain/entities/brand';
import { isOk } from '../../common/result';

describe('ListBrandsUseCase', () => {
  let listBrandsUseCase: ListBrandsUseCase;
  let mockBrandsRepo: jest.Mocked<IBrandsRepo>;

  beforeEach(() => {
    mockBrandsRepo = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findByName: jest.fn(),
    };

    listBrandsUseCase = new ListBrandsUseCase(mockBrandsRepo);
  });

  describe('execute', () => {
    it('should return paginated brands list with default pagination', async () => {
      // Arrange
      const mockBrands = [
        new Brand(1, 'Nike', 'نايكي', 'nike-logo.png', 'nike.com', new Date(), new Date()),
        new Brand(2, 'Adidas', 'أديداس', 'adidas-logo.png', 'adidas.com', new Date(), new Date()),
      ];

      mockBrandsRepo.list.mockResolvedValue({
        data: mockBrands,
        total: 100,
        totalFiltered: 2,
      });

      // Act
      const result = await listBrandsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(2);
        expect(result.value.data[0].id).toBe(1);
        expect(result.value.data[0].nameEn).toBe('Nike');
        expect(result.value.data[0].nameAr).toBe('نايكي');
        expect(result.value.data[1].id).toBe(2);
        expect(result.value.data[1].nameEn).toBe('Adidas');
        expect(result.value.meta.total).toBe(100);
        expect(result.value.meta.totalFiltered).toBe(2);
        expect(result.value.meta.page).toBe(1);
        expect(result.value.meta.limit).toBe(20);
      }

      expect(mockBrandsRepo.list).toHaveBeenCalledWith({ 
        page: 1, 
        limit: 20, 
        search: undefined 
      });
    });

    it('should return filtered brands list with search', async () => {
      // Arrange
      const input = {
        page: 2,
        limit: 5,
        search: 'nike',
      };

      const mockBrands = [
        new Brand(1, 'Nike', 'نايكي', 'nike-logo.png', 'nike.com', new Date(), new Date()),
      ];

      mockBrandsRepo.list.mockResolvedValue({
        data: mockBrands,
        total: 50,
        totalFiltered: 1,
      });

      // Act
      const result = await listBrandsUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.data[0].nameEn).toBe('Nike');
        expect(result.value.meta.page).toBe(2);
        expect(result.value.meta.limit).toBe(5);
        expect(result.value.meta.total).toBe(50);
        expect(result.value.meta.totalFiltered).toBe(1);
      }

      expect(mockBrandsRepo.list).toHaveBeenCalledWith({ 
        page: 2, 
        limit: 5, 
        search: 'nike' 
      });
    });

    it('should return empty list when no brands found', async () => {
      // Arrange
      mockBrandsRepo.list.mockResolvedValue({
        data: [],
        total: 0,
        totalFiltered: 0,
      });

      // Act
      const result = await listBrandsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.data).toHaveLength(0);
        expect(result.value.meta.total).toBe(0);
        expect(result.value.meta.totalFiltered).toBe(0);
      }
    });

    it('should map all brand properties correctly', async () => {
      // Arrange
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const mockBrands = [
        new Brand(1, 'Nike', 'نايكي', 'https://example.com/nike.png', 'https://nike.com', createdAt, updatedAt),
      ];

      mockBrandsRepo.list.mockResolvedValue({
        data: mockBrands,
        total: 1,
        totalFiltered: 1,
      });

      // Act
      const result = await listBrandsUseCase.execute();

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const brand = result.value.data[0];
        expect(brand.id).toBe(1);
        expect(brand.nameEn).toBe('Nike');
        expect(brand.nameAr).toBe('نايكي');
        expect(brand.logoUrl).toBe('https://example.com/nike.png');
        expect(brand.websiteUrl).toBe('https://nike.com');
        expect(brand.createdAt).toEqual(createdAt);
        expect(brand.updatedAt).toEqual(updatedAt);
      }
    });
  });
});
