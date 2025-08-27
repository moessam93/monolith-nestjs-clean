import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { BrandOutput } from '../../dto/brand.dto';
import { Result, ok, err } from '../../common/result';
import { BrandNotFoundError } from '../../../domain/errors/brand-errors';

export class GetBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(id: number): Promise<Result<BrandOutput, BrandNotFoundError>> {
    const brand = await this.brandsRepo.findById(id);
    
    if (!brand) {
      return err(new BrandNotFoundError(id));
    }

    return ok({
      id: brand.id,
      nameEn: brand.nameEn,
      nameAr: brand.nameAr,
      logoUrl: brand.logoUrl,
      websiteUrl: brand.websiteUrl,
      createdAt: brand.createdAt!,
      updatedAt: brand.updatedAt!,
    });
  }
}
