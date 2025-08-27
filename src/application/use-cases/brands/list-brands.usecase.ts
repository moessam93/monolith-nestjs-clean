import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { ListBrandsInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';

export class ListBrandsUseCase {
  constructor(
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(input: ListBrandsInput = {}): Promise<Result<PaginationResult<BrandOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const result = await this.brandsRepo.list({ page, limit, search });

    const brandOutputs: BrandOutput[] = result.data.map(brand => ({
      id: brand.id,
      nameEn: brand.nameEn,
      nameAr: brand.nameAr,
      logoUrl: brand.logoUrl,
      websiteUrl: brand.websiteUrl,
      createdAt: brand.createdAt!,
      updatedAt: brand.updatedAt!,
    }));

    return ok({
      data: brandOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.totalFiltered),
    });
  }
}
