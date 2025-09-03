
import { ListUsersInput, UserOutput } from '../../dto/user.dto';
import { Result, ok } from '../../common/result';
import { UserOutputMapper } from '../../mappers/user-output.mapper';
import { PaginationResult, createPaginationMeta } from '../../common/pagination';
import { IBaseRepository } from '../../../domain/repositories/base-repo';
import { User } from '../../../domain/entities/user';
import { BaseSpecification } from '../../../domain/specifications/base-specification';
import { Role } from '../../../domain/entities/role';
export class ListUsersUseCase {
  constructor(
    private readonly usersRepo: IBaseRepository<User, string>,
    private readonly rolesRepo: IBaseRepository<Role, number>,
  ) {}

  async execute(input: ListUsersInput = {}): Promise<Result<PaginationResult<UserOutput>>> {
    const { page = 1, limit = 20, search } = input;

    const spec = new BaseSpecification<User>();
    if (search) {
      spec.whereContains('name', search).whereContains('email', search);
    }
    spec.include(['userRoles.role']).paginate({ page, limit });

    const result = await this.usersRepo.list(spec);
    
    // Map users to UserOutput with roles from userRoles relationship
    const userOutputsPromises: Promise<UserOutput>[] = result.data.map(async user => {
      const userRoles = user.userRoles;
      const roles = await this.rolesRepo.findMany(new BaseSpecification<Role>().whereIn('id', userRoles.map(ur => ur.roleId)));
      return UserOutputMapper.toOutput(user, roles);
    });

    const userOutputs = await Promise.all(userOutputsPromises);

    return ok({
      data: userOutputs,
      meta: createPaginationMeta(page, limit, result.total, result.totalFiltered),
    });
  }
}
