import { CreateInfluencerInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { ExistingSocialPlatformForInfluencerError, InfluencerUsernameAlreadyExistsError} from '../../../domain/errors/influencer-errors';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { ActivityLoggerPort } from '../../ports/activity-logger.port';

export class CreateInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly socialPlatformsRepo: IBaseRepository<SocialPlatform, number>,
    private readonly activityLogger: ActivityLoggerPort,
  ) {}

  async execute(input: CreateInfluencerInput): Promise<Result<InfluencerOutput, InfluencerUsernameAlreadyExistsError | ExistingSocialPlatformForInfluencerError>> {
    const { username, email, nameEn, nameAr, profilePictureUrl, socialPlatforms = [] } = input;

    // Check if username already exists
    const existingByUsername = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('username', username));
    
    if (existingByUsername) {
      return err(new InfluencerUsernameAlreadyExistsError(username));
    }

    // Create influencer entity
    const influencer = new Influencer(
      0, // ID will be assigned by repository
      username,
      email,
      nameEn,
      nameAr,
      profilePictureUrl,
      [],
      new Date(),
      new Date(),
    );

    // Save influencer
    const createdInfluencer = await this.influencersRepo.create(influencer);

    // Check if social platforms already exist for this influencer
    for (const spInput of socialPlatforms) {
      const existingSocialPlatform = await this.socialPlatformsRepo.findOne(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', createdInfluencer.id).whereEqual('key', spInput.key));
      if (existingSocialPlatform) {
        return err(new ExistingSocialPlatformForInfluencerError(createdInfluencer.id, spInput.key, spInput.url));
      }
    }

    // Create social platforms if provided
    const createdSocialPlatforms: SocialPlatform[] = [];
    for (const spInput of socialPlatforms) {
      const socialPlatform = new SocialPlatform(
        0, // ID will be assigned by repository
        spInput.key,
        spInput.url,
        spInput.numberOfFollowers,
        createdInfluencer.id,
        new Date(),
        new Date(),
      );
      const createdSP = await this.socialPlatformsRepo.create(socialPlatform);
      createdSocialPlatforms.push(createdSP);
    }

    await this.activityLogger.logCreate('influencer', createdInfluencer.id, createdInfluencer);
    return ok({
      id: createdInfluencer.id,
      username: createdInfluencer.username,
      email: createdInfluencer.email,
      nameEn: createdInfluencer.nameEn,
      nameAr: createdInfluencer.nameAr,
      profilePictureUrl: createdInfluencer.profilePictureUrl,
      socialPlatforms: createdSocialPlatforms.map(sp => ({
        id: sp.id,
        key: sp.key,
        url: sp.url,
        numberOfFollowers: sp.numberOfFollowers,
        createdAt: sp.createdAt!,
        updatedAt: sp.updatedAt!,
      })),
      createdAt: createdInfluencer.createdAt!,
      updatedAt: createdInfluencer.updatedAt!,
    });
  }
}
