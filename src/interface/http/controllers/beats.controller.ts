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
import { CreateBeatUseCase } from '../../../application/use-cases/beats/create-beat.usecase';
import { ListBeatsUseCase } from '../../../application/use-cases/beats/list-beats.usecase';
import { GetBeatUseCase } from '../../../application/use-cases/beats/get-beat.usecase';
import { UpdateBeatUseCase } from '../../../application/use-cases/beats/update-beat.usecase';
import { DeleteBeatUseCase } from '../../../application/use-cases/beats/delete-beat.usecase';
import { BEAT_INFLUENCER_NOT_FOUND, BEAT_BRAND_NOT_FOUND, BEAT_NOT_FOUND } from '../../../domain/errors/beat-errors';
// DTOs
import {
  CreateBeatInput,
  UpdateBeatInput,
  ListBeatsInput,
  BeatOutput,
} from '../../../application/dto/beat.dto';
import { PaginationResult } from '../../../application/common/pagination';
import { isOk } from '../../../application/common/result';

// Validation DTOs
import { CreateBeatDto, UpdateBeatDto } from '../validation/beat.dto';
import { Roles } from 'src/interface/decorators/roles.decorator';
import { ROLES } from 'src/interface/constants/roles';

@Controller('beats')
export class BeatsController {
  constructor(
    @Inject(TOKENS.CreateBeatUseCase)
    private readonly createBeatUseCase: CreateBeatUseCase,
    @Inject(TOKENS.ListBeatsUseCase)
    private readonly listBeatsUseCase: ListBeatsUseCase,
    @Inject(TOKENS.GetBeatUseCase)
    private readonly getBeatUseCase: GetBeatUseCase,
    @Inject(TOKENS.UpdateBeatUseCase)
    private readonly updateBeatUseCase: UpdateBeatUseCase,
    @Inject(TOKENS.DeleteBeatUseCase)
    private readonly deleteBeatUseCase: DeleteBeatUseCase,
  ) { }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EXECUTIVE)
  @Post()
  async create(@Body() createBeatDto: CreateBeatDto): Promise<BeatOutput> {
    const input: CreateBeatInput = {
      caption: createBeatDto.caption,
      mediaUrl: createBeatDto.mediaUrl,
      thumbnailUrl: createBeatDto.thumbnailUrl,
      statusKey: createBeatDto.statusKey,
      influencerId: createBeatDto.influencerId,
      brandId: createBeatDto.brandId,
    };

    const result = await this.createBeatUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }

    var error = result.error;
    if (error.code === BEAT_INFLUENCER_NOT_FOUND) {
      throw new BadRequestException({
        message: error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else if (error.code === BEAT_BRAND_NOT_FOUND) {
      throw new BadRequestException({
        message: error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    throw new BadRequestException({
      message: 'Failed to create beat',
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EXECUTIVE)
  @Get()
  async findAll(@Query() query: any): Promise<PaginationResult<BeatOutput>> {
    const input: ListBeatsInput = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      influencerId: query.influencerId ? parseInt(query.influencerId) : undefined,
      brandId: query.brandId ? parseInt(query.brandId) : undefined,
      statusKey: query.statusKey,
    };

    const result = await this.listBeatsUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw new BadRequestException({
      message: 'Failed to list beats',
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EXECUTIVE)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BeatOutput> {
    const result = await this.getBeatUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BEAT_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    throw new BadRequestException({
      message: 'Failed to get beat',
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    });
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EXECUTIVE)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBeatDto: UpdateBeatDto,
  ): Promise<BeatOutput> {
    const input: UpdateBeatInput = {
      id: parseInt(id),
      caption: updateBeatDto.caption,
      mediaUrl: updateBeatDto.mediaUrl,
      thumbnailUrl: updateBeatDto.thumbnailUrl,
      statusKey: updateBeatDto.statusKey,
    };

    const result = await this.updateBeatUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BEAT_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else if (result.error.code === BEAT_INFLUENCER_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else if (result.error.code === BEAT_BRAND_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else {
      throw new BadRequestException({
        message: 'Failed to update beat',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.deleteBeatUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    else if (result.error.code === BEAT_NOT_FOUND) {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
    else {
      throw new BadRequestException({
        message: result.error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
