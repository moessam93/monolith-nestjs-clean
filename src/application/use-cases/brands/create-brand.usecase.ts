import { CreateBrandInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok } from '../../common/result';
import { Brand } from '../../../domain/entities/brand';
import { BrandNameAlreadyExistsError } from '../../../domain/errors/brand-errors';
import { err } from '../../common/result';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class CreateBrandUseCase {
  constructor(
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(input: CreateBrandInput): Promise<Result<BrandOutput, BrandNameAlreadyExistsError>> {
    const { nameEn, nameAr, logoUrl, websiteUrl } = input;


    // Check if brand name already exists
    const existingBrandNameEn = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('nameEn', nameEn));
    if (existingBrandNameEn) {
      return err(new BrandNameAlreadyExistsError(nameEn));
    }

    const existingBrandNameAr = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('nameAr', nameAr));
    if (existingBrandNameAr) {
      return err(new BrandNameAlreadyExistsError(nameAr));
    }

    // Create brand entity
    const brand = new Brand(
      0, // ID will be assigned by repository
      nameEn,
      nameAr,
      logoUrl,
      websiteUrl,
      new Date(),
      new Date(),
    );

    
    // Save brand
    const createdBrand = await this.brandsRepo.create(brand);

    return ok({
      id: createdBrand.id,
      nameEn: createdBrand.nameEn,
      nameAr: createdBrand.nameAr,
      logoUrl: createdBrand.logoUrl,
      websiteUrl: createdBrand.websiteUrl,
      createdAt: createdBrand.createdAt!,
      updatedAt: createdBrand.updatedAt!,
    });
  }
}
