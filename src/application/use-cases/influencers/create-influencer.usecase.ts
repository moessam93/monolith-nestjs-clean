import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../../../domain/repositories/social-platforms-repo';
import { CreateInfluencerInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';
import { Influencer } from '../../../domain/entities/influencer';
import { SocialPlatform } from '../../../domain/entities/social-platform';

export class CreateInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IInfluencersRepo,
    private readonly socialPlatformsRepo: ISocialPlatformsRepo,
  ) {}

  async execute(input: CreateInfluencerInput): Promise<Result<InfluencerOutput, Error>> {
    const { username, email, nameEn, nameAr, profilePictureUrl, socialPlatforms = [] } = input;

    // Check if username already exists
    const existingByUsername = await this.influencersRepo.findByUsername(username);
    if (existingByUsername) {
      return err(new Error(`Influencer with username '${username}' already exists`));
    }

    // Check if email already exists
    const existingByEmail = await this.influencersRepo.findByEmail(email);
    if (existingByEmail) {
      return err(new Error(`Influencer with email '${email}' already exists`));
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
