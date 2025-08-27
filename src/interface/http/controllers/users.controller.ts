import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Inject,
  Query,
} from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ROLES } from '../../../common/constants/roles';
import { TOKENS } from '../../../infrastructure/common/tokens';

// Use Cases
import { BootstrapFirstSuperAdminUseCase } from '../../../application/use-cases/users/bootstrap-first-superadmin.usecase';
import { CreateUserUseCase } from '../../../application/use-cases/users/create-user.usecase';
import { ListUsersUseCase } from '../../../application/use-cases/users/list-users.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.usecase';
import { AssignRolesUseCase } from '../../../application/use-cases/users/assign-roles.usecase';

// DTOs
import {
  BootstrapSuperAdminInput,
  CreateUserInput,
  UpdateUserInput,
  ListUsersInput,
  AssignRolesInput,
  UserOutput,
} from '../../../application/dto/user.dto';
import { PaginationResult } from '../../../application/common/pagination';
import { isOk } from '../../../application/common/result';

// Validation DTOs
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from '../validation/user.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(TOKENS.BootstrapFirstSuperAdminUseCase)
    private readonly bootstrapFirstSuperAdminUseCase: BootstrapFirstSuperAdminUseCase,
    @Inject(TOKENS.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(TOKENS.ListUsersUseCase)
    private readonly listUsersUseCase: ListUsersUseCase,
    @Inject(TOKENS.UpdateUserUseCase)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(TOKENS.AssignRolesUseCase)
    private readonly assignRolesUseCase: AssignRolesUseCase,
  ) {}

  @Public() // Public for bootstrap - creating the first SuperAdmin
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<UserOutput> {
    // Check if this is bootstrap (no users exist) or regular user creation
    const isBootstrap = !req.user; // No authenticated user means bootstrap

    if (isBootstrap) {
      const input: BootstrapSuperAdminInput = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        phoneNumber: createUserDto.phoneNumber,
        phoneCountryCode: createUserDto.phoneCountryCode,
      };

      const result = await this.bootstrapFirstSuperAdminUseCase.execute(input);
      if (isOk(result)) {
        return result.value;
      }
      throw result.error;
    } else {
      const input: CreateUserInput = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        phoneNumber: createUserDto.phoneNumber,
        phoneCountryCode: createUserDto.phoneCountryCode,
        roleKeys: createUserDto.roleKeys,
      };

      const result = await this.createUserUseCase.execute(input, req.user?.roles);
      if (isOk(result)) {
        return result.value;
      }
      throw result.error;
    }
  }

  @Roles(ROLES.SUPER_ADMIN)
  @Get()
  async findAll(@Query() query: any): Promise<PaginationResult<UserOutput>> {
    const input: ListUsersInput = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
    };

    const result = await this.listUsersUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Roles(ROLES.SUPER_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserOutput> {
    const input: UpdateUserInput = {
      id,
      name: updateUserDto.name,
      email: updateUserDto.email,
      phoneNumber: updateUserDto.phoneNumber,
      phoneCountryCode: updateUserDto.phoneCountryCode,
    };

    const result = await this.updateUserUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Roles(ROLES.SUPER_ADMIN)
  @Post(':id/roles')
  async assignRoles(
    @Param('id') id: string,
    @Body() assignRolesDto: AssignRolesDto,
    @Request() req,
  ): Promise<UserOutput> {
    const input: AssignRolesInput = {
      userId: id,
      roleKeys: assignRolesDto.roleKeys,
    };

    const result = await this.assignRolesUseCase.execute(input, req.user?.roles);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }
}
