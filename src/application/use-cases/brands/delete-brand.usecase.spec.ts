import { DeleteBrandUseCase } from './delete-brand.usecase';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Brand } from '../../../domain/entities/brand';
import { BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { isOk, isErr } from '../../common/result';

describe('DeleteBrandUseCase', () => {
  let deleteBrandUseCase: DeleteBrandUseCase;
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

    deleteBrandUseCase = new DeleteBrandUseCase(mockBrandsRepo);
  });

  describe('execute', () => {
    it('should delete brand successfully when brand exists', async () => {
      // Arrange
      const brandId = 1;

      const brand = new Brand(
        brandId,
        'Brand to Delete',
        'This brand will be deleted',
        'https://logo.jpg',
        'https://delete-me.com',
        new Date(),
        new Date(),
      );

      mockBrandsRepo.findById.mockResolvedValue(brand);
      mockBrandsRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteBrandUseCase.execute(brandId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.delete).toHaveBeenCalledWith(brandId);
    });

    it('should return error when brand does not exist', async () => {
      // Arrange
      const brandId = 999;

      mockBrandsRepo.findById.mockResolvedValue(null);

      // Act
      const result = await deleteBrandUseCase.execute(brandId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain('999');
      }

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.delete).not.toHaveBeenCalled();
    });

    it('should handle repository delete errors gracefully', async () => {
      // Arrange
      const brandId = 1;

      const brand = new Brand(
        brandId,
        'Brand to Delete',
        'This brand will be deleted',
        'https://logo.jpg',
        'https://delete-me.com',
        new Date(),
        new Date(),
      );

      const deleteError = new Error('Cannot delete brand with existing beats');

      mockBrandsRepo.findById.mockResolvedValue(brand);
      mockBrandsRepo.delete.mockRejectedValue(deleteError);

      // Act & Assert
      await expect(deleteBrandUseCase.execute(brandId)).rejects.toThrow('Cannot delete brand with existing beats');

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.delete).toHaveBeenCalledWith(brandId);
    });

    it('should handle repository findById errors gracefully', async () => {
      // Arrange
      const brandId = 1;
      const repositoryError = new Error('Database connection failed');

      mockBrandsRepo.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(deleteBrandUseCase.execute(brandId)).rejects.toThrow('Database connection failed');

      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.delete).not.toHaveBeenCalled();
    });

    it('should verify brand exists before attempting deletion', async () => {
      // Arrange
      const brandId = 1;

      const brand = new Brand(
        brandId,
        'Existing Brand',
        'This brand exists',
        'https://logo.jpg',
        'https://exists.com',
        new Date('2023-01-01'),
        new Date('2023-06-01'),
      );

      mockBrandsRepo.findById.mockResolvedValue(brand);
      mockBrandsRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteBrandUseCase.execute(brandId);

      // Assert
      expect(isOk(result)).toBe(true);

      // Verify the operations were called
      expect(mockBrandsRepo.findById).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.delete).toHaveBeenCalledWith(brandId);
      expect(mockBrandsRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockBrandsRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
