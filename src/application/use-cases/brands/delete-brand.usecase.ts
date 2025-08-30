import { BrandHasBeatsError, BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { Result, ok, err } from '../../common/result';

export class DeleteBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
    private readonly beatsRepo: IBeatsRepo,
  ) {}

  async execute(id: number): Promise<Result<void, BrandNotFoundError | BrandHasBeatsError>> {
    // Check if brand exists
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      return err(new BrandNotFoundError(id));
    }

    // Check if brand has beats
    const beats = await this.beatsRepo.countByBrand(id);
    if (beats > 0) {
      return err(new BrandHasBeatsError(id));
    }

    // Delete brand
    await this.brandsRepo.delete(id);

    return ok(undefined);
  }
}
