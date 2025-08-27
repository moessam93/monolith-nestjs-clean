import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ListInfluencersInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';

export class ListInfluencersUseCase {
  constructor(
    private readonly influencersRepo: IInfluencersRepo,
  ) {}

  async execute(input: ListInfluencersInput = {}): Promise<Result<PaginationResult<InfluencerOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const result = await this.influencersRepo.list({ page, limit, search });

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
