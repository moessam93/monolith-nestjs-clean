import { DeleteBrandUseCase } from './delete-brand.usecase';
import { Brand } from '../../../domain/entities/brand';
import { BrandHasBeatsError, BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { isOk, isErr } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Beat } from '../../../domain/entities/beat';

describe('DeleteBrandUseCase', () => {
  let deleteBrandUseCase: DeleteBrandUseCase;
  let mockBrandsRepo: jest.Mocked<IBaseRepository<Brand, number>>;
let mockBeatsRepo: jest.Mocked<IBaseRepository<Beat, number>>;
  beforeEach(() => {
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

    deleteBrandUseCase = new DeleteBrandUseCase(mockBrandsRepo, mockBeatsRepo);
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

      mockBrandsRepo.findOne.mockResolvedValue(brand);
      mockBrandsRepo.delete.mockResolvedValue();

      // Act
      const result = await deleteBrandUseCase.execute(brandId);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeUndefined();
      }

      expect(mockBrandsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Brand>().whereEqual('id', brandId));
      expect(mockBrandsRepo.delete).toHaveBeenCalledWith(brandId);
    });

    it('should return error when brand does not exist', async () => {
      // Arrange
      const brandId = 999;

      mockBrandsRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await deleteBrandUseCase.execute(brandId);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BrandNotFoundError);
        expect(result.error.message).toContain('999');
      }

      expect(mockBrandsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Brand>().whereEqual('id', brandId));
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

      const deleteError = new BrandHasBeatsError(brandId);

      mockBeatsRepo.count.mockResolvedValue(1);
      mockBrandsRepo.findOne.mockResolvedValue(brand);
      mockBrandsRepo.delete.mockRejectedValue(deleteError);

      // Act & Assert
      const result = await deleteBrandUseCase.execute(brandId);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(BrandHasBeatsError);
        expect(result.error.message).toContain('Brand has beats: 1');
      }
      expect(mockBeatsRepo.count).toHaveBeenCalledWith(new BaseSpecification<Beat>().whereEqual('brandId', brandId));
      expect(mockBrandsRepo.findOne).toHaveBeenCalledWith(new BaseSpecification<Brand>().whereEqual('id', brandId));
      expect(mockBrandsRepo.delete).not.toHaveBeenCalled();
    });
  });
});
