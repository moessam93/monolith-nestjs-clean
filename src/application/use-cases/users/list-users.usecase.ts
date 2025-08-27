import { IUsersRepo } from '../../../domain/repositories/users-repo';
import { ListUsersInput, UserOutput } from '../../dto/user.dto';
import { Result, ok } from '../../common/result';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';

export class ListUsersUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
  ) {}

  async execute(input: ListUsersInput = {}): Promise<Result<PaginationResult<UserOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const result = await this.usersRepo.list({ page, limit, search });

    const userOutputs: UserOutput[] = result.data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCountryCode: user.phoneCountryCode,
      roles: [], // This will be populated by the mapper later
      createdAt: user.createdAt!,
      updatedAt: user.updatedAt!,
    }));

    return ok({
      data: userOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.total),
    });
  }
}
