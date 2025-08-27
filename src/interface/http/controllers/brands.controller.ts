import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/common/tokens';

// Use Cases
import { CreateBrandUseCase } from '../../../application/use-cases/brands/create-brand.usecase';
import { ListBrandsUseCase } from '../../../application/use-cases/brands/list-brands.usecase';
import { GetBrandUseCase } from '../../../application/use-cases/brands/get-brand.usecase';
import { UpdateBrandUseCase } from '../../../application/use-cases/brands/update-brand.usecase';
import { DeleteBrandUseCase } from '../../../application/use-cases/brands/delete-brand.usecase';

// DTOs
import {
  CreateBrandInput,
  UpdateBrandInput,
  ListBrandsInput,
  BrandOutput,
} from '../../../application/dto/brand.dto';
import { PaginationResult } from '../../../application/common/pagination';
import { isOk } from '../../../application/common/result';

// Validation DTOs
import { CreateBrandDto, UpdateBrandDto } from '../validation/brand.dto';
import { Roles } from 'src/interface/decorators/roles.decorator';
import { ROLES } from 'src/interface/constants/roles';
import { BRAND_NAME_ALREADY_EXISTS, BRAND_NOT_FOUND } from 'src/domain/errors/brand-errors';

@Controller('brands')
export class BrandsController {
  constructor(
    @Inject(TOKENS.CreateBrandUseCase)
    private readonly createBrandUseCase: CreateBrandUseCase,
    @Inject(TOKENS.ListBrandsUseCase)
    private readonly listBrandsUseCase: ListBrandsUseCase,
    @Inject(TOKENS.GetBrandUseCase)
    private readonly getBrandUseCase: GetBrandUseCase,
    @Inject(TOKENS.UpdateBrandUseCase)
    private readonly updateBrandUseCase: UpdateBrandUseCase,
    @Inject(TOKENS.DeleteBrandUseCase)
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
  ) {}

  @Roles(ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.EXECUTIVE)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto): Promise<BrandOutput> {
    const input: CreateBrandInput = {
      nameEn: createBrandDto.nameEn,
      nameAr: createBrandDto.nameAr,
      logoUrl: createBrandDto.logoUrl,
      websiteUrl: createBrandDto.websiteUrl,
    };

    const result = await this.createBrandUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BRAND_NAME_ALREADY_EXISTS) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else{
      
    }
    throw result.error;
  }

  @Roles(ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.EXECUTIVE)
  @Get()
  async findAll(@Query() query: any): Promise<PaginationResult<BrandOutput>> {
    const input: ListBrandsInput = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
    };

    const result = await this.listBrandsUseCase.execute(input);
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

  @Roles(ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.EXECUTIVE)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BrandOutput> {
    const result = await this.getBrandUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BRAND_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
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
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BrandOutput> {
    const input: UpdateBrandInput = {
      id: parseInt(id),
      nameEn: updateBrandDto.nameEn,
      nameAr: updateBrandDto.nameAr,
      logoUrl: updateBrandDto.logoUrl,
      websiteUrl: updateBrandDto.websiteUrl,
    };

    const result = await this.updateBrandUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BRAND_NAME_ALREADY_EXISTS) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
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
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.deleteBrandUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BRAND_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
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
}
