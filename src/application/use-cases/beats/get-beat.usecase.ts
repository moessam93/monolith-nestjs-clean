import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';

export class GetBeatUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
  ) {}

  async execute(id: number): Promise<Result<BeatOutput, BeatNotFoundError>> {
    const beat = await this.beatsRepo.findById(id);
    
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    return ok({
      id: beat.id,
      caption: beat.caption || undefined,
      mediaUrl: beat.mediaUrl,
      thumbnailUrl: beat.thumbnailUrl,
      statusKey: beat.statusKey,
      influencerId: beat.influencerId,
      brandId: beat.brandId,
      createdAt: beat.createdAt!,
      updatedAt: beat.updatedAt!,
    });
  }
}
