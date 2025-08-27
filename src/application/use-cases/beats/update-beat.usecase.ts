import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { UpdateBeatInput, BeatOutput } from '../../dto/beat.dto';
import { Result, ok, err } from '../../common/result';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';

export class UpdateBeatUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
  ) {}

  async execute(input: UpdateBeatInput): Promise<Result<BeatOutput, BeatNotFoundError>> {
    const { id, caption, mediaUrl, thumbnailUrl, statusKey } = input;

    // Check if beat exists
    const beat = await this.beatsRepo.findById(id);
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    // Update beat properties
    if (caption !== undefined) beat.caption = caption;
    if (mediaUrl !== undefined) beat.mediaUrl = mediaUrl;
    if (thumbnailUrl !== undefined) beat.thumbnailUrl = thumbnailUrl;
    if (statusKey !== undefined) beat.statusKey = statusKey;

    // Save updated beat
    const updatedBeat = await this.beatsRepo.update(beat);

    return ok({
      id: updatedBeat.id,
      caption: updatedBeat.caption || undefined,
      mediaUrl: updatedBeat.mediaUrl,
      thumbnailUrl: updatedBeat.thumbnailUrl,
      statusKey: updatedBeat.statusKey,
      influencerId: updatedBeat.influencerId,
      brandId: updatedBeat.brandId,
      createdAt: updatedBeat.createdAt!,
      updatedAt: updatedBeat.updatedAt!,
    });
  }
}
