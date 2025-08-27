import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { CreateBrandInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok } from '../../common/result';
import { Brand } from '../../../domain/entities/brand';
import { BrandNameAlreadyExistsError } from '../../../domain/errors/brand-errors';
import { err } from '../../common/result';

export class CreateBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(input: CreateBrandInput): Promise<Result<BrandOutput, BrandNameAlreadyExistsError>> {
    const { nameEn, nameAr, logoUrl, websiteUrl } = input;


    // Check if brand name already exists
    const existingBrandNameEn = await this.brandsRepo.findByName(nameEn);
    if (existingBrandNameEn) {
      return err(new BrandNameAlreadyExistsError(nameEn));
    }

    const existingBrandNameAr = await this.brandsRepo.findByName(nameAr);
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
