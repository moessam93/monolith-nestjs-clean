import { ListInfluencersInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class ListInfluencersUseCase {
  constructor(
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
  ) {}

  async execute(input: ListInfluencersInput = {}): Promise<Result<PaginationResult<InfluencerOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const spec = new BaseSpecification<Influencer>();
    if (search) {
      spec.searchIn(['username', 'email', 'nameEn', 'nameAr'], search);
    }
    spec.paginate({ page, limit });

    const result = await this.influencersRepo.list(spec);

    const influencerOutputs: InfluencerOutput[] = result.data.map(influencer => ({
      id: influencer.id,
      username: influencer.username,
      email: influencer.email,
      nameEn: influencer.nameEn,
      nameAr: influencer.nameAr,
      profilePictureUrl: influencer.profilePictureUrl,
      socialPlatforms: influencer.socialPlatforms.map(sp => ({
        id: sp.id,
        key: sp.key,
        url: sp.url,
        numberOfFollowers: sp.numberOfFollowers,
        createdAt: sp.createdAt!,
        updatedAt: sp.updatedAt!,
      })),
      createdAt: influencer.createdAt!,
      updatedAt: influencer.updatedAt!,
    }));

    return ok({
      data: influencerOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.totalFiltered),
    });
  }
}
