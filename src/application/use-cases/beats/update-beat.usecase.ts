import { UpdateBeatInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { BeatInfluencerNotFoundError, BeatBrandNotFoundError, BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { Influencer } from '../../../domain/entities/influencer';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class UpdateBeatUseCase {
  constructor(
    private readonly beatsRepo: IBaseRepository<Beat, number>,
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(input: UpdateBeatInput): Promise<Result<BeatOutput, BeatNotFoundError | BeatInfluencerNotFoundError | BeatBrandNotFoundError>> {
    const { id, caption, mediaUrl, thumbnailUrl, statusKey, influencerId, brandId } = input;

    // Check if beat exists
    const beat = await this.beatsRepo.findOne(new BaseSpecification<Beat>().whereEqual('id', id));
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    // Update beat properties
    if (caption !== undefined) beat.caption = caption;
    if (mediaUrl !== undefined) beat.mediaUrl = mediaUrl;
    if (thumbnailUrl !== undefined) beat.thumbnailUrl = thumbnailUrl;
    if (statusKey !== undefined) beat.statusKey = statusKey;

    if (influencerId !== undefined){
      const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
      if (!influencer) {
        return err(new BeatInfluencerNotFoundError(influencerId));
      }
      beat.influencerId = influencerId;
    }

    if (brandId !== undefined){
      const brand = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('id', brandId));
      if (!brand) {
        return err(new BeatBrandNotFoundError(brandId));
      }
      beat.brandId = brandId;
    }

    // Save updated beat
    const updatedBeat = await this.beatsRepo.update(beat);

    return ok({
      id: updatedBeat.id,
      caption: updatedBeat.caption || undefined,
      mediaUrl: updatedBeat.mediaUrl,
      thumbnailUrl: updatedBeat.thumbnailUrl,
      statusKey: updatedBeat.statusKey,
      influencerId: updatedBeat.influencerId,
      brandId: updatedBeat.brandId,
      influencer: updatedBeat.influencer,
      brand: updatedBeat.brand,
      createdAt: updatedBeat.createdAt!,
      updatedAt: updatedBeat.updatedAt!,
    });
  }
}
