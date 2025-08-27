import { IBeatsRepo } from '../../../domain/repositories/beats-repo';
import { Result, ok, err } from '../../common/result';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';

export class DeleteBeatUseCase {
  constructor(
    private readonly beatsRepo: IBeatsRepo,
  ) {}

  async execute(id: number): Promise<Result<void, BeatNotFoundError>> {
    // Check if beat exists
    const beat = await this.beatsRepo.findById(id);
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    // Delete beat
    await this.beatsRepo.delete(id);

    return ok(undefined);
  }
}
