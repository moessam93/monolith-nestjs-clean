import { CreateBrandUseCase } from './create-brand.usecase';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Brand } from '../../../domain/entities/brand';
import { isOk } from '../../common/result';

describe('CreateBrandUseCase', () => {
  let createBrandUseCase: CreateBrandUseCase;
  let mockBrandsRepo: jest.Mocked<IBaseRepository<Brand, number>>;

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

    createBrandUseCase = new CreateBrandUseCase(mockBrandsRepo);
  });

  describe('execute', () => {
    it('should create brand successfully', async () => {
      // Arrange
      const input = {
        nameEn: 'Nike',
        nameAr: 'نايكي',
        logoUrl: 'https://example.com/nike-logo.png',
        websiteUrl: 'https://nike.com',
      };

      const createdBrand = new Brand(
        123,
        'Nike',
        'نايكي',
        'https://example.com/nike-logo.png',
        'https://nike.com',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      mockBrandsRepo.create.mockResolvedValue(createdBrand);

      // Act
      const result = await createBrandUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(123);
        expect(result.value.nameEn).toBe('Nike');
        expect(result.value.nameAr).toBe('نايكي');
        expect(result.value.logoUrl).toBe('https://example.com/nike-logo.png');
        expect(result.value.websiteUrl).toBe('https://nike.com');
        expect(result.value.createdAt).toEqual(new Date('2024-01-01'));
        expect(result.value.updatedAt).toEqual(new Date('2024-01-01'));
      }

      expect(mockBrandsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nameEn: 'Nike',
          nameAr: 'نايكي',
          logoUrl: 'https://example.com/nike-logo.png',
          websiteUrl: 'https://nike.com',
        })
      );
    });

    it('should create brand with all properties correctly mapped', async () => {
      // Arrange
      const input = {
        nameEn: 'Adidas',
        nameAr: 'أديداس',
        logoUrl: 'https://example.com/adidas-logo.png',
        websiteUrl: 'https://adidas.com',
      };

      const createdBrand = new Brand(
        456,
        input.nameEn,
        input.nameAr,
        input.logoUrl,
        input.websiteUrl,
        new Date(),
        new Date(),
      );

      mockBrandsRepo.create.mockResolvedValue(createdBrand);

      // Act
      const result = await createBrandUseCase.execute(input);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.nameEn).toBe('Adidas');
        expect(result.value.nameAr).toBe('أديداس');
      }

      // Verify the Brand entity was created with correct properties
      const createCall = mockBrandsRepo.create.mock.calls[0][0];
      expect(createCall.nameEn).toBe('Adidas');
      expect(createCall.nameAr).toBe('أديداس');
      expect(createCall.logoUrl).toBe('https://example.com/adidas-logo.png');
      expect(createCall.websiteUrl).toBe('https://adidas.com');
    });
  });
});
