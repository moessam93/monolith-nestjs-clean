import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { BrandOutput } from '../../dto/brand.dto';
import { Result, ok, err } from '../../common/result';

export class GetBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(id: number): Promise<Result<BrandOutput, Error>> {
    const brand = await this.brandsRepo.findById(id);
    
    if (!brand) {
      return err(new Error(`Brand not found with ID: ${id}`));
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
