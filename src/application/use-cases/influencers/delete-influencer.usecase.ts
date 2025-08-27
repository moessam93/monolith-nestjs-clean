import { IInfluencersRepo } from '../../../domain/repositories/influencers-repo';
import { Result, ok, err } from '../../common/result';

export class DeleteInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IInfluencersRepo,
  ) {}

  async execute(id: number): Promise<Result<void, Error>> {
    // Check if influencer exists
    const influencer = await this.influencersRepo.findById(id);
    if (!influencer) {
      return err(new Error(`Influencer not found with ID: ${id}`));
    }

    // Delete influencer (social platforms will be cascade deleted)
    await this.influencersRepo.delete(id);

    return ok(undefined);
  }
}
