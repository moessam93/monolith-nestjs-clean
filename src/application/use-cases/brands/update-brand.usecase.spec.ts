import { UpdateBrandUseCase } from './update-brand.usecase';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Brand } from '../../../domain/entities/brand';
import { BrandNotFoundError, BrandNameAlreadyExistsError } from '../../../domain/errors/brand-errors';
import { isOk, isErr } from '../../common/result';

describe('UpdateBrandUseCase', () => {
  let updateBrandUseCase: UpdateBrandUseCase;
  let mockBrandsRepo: jest.Mocked<IBrandsRepo>;

  beforeEach(() => {
    mockBrandsRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    updateBrandUseCase = new UpdateBrandUseCase(mockBrandsRepo);
  });

  describe('execute', () => {
    it('should update brand successfully', async () => {
      // Arrange
      const brandId = 1;
      const input = {
        id: brandId,
        logoUrl: 'https://updated-logo.jpg',
        websiteUrl: 'https://updated-brand.com',
      };

      const existingBrand = new Brand(
        brandId,
        'Keep Brand Name EN',
        'Keep Brand Name AR',
        'https://old-logo.jpg',
        'https://old-brand.com',
        new Date(),
        new Date(),
      );

      const updatedBrand = new Brand(
        brandId,
        'Keep Brand Name EN',
        'Keep Brand Name AR',
        'https://updated-logo.jpg',
        'https://updated-brand.com',
        new Date(),
        new Date(),
      );

      mockBrandsRepo.findById.mockResolvedValue(existingBrand);
      mockBrandsRepo.update.mockResolvedValue(updatedBrand);

      // Act
      const result = await updateBrandUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(brandId);
        expect(result.value.nameEn).toBe('Keep Brand Name EN');
        expect(result.value.nameAr).toBe('Keep Brand Name AR');
        expect(result.value.logoUrl).toBe('https://updated-logo.jpg');
        expect(result.value.websiteUrl).toBe('https://updated-brand.com');
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        id: brandId,
        logoUrl: 'https://updated-logo.jpg',
        websiteUrl: 'https://updated-brand.com',
      }));
    });

    it('should return BrandNotFoundError when brand does not exist', async () => {
      // Arrange
      const input = {
        id: 999,
        nameEn: 'Updated Brand Name',
      };

      mockBrandsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await updateBrandUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BrandNotFoundError);
        expect(result.error.code).toBe('BRAND_NOT_FOUND');
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(999);
      expect(mockBrandsRepo.update).not.toHaveBeenCalled();
    });

    it('should return BrandNameAlreadyExistsError when name is already taken', async () => {
      // Arrange
      const brandId = 1;
      const input = {
        id: brandId,
        nameEn: 'Taken Name',
      };

      const existingBrand = new Brand(
        brandId,
        'Current Name',
        'Current Name AR',
        'https://logo.jpg',
        'https://website.com',
        new Date(),
        new Date(),
      );

      const brandWithTakenName = new Brand(
        2,
        'Taken Name',
        'Taken Name AR',
        'https://other-logo.jpg',
        'https://other-website.com',
        new Date(),
        new Date(),
      );

      mockBrandsRepo.findById.mockResolvedValue(existingBrand);
      mockBrandsRepo.findByName.mockResolvedValue([brandWithTakenName]); // Name is taken

      // Act
      const result = await updateBrandUseCase.execute(input);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BrandNameAlreadyExistsError);
        expect(result.error.code).toBe('BRAND_NAME_ALREADY_EXISTS');
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.findByName).toHaveBeenCalledWith('Taken Name');
      expect(mockBrandsRepo.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      // Arrange
      const brandId = 1;
      const input = {
        id: brandId,
        websiteUrl: 'https://only-website-updated.com',
      };

      const existingBrand = new Brand(
        brandId,
        'Keep nameEn',
        'Keep nameAr',
        'https://keep-logo.jpg',
        'https://old-website.com',
        new Date(),
        new Date(),
      );

      const updatedBrand = new Brand(
        brandId,
        'Keep nameEn',
        'Keep nameAr',
        'https://keep-logo.jpg',
        'https://only-website-updated.com',
        new Date(),
        new Date(),
      );

      mockBrandsRepo.findById.mockResolvedValue(existingBrand);
      mockBrandsRepo.update.mockResolvedValue(updatedBrand);

      // Act
      const result = await updateBrandUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.nameEn).toBe('Keep nameEn');
        expect(result.value.nameAr).toBe('Keep nameAr');
        expect(result.value.logoUrl).toBe('https://keep-logo.jpg');
        expect(result.value.websiteUrl).toBe('https://only-website-updated.com');
      }

      expect(mockBrandsRepo.update).toHaveBeenCalledWith(expect.objectContaining({
        nameEn: 'Keep nameEn',
        nameAr: 'Keep nameAr',
        logoUrl: 'https://keep-logo.jpg',
        websiteUrl: 'https://only-website-updated.com',
      }));
    });
  });
});