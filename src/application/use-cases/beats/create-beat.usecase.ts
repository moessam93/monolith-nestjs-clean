import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Influencer } from '../../../domain/entities/influencer';
import { CreateBeatInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { Beat } from '../../../domain/entities/beat';
import { BeatBrandNotFoundError, BeatInfluencerNotFoundError } from '../../../domain/errors/beat-errors';
import { Brand } from '../../../domain/entities/brand';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class CreateBeatUseCase {
  constructor(
    private readonly beatsRepo: IBaseRepository<Beat, number>,
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly brandsRepo: IBaseRepository<Brand, number>,
  ) {}

  async execute(input: CreateBeatInput): Promise<Result<BeatOutput, BeatInfluencerNotFoundError | BeatBrandNotFoundError>> {
    const { caption, mediaUrl, thumbnailUrl, statusKey, influencerId, brandId } = input;

    // Verify influencer exists
    const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
    if (!influencer) {
      return err(new BeatInfluencerNotFoundError(influencerId));
    }

    // Verify brand exists
    const brand = await this.brandsRepo.findOne(new BaseSpecification<Brand>().whereEqual('id', brandId));
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
      influencer,
      brand,
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
      influencer: {
        id: influencer.id,
        username: influencer.username,
        nameEn: influencer.nameEn,
        nameAr: influencer.nameAr,
        profilePictureUrl: influencer.profilePictureUrl,
      },
      brand: {
        id: brand.id,
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        logoUrl: brand.logoUrl,
        websiteUrl: brand.websiteUrl,
      },
      createdAt: createdBeat.createdAt!,
      updatedAt: createdBeat.updatedAt!,
    });
  }
}
