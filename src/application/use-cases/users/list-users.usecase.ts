
import { ListUsersInput, UserOutput } from '../../dto/user.dto';
import { Result, ok } from '../../common/result';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { IUnitOfWork } from '../../../domain/uow/unit-of-work';
import { IUsersRepo } from 'src/domain/repositories/users-repo';
import { IRolesRepo } from 'src/domain/repositories/roles-repo';
export class ListUsersUseCase {
  constructor(
    private readonly usersRepo: IUsersRepo,
    private readonly rolesRepo: IRolesRepo,
  ) {}

  async execute(input: ListUsersInput = {}): Promise<Result<PaginationResult<UserOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const result = await this.usersRepo.list({ page, limit, search });

    // Get all unique role keys from all users
    const allRoleKeys = [...new Set(result.data.flatMap(user => user.roles))];
    const allRoles = await this.rolesRepo.findByKeys(allRoleKeys);
    
    // Create a map for quick role lookup
    const roleMap = new Map(allRoles.map(role => [role.key, role]));
    
    // Map users to UserOutput with proper roles
    const userOutputs: UserOutput[] = result.data.map(user => {
      const userRoles = user.roles.map(roleKey => roleMap.get(roleKey)!).filter(Boolean);
      return UserOutputMapper.toOutput(user, userRoles);
    });

    return ok({
      data: userOutputs,
      meta: createPaginationMeta(page, limit, result.total),
    });
  }
}
