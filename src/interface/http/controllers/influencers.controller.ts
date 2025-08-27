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
} from '@nestjs/common';
import { TOKENS } from '../../../infrastructure/common/tokens';

// Use Cases
import { CreateInfluencerUseCase } from '../../../application/use-cases/influencers/create-influencer.usecase';
import { ListInfluencersUseCase } from '../../../application/use-cases/influencers/list-influencers.usecase';
import { GetInfluencerUseCase } from '../../../application/use-cases/influencers/get-influencer.usecase';
import { UpdateInfluencerUseCase } from '../../../application/use-cases/influencers/update-influencer.usecase';
import { DeleteInfluencerUseCase } from '../../../application/use-cases/influencers/delete-influencer.usecase';
import { ManageSocialPlatformUseCase } from '../../../application/use-cases/influencers/manage-social-platform.usecase';

// DTOs
import {
  CreateInfluencerInput,
  UpdateInfluencerInput,
  UpdateSocialPlatformInput,
  ListInfluencersInput,
  InfluencerOutput,
  SocialPlatformOutput,
} from '../../../application/dto/influencer.dto';
import { PaginationResult } from '../../../application/common/pagination';
import { isOk } from '../../../application/common/result';

// Validation DTOs
import { CreateInfluencerDto, UpdateInfluencerDto, UpdateSocialPlatformDto } from '../validation/influencer.dto';

@Controller('influencers')
export class InfluencersController {
  constructor(
    @Inject(TOKENS.CreateInfluencerUseCase)
    private readonly createInfluencerUseCase: CreateInfluencerUseCase,
    @Inject(TOKENS.ListInfluencersUseCase)
    private readonly listInfluencersUseCase: ListInfluencersUseCase,
    @Inject(TOKENS.GetInfluencerUseCase)
    private readonly getInfluencerUseCase: GetInfluencerUseCase,
    @Inject(TOKENS.UpdateInfluencerUseCase)
    private readonly updateInfluencerUseCase: UpdateInfluencerUseCase,
    @Inject(TOKENS.DeleteInfluencerUseCase)
    private readonly deleteInfluencerUseCase: DeleteInfluencerUseCase,
    @Inject(TOKENS.ManageSocialPlatformUseCase)
    private readonly manageSocialPlatformUseCase: ManageSocialPlatformUseCase,
  ) {}

  @Post()
  async create(@Body() createInfluencerDto: CreateInfluencerDto): Promise<InfluencerOutput> {
    const input: CreateInfluencerInput = {
      username: createInfluencerDto.username,
      email: createInfluencerDto.email,
      nameEn: createInfluencerDto.nameEn,
      nameAr: createInfluencerDto.nameAr,
      profilePictureUrl: createInfluencerDto.profilePictureUrl,
      socialPlatforms: createInfluencerDto.socialPlatforms?.map(sp => ({
        key: sp.key,
        url: sp.url,
        numberOfFollowers: sp.numberOfFollowers,
      })),
    };

    const result = await this.createInfluencerUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Get()
  async findAll(@Query() query: any): Promise<PaginationResult<InfluencerOutput>> {
    const input: ListInfluencersInput = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
    };

    const result = await this.listInfluencersUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InfluencerOutput> {
    const result = await this.getInfluencerUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ): Promise<InfluencerOutput> {
    const input: UpdateInfluencerInput = {
      id: parseInt(id),
      username: updateInfluencerDto.username,
      email: updateInfluencerDto.email,
      nameEn: updateInfluencerDto.nameEn,
      nameAr: updateInfluencerDto.nameAr,
      profilePictureUrl: updateInfluencerDto.profilePictureUrl,
    };

    const result = await this.updateInfluencerUseCase.execute(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.deleteInfluencerUseCase.execute(parseInt(id));
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Post(':id/social-platforms')
  async addOrUpdateSocialPlatform(
    @Param('id') id: string,
    @Body() updateSocialPlatformDto: UpdateSocialPlatformDto,
  ): Promise<SocialPlatformOutput> {
    const input: UpdateSocialPlatformInput = {
      influencerId: parseInt(id),
      key: updateSocialPlatformDto.key,
      url: updateSocialPlatformDto.url,
      numberOfFollowers: updateSocialPlatformDto.numberOfFollowers,
    };

    const result = await this.manageSocialPlatformUseCase.addOrUpdate(input);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }

  @Delete(':id/social-platforms/:key')
  async removeSocialPlatform(
    @Param('id') id: string,
    @Param('key') key: string,
  ): Promise<void> {
    const result = await this.manageSocialPlatformUseCase.remove(parseInt(id), key);
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }
}
