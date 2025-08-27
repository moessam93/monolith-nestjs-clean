import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';
import { InfluencerNotFoundError } from '../../../domain/errors/influencer-errors';

export class GetInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IInfluencersRepo,
  ) {}

  async execute(id: number): Promise<Result<InfluencerOutput, InfluencerNotFoundError>> {
    const influencer = await this.influencersRepo.findById(id);
    
    if (!influencer) {
      return err(new InfluencerNotFoundError(id));
    }

    return ok({
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
    });
  }
}
