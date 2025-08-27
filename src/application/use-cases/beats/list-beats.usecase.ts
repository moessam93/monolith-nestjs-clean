import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { ListBeatsInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';

export class ListBeatsUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
  ) {}

  async execute(input: ListBeatsInput = {}): Promise<Result<PaginationResult<BeatOutput>>> {
    const { page = 1, limit = 10, search, influencerId, brandId, statusKey } = input;

    const result = await this.beatsRepo.list({ 
      page, 
      limit, 
      search, 
      influencerId, 
      brandId, 
      statusKey 
    });

    const beatOutputs: BeatOutput[] = result.data.map(beat => ({
      id: beat.id,
      caption: beat.caption || undefined,
      mediaUrl: beat.mediaUrl,
      thumbnailUrl: beat.thumbnailUrl,
      statusKey: beat.statusKey,
      influencerId: beat.influencerId,
      brandId: beat.brandId,
      createdAt: beat.createdAt!,
      updatedAt: beat.updatedAt!,
    }));

    return ok({
      data: beatOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.totalFiltered),
    });
  }
}
