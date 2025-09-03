import { UpdateBrandInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok, err } from '../../common/result';
import { BrandNameAlreadyExistsError, BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class UpdateBrandUseCase {
  constructor(
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(input: UpdateBrandInput): Promise<Result<BrandOutput, BrandNotFoundError | BrandNameAlreadyExistsError>> {
    const { id, nameEn, nameAr, logoUrl, websiteUrl } = input;

    // Check if brand exists
    const brand = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('id', id));
    if (!brand) {
      return err(new BrandNotFoundError(id));
    }

    // Update brand properties
    if (nameEn !== undefined){
      const existingBrandNameEn = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('nameEn', nameEn));
      if (existingBrandNameEn && existingBrandNameEn.id !== id) {
        return err(new BrandNameAlreadyExistsError(nameEn));
      }
      brand.nameEn = nameEn;
    }
    if (nameAr !== undefined){
      const existingBrandNameAr = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('nameAr', nameAr));
      if (existingBrandNameAr && existingBrandNameAr.id !== id) {
        return err(new BrandNameAlreadyExistsError(nameAr));
      }
      brand.nameAr = nameAr;
    }
    if (logoUrl !== undefined) brand.logoUrl = logoUrl;
    if (websiteUrl !== undefined) brand.websiteUrl = websiteUrl;

    // Save updated brand
    const updatedBrand = await this.brandsRepo.update(brand);

    return ok({
      id: updatedBrand.id,
      nameEn: updatedBrand.nameEn,
      nameAr: updatedBrand.nameAr,
      logoUrl: updatedBrand.logoUrl,
      websiteUrl: updatedBrand.websiteUrl,
      createdAt: updatedBrand.createdAt!,
      updatedAt: updatedBrand.updatedAt!,
    });
  }
}
