import { BrandOutput } from '../../dto/brand.dto';
import { Result, ok, err } from '../../common/result';
import { BrandNotFoundError } from '../../../domain/errors/brand-errors';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class GetBrandUseCase {
  constructor(
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(id: number): Promise<Result<BrandOutput, BrandNotFoundError>> {
    const brand = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('id', id));
    
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
