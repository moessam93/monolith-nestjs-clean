import { GetBrandUseCase } from './get-brand.usecase';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Brand } from '../../../domain/entities/brand';
import { BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { isOk, isErr } from '../../common/result';

describe('GetBrandUseCase', () => {
  let getBrandUseCase: GetBrandUseCase;
  let mockBrandsRepo: jest.Mocked<IBrandsRepo>;

  beforeEach(() => {
    mockBrandsRepo = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    getBrandUseCase = new GetBrandUseCase(mockBrandsRepo);
  });

  describe('execute', () => {
    it('should return brand successfully when brand exists', async () => {
      // Arrange
      const brandId = 1;

      const brand = new Brand(
        brandId,
        'Test Brand EN',
        'Test Brand AR',
        'https://logo.jpg',
        'https://test-brand.com',
        new Date('2023-01-01'),
        new Date('2023-06-01'),
      );

      mockBrandsRepo.findById.mockResolvedValue(brand);

      // Act
      const result = await getBrandUseCase.execute(brandId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(brandId);
        expect(result.value.nameEn).toBe('Test Brand EN');
        expect(result.value.nameAr).toBe('Test Brand AR');
        expect(result.value.logoUrl).toBe('https://logo.jpg');
        expect(result.value.websiteUrl).toBe('https://test-brand.com');
        expect(result.value.createdAt).toEqual(new Date('2023-01-01'));
        expect(result.value.updatedAt).toEqual(new Date('2023-06-01'));
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
    });

    it('should return BrandNotFoundError when brand does not exist', async () => {
      // Arrange
      const brandId = 999;

      mockBrandsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await getBrandUseCase.execute(brandId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BrandNotFoundError);
        expect(result.error.code).toBe('BRAND_NOT_FOUND');
        expect(result.error.message).toContain('999');
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
    });

    it('should handle brand with minimal data', async () => {
      // Arrange
      const brandId = 2;

      const brand = new Brand(
        brandId,
        'Minimal Brand',
        '', // Empty nameAr
        '', // Empty logoUrl
        '', // Empty websiteUrl
        new Date('2023-02-01'),
        new Date('2023-02-01'),
      );

      mockBrandsRepo.findById.mockResolvedValue(brand);

      // Act
      const result = await getBrandUseCase.execute(brandId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(brandId);
        expect(result.value.nameEn).toBe('Minimal Brand');
        expect(result.value.nameAr).toBe('');
        expect(result.value.logoUrl).toBe('');
        expect(result.value.websiteUrl).toBe('');
        expect(result.value.createdAt).toEqual(new Date('2023-02-01'));
        expect(result.value.updatedAt).toEqual(new Date('2023-02-01'));
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const brandId = 1;
      const repositoryError = new Error('Database connection failed');

      mockBrandsRepo.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getBrandUseCase.execute(brandId)).rejects.toThrow('Database connection failed');

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
    });
  });
});
