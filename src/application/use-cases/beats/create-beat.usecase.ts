import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { IBrandsRepo } from '../../../domain/repositories/brands-repo';
import { CreateBeatInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { Beat } from '../../../domain/entities/beat';
import { BeatBrandNotFoundError, BeatInfluencerNotFoundError } from '../../../domain/errors/beat-errors';

export class CreateBeatUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
    private readonly influencersRepo: IInfluencersRepo,
    private readonly brandsRepo: IBrandsRepo,
  ) {}

  async execute(input: CreateBeatInput): Promise<Result<BeatOutput, BeatInfluencerNotFoundError | BeatBrandNotFoundError>> {
    const { caption, mediaUrl, thumbnailUrl, statusKey, influencerId, brandId } = input;

    // Verify influencer exists
    const influencer = await this.influencersRepo.findById(influencerId);
    if (!influencer) {
      return err(new BeatInfluencerNotFoundError(influencerId));
    }

    // Verify brand exists
    const brand = await this.brandsRepo.findById(brandId);
    if (!brand) {
      return err(new BeatBrandNotFoundError(brandId));
    }

    // Create beat entity
    const beat = new Beat(
      0, // ID will be assigned by repository
      caption || null,
      mediaUrl,
      thumbnailUrl,
      statusKey,
      influencerId,
      brandId,
      new Date(),
      new Date(),
    );

    // Save beat
    const createdBeat = await this.beatsRepo.create(beat);

    return ok({
      id: createdBeat.id,
      caption: createdBeat.caption || undefined,
      mediaUrl: createdBeat.mediaUrl,
      thumbnailUrl: createdBeat.thumbnailUrl,
      statusKey: createdBeat.statusKey,
      influencerId: createdBeat.influencerId,
      brandId: createdBeat.brandId,
      createdAt: createdBeat.createdAt!,
      updatedAt: createdBeat.updatedAt!,
    });
  }
}
