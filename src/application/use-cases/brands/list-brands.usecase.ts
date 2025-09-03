import { ListBrandsInput, BrandOutput } from '../../dto/brand.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class ListBrandsUseCase {
  constructor(
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(input: ListBrandsInput = {}): Promise<Result<PaginationResult<BrandOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const spec = new BaseSpecification<Brand>();
    if (search) {
      spec.searchIn(['nameEn', 'nameAr'], search);
    }
    spec.paginate({ page, limit });

    const result = await this.brandsRepo.list(spec);

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
