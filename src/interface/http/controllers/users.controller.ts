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
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { ROLES } from '../../../domain/constants/roles';
import { TOKENS } from '../../../infrastructure/common/tokens';

// Use Cases
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
import { InsufficientPermissionsError, UserAlreadyExistsError, UserNotFoundError } from '../../../domain/errors/user-errors';

// Validation DTOs
import { CreateUserDto, UpdateUserDto, AssignRolesDto } from '../validation/user.dto';

@Controller('users')
export class UsersController {
  constructor(

    @Inject(TOKENS.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(TOKENS.ListUsersUseCase)
    private readonly listUsersUseCase: ListUsersUseCase,
    @Inject(TOKENS.UpdateUserUseCase)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(TOKENS.AssignRolesUseCase)
    private readonly assignRolesUseCase: AssignRolesUseCase,
  ) {}

  @Roles(ROLES.SUPER_ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<UserOutput> {
  
    const input: CreateUserInput = {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        phoneNumber: createUserDto.phoneNumber,
        phoneNumberCountryCode: createUserDto.phoneNumberCountryCode,
        roleKeys: createUserDto.roleKeys,
      };

      const result = await this.createUserUseCase.execute(input, req.user?.roles);
      if (isOk(result)) {
        return result.value;
      }
      else if (result.error instanceof UserAlreadyExistsError) {
        throw new BadRequestException({
          message: result.error.message,
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        });
      }
      else if (result.error instanceof InsufficientPermissionsError) {
        throw new ForbiddenException({
          message: result.error.message,
          error: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
        });
      }
      else{
        throw new BadRequestException({
          message: result.error.message,
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        });
      }
  }

  @Roles(ROLES.SUPER_ADMIN,ROLES.ADMIN)
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
    else{
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
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
      phoneNumberCountryCode: updateUserDto.phoneNumberCountryCode,
    };

    const result = await this.updateUserUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error instanceof UserNotFoundError) {
      throw new NotFoundException({
        message: result.error.message,
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
      });
    }
    else if (result.error instanceof UserAlreadyExistsError) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else{
      throw new BadRequestException({
        message: 'Failed to update user',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
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
