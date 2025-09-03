import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { Beat } from '../../../domain/entities/beat';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class GetBeatUseCase {
  constructor(
    private readonly beatsRepo: IBaseRepository<Beat, number>,
  ) {}

  async execute(id: number): Promise<Result<BeatOutput, BeatNotFoundError>> {
    const beat = await this.beatsRepo.findOne(new BaseSpecification<Beat>().whereEqual('id', id).include(['influencer', 'brand']));
    
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    return ok({
      id: beat.id,
      caption: beat.caption || undefined,
      mediaUrl: beat.mediaUrl,
      thumbnailUrl: beat.thumbnailUrl,
      statusKey: beat.statusKey,
      influencer: {
        id: beat.influencerId,
        username: beat.influencer.username || '',
        nameEn: beat.influencer.nameEn || '',
        nameAr: beat.influencer.nameAr || '',
        profilePictureUrl: beat.influencer.profilePictureUrl || '',
      },
      brand: {
        id: beat.brandId,
        nameEn: beat.brand.nameEn || '',
        nameAr: beat.brand.nameAr || '',
        logoUrl: beat.brand.logoUrl || '',
        websiteUrl: beat.brand.websiteUrl || '',
      },
      brandId: beat.brandId,
      createdAt: beat.createdAt!,
      updatedAt: beat.updatedAt!,
    });
  }
}
