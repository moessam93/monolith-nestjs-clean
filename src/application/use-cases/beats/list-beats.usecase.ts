import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { ListBeatsInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { Beat } from '../../../domain/entities/beat';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class ListBeatsUseCase {
  constructor(
    private readonly beatsRepo: IBaseRepository<Beat, number>,
  ) {}

  async execute(input: ListBeatsInput = {}): Promise<Result<PaginationResult<BeatOutput>>> {
    const { page = 1, limit = 10, search, influencerId, brandId, statusKey } = input;

    const spec = new BaseSpecification<Beat>();
    
    if (influencerId) spec.whereEqual('influencerId', influencerId);
    if (brandId) spec.whereEqual('brandId', brandId);
    if (statusKey) spec.whereEqual('statusKey', statusKey);
    
    // Search across beat, brand, and influencer fields
    if (search) {
      spec.customSearch({
        OR: [
          { caption: { contains: search, mode: 'insensitive' } },
          { brand: { nameEn: { contains: search, mode: 'insensitive' } } },
          { brand: { nameAr: { contains: search, mode: 'insensitive' } } },
          { influencer: { nameEn: { contains: search, mode: 'insensitive' } } },
          { influencer: { nameAr: { contains: search, mode: 'insensitive' } } },
          { influencer: { username: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }
    
    spec.include(['influencer', 'brand'])
        .orderByField('createdAt', 'desc')
        .paginate({ page, limit });

    const result = await this.beatsRepo.list(spec);

    const beatOutputs: BeatOutput[] = result.data.map(beat => ({
      id: beat.id,
      caption: beat.caption || undefined,
      mediaUrl: beat.mediaUrl,
      thumbnailUrl: beat.thumbnailUrl,
      statusKey: beat.statusKey,
      influencerId: beat.influencerId,
      brandId: beat.brandId,
      influencer: beat.influencer,
      brand: beat.brand,
      createdAt: beat.createdAt!,
      updatedAt: beat.updatedAt!,
    }));

    return ok({
      data: beatOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.totalFiltered),
    });
  }
}
