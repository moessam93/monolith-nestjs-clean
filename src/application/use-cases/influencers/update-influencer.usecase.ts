import { UpdateInfluencerInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';
import { InfluencerNotFoundError, InfluencerUsernameAlreadyExistsError, InfluencerEmailAlreadyExistsError, ExistingSocialPlatformForInfluencerError } from '../../../domain/errors/influencer-errors';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Influencer } from '../../../domain/entities/influencer';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { ActivityLoggerPort } from '../../ports/activity-logger.port';

export class UpdateInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly socialPlatformsRepo: IBaseRepository<SocialPlatform, number>,
    private readonly activityLogger: ActivityLoggerPort,
  ) {}

  async execute(input: UpdateInfluencerInput): Promise<Result<InfluencerOutput, InfluencerNotFoundError | InfluencerUsernameAlreadyExistsError | InfluencerEmailAlreadyExistsError | ExistingSocialPlatformForInfluencerError>> {
    const { id, username, email, nameEn, nameAr, profilePictureUrl, socialPlatforms } = input;

    // Check if influencer exists
    const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', id));
    if (!influencer) {
      return err(new InfluencerNotFoundError(id));
    }

    // Check if username is being changed and already exists
    if (username && username !== influencer.username) {
      const existingByUsername = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('username', username));
      if (existingByUsername && existingByUsername.id !== id) {
        return err(new InfluencerUsernameAlreadyExistsError(username));
      }
    }

    // Check if email is being changed and already exists
    if (email && email !== influencer.email) {
      const existingByEmail = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('email', email));
      if (existingByEmail && existingByEmail.id !== id) {
        return err(new InfluencerEmailAlreadyExistsError(email));
      }
    }

    // Update influencer properties
    if (username !== undefined) influencer.username = username;
    if (email !== undefined) influencer.email = email;
    if (nameEn !== undefined) influencer.nameEn = nameEn;
    if (nameAr !== undefined) influencer.nameAr = nameAr;
    if (profilePictureUrl !== undefined) influencer.profilePictureUrl = profilePictureUrl;

    if (socialPlatforms !== undefined) {
      // Identify new social platforms (id is undefined, null, or 0)
      const newSocialPlatformInputs = socialPlatforms.filter(sp => 
        !sp.id || sp.id === 0 || sp.id === null || sp.id === undefined
      );

      // Identify existing social platforms to update (id is a valid number > 0)
      const platformsToUpdate = socialPlatforms.filter(sp => 
        sp.id !== undefined && sp.id !== null && sp.id > 0
      );

      // Update existing social platforms in place
      platformsToUpdate.forEach(platformUpdate => {
        const existingSocialPlatform = influencer.socialPlatforms.find(esp => esp.id === platformUpdate.id);
        if (existingSocialPlatform) {
          // Update properties only if they are provided in the update
          if (platformUpdate.url !== undefined) {
            existingSocialPlatform.url = platformUpdate.url;
          }
          if (platformUpdate.numberOfFollowers !== undefined) {
            existingSocialPlatform.numberOfFollowers = platformUpdate.numberOfFollowers;
          }
        }
      });

      // Create new SocialPlatform objects for new platforms
      const newSocialPlatforms = newSocialPlatformInputs.map(sp => 
        new SocialPlatform(
          0, // ID will be assigned by repository
          sp.key,
          sp.url || '', // Default to empty string if not provided
          sp.numberOfFollowers || 0, // Default to 0 if not provided
          influencer.id,
          new Date(),
          new Date()
        )
      );

      // Check if new social platforms already exist for this influencer
      for (const spInput of newSocialPlatforms) {
        const existingSocialPlatform = await this.socialPlatformsRepo.findOne(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', influencer.id).whereEqual('key', spInput.key));
        if (existingSocialPlatform) {
          return err(new ExistingSocialPlatformForInfluencerError(influencer.id, spInput.key, spInput.url));
        }
      }

      // Add new social platforms to the existing list
      influencer.socialPlatforms = [...influencer.socialPlatforms, ...newSocialPlatforms];
    }
    // Save updated influencer
    const updatedInfluencer = await this.influencersRepo.update(influencer);

    await this.activityLogger.logUpdate('influencer', id, influencer, updatedInfluencer);

    return ok({
      id: updatedInfluencer.id,
      username: updatedInfluencer.username,
      email: updatedInfluencer.email,
      nameEn: updatedInfluencer.nameEn,
      nameAr: updatedInfluencer.nameAr,
      profilePictureUrl: updatedInfluencer.profilePictureUrl,
      socialPlatforms: updatedInfluencer.socialPlatforms.map(sp => ({
        id: sp.id,
        key: sp.key,
        url: sp.url,
        numberOfFollowers: sp.numberOfFollowers,
        createdAt: sp.createdAt!,
        updatedAt: sp.updatedAt!,
      })),
      createdAt: updatedInfluencer.createdAt!,
      updatedAt: updatedInfluencer.updatedAt!,
    });
  }
}
