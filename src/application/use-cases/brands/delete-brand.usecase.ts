import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Brand } from '../../../domain/entities/brand';
import { BrandHasBeatsError, BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Result, ok, err } from '../../common/result';
import { Beat } from '../../../domain/entities/beat';

export class DeleteBrandUseCase {
  constructor(
    private readonly brandsRepo: IBaseRepository<Brand, number>,
    private readonly beatsRepo: IBaseRepository<Beat, number>,
  ) {}

  async execute(id: number): Promise<Result<void, BrandNotFoundError | BrandHasBeatsError>> {
    // Check if brand exists
    const brand = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('id', id));
    if (!brand) {
      return err(new BrandNotFoundError(id));
    }

    // Check if brand has beats
    const beats = await this.beatsRepo.count(new BaseSpecification<Beat>().whereEqual('brandId', id));
    
    if (beats > 0) {
      return err(new BrandHasBeatsError(id));
    }

    // Delete brand
    await this.brandsRepo.delete(id);

    return ok(undefined);
  }
}
