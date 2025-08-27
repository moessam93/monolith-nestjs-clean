import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { UpdateInfluencerInput, InfluencerOutput } from '../../dto/influencer.dto';
import { Result, ok, err } from '../../common/result';

export class UpdateInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IInfluencersRepo,
  ) {}

  async execute(input: UpdateInfluencerInput): Promise<Result<InfluencerOutput, Error>> {
    const { id, username, email, nameEn, nameAr, profilePictureUrl } = input;

    // Check if influencer exists
    const influencer = await this.influencersRepo.findById(id);
    if (!influencer) {
      return err(new Error(`Influencer not found with ID: ${id}`));
    }

    // Check if username is being changed and already exists
    if (username && username !== influencer.username) {
      const existingByUsername = await this.influencersRepo.findByUsername(username);
      if (existingByUsername) {
        return err(new Error(`Influencer with username '${username}' already exists`));
      }
    }

    // Check if email is being changed and already exists
    if (email && email !== influencer.email) {
      const existingByEmail = await this.influencersRepo.findByEmail(email);
      if (existingByEmail) {
        return err(new Error(`Influencer with email '${email}' already exists`));
      }
    }

    // Update influencer properties
    if (username !== undefined) influencer.username = username;
    if (email !== undefined) influencer.email = email;
    if (nameEn !== undefined) influencer.nameEn = nameEn;
    if (nameAr !== undefined) influencer.nameAr = nameAr;
    if (profilePictureUrl !== undefined) influencer.profilePictureUrl = profilePictureUrl;

    // Save updated influencer
    const updatedInfluencer = await this.influencersRepo.update(influencer);

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
