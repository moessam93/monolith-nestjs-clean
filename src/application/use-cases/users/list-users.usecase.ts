
import { ListUsersInput, UserOutput } from '../../dto/user.dto';
import { Result, ok } from '../../common/result';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { IUnitOfWork } from '../../../domain/uow/unit-of-work';

export class ListUsersUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: ListUsersInput = {}): Promise<Result<PaginationResult<UserOutput>>> {
    const { page = 1, limit = 20, search } = input;

    return this.unitOfWork.execute(async ({ users, roles }) => {
      const result = await users.list({ page, limit, search });

    // Get all unique role keys from all users
    const allRoleKeys = [...new Set(result.data.flatMap(user => user.roles))];
    const allRoles = await roles.findByKeys(allRoleKeys);
    
    // Create a map for quick role lookup
    const roleMap = new Map(allRoles.map(role => [role.key, role]));
    
    // Map users to UserOutput with proper roles
    const userOutputs: UserOutput[] = result.data.map(user => {
      const userRoles = user.roles.map(roleKey => roleMap.get(roleKey)!).filter(Boolean);
      return UserOutputMapper.toOutput(user, userRoles);
    });

    return ok({
      data: userOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.total),
    });
    });
  }
}
