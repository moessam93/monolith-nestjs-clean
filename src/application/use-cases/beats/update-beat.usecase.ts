import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { UpdateBeatInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { BeatInfluencerNotFoundError, BeatBrandNotFoundError, BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';

export class UpdateBeatUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
    private readonly influencersRepo: IInfluencersRepo,
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(input: UpdateBeatInput): Promise<Result<BeatOutput, BeatNotFoundError | BeatInfluencerNotFoundError | BeatBrandNotFoundError>> {
    const { id, caption, mediaUrl, thumbnailUrl, statusKey, influencerId, brandId } = input;

    // Check if beat exists
    const beat = await this.beatsRepo.findById(id);
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    // Update beat properties
    if (caption !== undefined) beat.caption = caption;
    if (mediaUrl !== undefined) beat.mediaUrl = mediaUrl;
    if (thumbnailUrl !== undefined) beat.thumbnailUrl = thumbnailUrl;
    if (statusKey !== undefined) beat.statusKey = statusKey;

    if (influencerId !== undefined){
      const influencer = await this.influencersRepo.findById(influencerId);
      if (!influencer) {
        return err(new BeatInfluencerNotFoundError(influencerId));
      }
      beat.influencerId = influencerId;
    }

    if (brandId !== undefined){
      const brand = await this.brandsRepo.findById(brandId);
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
      createdAt: updatedBeat.createdAt!,
      updatedAt: updatedBeat.updatedAt!,
    });
  }
}
