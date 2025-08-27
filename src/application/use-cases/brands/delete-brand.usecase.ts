import { BrandNotFoundError } from 'src/domain/errors/brand-errors';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { Result, ok, err } from '../../common/result';

export class DeleteBrandUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(id: number): Promise<Result<void, BrandNotFoundError>> {
    // Check if brand exists
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      return err(new BrandNotFoundError(id));
    }

    // Delete brand
    await this.brandsRepo.delete(id);

    return ok(undefined);
  }
}
