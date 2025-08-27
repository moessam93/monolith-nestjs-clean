import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { UpdateBrandInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok, err } from '../../common/result';

export class UpdateBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(input: UpdateBrandInput): Promise<Result<BrandOutput, Error>> {
    const { id, nameEn, nameAr, logoUrl, websiteUrl } = input;

    // Check if brand exists
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      return err(new Error(`Brand not found with ID: ${id}`));
    }

    // Update brand properties
    if (nameEn !== undefined) brand.nameEn = nameEn;
    if (nameAr !== undefined) brand.nameAr = nameAr;
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
