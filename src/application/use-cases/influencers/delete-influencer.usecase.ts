import { Result, ok, err } from '../../common/result';
import { InfluencerHasBeatsError, InfluencerNotFoundError } from '../../../domain/errors/influencer-errors';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Influencer } from '../../../domain/entities/influencer';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { ActivityLoggerPort } from '../../ports/activity-logger.port';

export class DeleteInfluencerUseCase {
  constructor(
    private readonly influencersRepo: IBaseRepository<Influencer, number>,
    private readonly beatsRepo: IBaseRepository<Beat, number>,
    private readonly activityLogger: ActivityLoggerPort,
  ) {}

  async execute(id: number): Promise<Result<void, InfluencerNotFoundError | InfluencerHasBeatsError>> {
    // Check if influencer exists
    const influencer = await this.influencersRepo.findOne(new BaseSpecification<Influencer>().whereEqual('id', id));
    if (!influencer) {
      return err(new InfluencerNotFoundError(id));
    }

    // Check if influencer has beats
    const beats = await this.beatsRepo.count(new BaseSpecification<Beat>().whereEqual('influencerId', id));
    if (beats > 0) {
      return err(new InfluencerHasBeatsError(id));
    }

    // Delete influencer (social platforms will be cascade deleted)
    await this.influencersRepo.delete(id);

    await this.activityLogger.logDelete('influencer', id);

    return ok(undefined);
  }
}
