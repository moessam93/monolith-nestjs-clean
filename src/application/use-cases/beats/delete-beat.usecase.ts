import { Result, ok, err } from '../../common/result';
import { BeatNotFoundError } from '../../../domain/errors/beat-errors';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { Beat } from '../../../domain/entities/beat';
import { BaseSpecification } from '../../../domain/specifications/base-specification';

export class DeleteBeatUseCase {
  constructor(
    private readonly beatsRepo: IBaseRepository<Beat, number>,
  ) {}

  async execute(id: number): Promise<Result<void, BeatNotFoundError>> {
    // Check if beat exists
    const beat = await this.beatsRepo.findOne(new BaseSpecification<Beat>().whereEqual('id', id));
    if (!beat) {
      return err(new BeatNotFoundError(id));
    }

    // Delete beat
    await this.beatsRepo.delete(id);

    return ok(undefined);
  }
}
