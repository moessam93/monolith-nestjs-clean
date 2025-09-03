import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { UpdateSocialPlatformInput, SocialPlatformOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';
import { SocialPlatform } from '../../../domain/entities/social-platform';
import { ExistingSocialPlatformForInfluencerError, InfluencerNotFoundError } from '../../../domain/errors/influencer-errors';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Influencer } from '../../../domain/entities/influencer';

export class ManageSocialPlatformUseCase {
  constructor(
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly socialPlatformsRepo: IBaseRepository<SocialPlatform, number>,
  ) {}

  async addOrUpdate(input: UpdateSocialPlatformInput): Promise<Result<SocialPlatformOutput, InfluencerNotFoundError | ExistingSocialPlatformForInfluencerError>> {
    const { influencerId, key, url, numberOfFollowers } = input;

    // Check if influencer exists
    const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
    if (!influencer) {
      return err(new InfluencerNotFoundError(influencerId));
    }

    // Check if social platform already exists for this influencer
    const existingSocialPlatform = await this.socialPlatformsRepo.findOne(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', influencerId).whereEqual('key', key));

    if (existingSocialPlatform) {
      // Update existing
      if (url !== undefined) existingSocialPlatform.url = url;
      if (numberOfFollowers !== undefined) existingSocialPlatform.numberOfFollowers = numberOfFollowers;

      const updated = await this.socialPlatformsRepo.update(existingSocialPlatform);
      return ok({
        id: updated.id,
        key: updated.key,
        url: updated.url,
        numberOfFollowers: updated.numberOfFollowers,
        createdAt: updated.createdAt!,
        updatedAt: updated.updatedAt!,
      });
    } else {
      // Create new
      if (!url || numberOfFollowers === undefined) {
        return err(new ExistingSocialPlatformForInfluencerError(influencerId, key, url || ''));
      }

      const socialPlatform = new SocialPlatform(
        0, // ID will be assigned by repository
        key,
        url,
        numberOfFollowers,
        influencerId,
        new Date(),
        new Date(),
      );

      const created = await this.socialPlatformsRepo.create(socialPlatform);
      return ok({
        id: created.id,
        key: created.key,
        url: created.url,
        numberOfFollowers: created.numberOfFollowers,
        createdAt: created.createdAt!,
        updatedAt: created.updatedAt!,
      });
    }
  }

  async remove(influencerId: number, key: string): Promise<Result<void, Error>> {
    // Check if influencer exists
    const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', influencerId));
    if (!influencer) {
      return err(new Error(`Influencer not found with ID: ${influencerId}`));
    }

    // Check if social platform exists
    const socialPlatform = await this.socialPlatformsRepo.findOne(new BaseSpecification<SocialPlatform>().whereEqual('influencerId', influencerId).whereEqual('key', key));
    if (!socialPlatform) {
      return err(new Error(`Social platform '${key}' not found for influencer ${influencerId}`));
    }

    // Delete social platform
    await this.socialPlatformsRepo.delete(socialPlatform.id);

    return ok(undefined);
  }
}
