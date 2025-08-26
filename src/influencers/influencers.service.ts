import { Injectable } from '@nestjs/common';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import { FindAllInfluencersResponseDto } from './dto/find-all-influencers-response.dto';
import { FindOneInfluencerResponseDto } from './dto/find-one-influencer-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfluencersService {
  constructor(private prisma: PrismaService) {}

  async create(createInfluencerDto: CreateInfluencerDto) {
    const { socialPlatforms, ...influencerData } = createInfluencerDto;

    return this.prisma.influencer.create({
      data: {
        ...influencerData,
        ...(socialPlatforms && {
          socialPlatforms: {
            create: socialPlatforms.map(platform => ({
              key: platform.key,
              url: platform.url,
              numberOfFollowers: platform.numberOfFollowers,
            })),
          },
        }),
      },
      include: {
        socialPlatforms: true
      },
    });
  }

  async findAll(search?: string, page: number = 1, limit: number = 10): Promise<FindAllInfluencersResponseDto> {
    const where = search
      ? {
          OR: [
            {
              username: {
                contains: search,
                mode: 'insensitive' as const,
              }
            },
            {
              nameEn: {
                contains: search,
                mode: 'insensitive' as const,
              }
            },
            {
              nameAr: {
                contains: search,
                mode: 'insensitive' as const,
              }
            },
            {
              email: {
                contains: search,
                mode: 'insensitive' as const,
              }
            }
          ],
        }
      : {};

    // Get total count of all influencers (without filter)
    const totalItems = await this.prisma.influencer.count();

    // Get count of filtered influencers
    const totalFiltered = await this.prisma.influencer.count({ where });

    // Get the actual data
    const data = await this.prisma.influencer.findMany({
      where,
      include: {
        socialPlatforms: true
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const meta = new PaginationMetaDto(page, limit, totalItems, totalFiltered);

    return FindAllInfluencersResponseDto.fromInfluencers(data, meta);
  }

  async findOne(id: number): Promise<FindOneInfluencerResponseDto | null> {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id },
      include: {
        socialPlatforms: true,
      },
    });

    if (!influencer) {
      return null;
    }

    return FindOneInfluencerResponseDto.fromInfluencer(influencer);
  }

  async update(id: number, updateInfluencerDto: UpdateInfluencerDto) {
    const { socialPlatforms, ...influencerData } = updateInfluencerDto;

    // Handle social platforms update
    const updateData: any = { ...influencerData };

    if (socialPlatforms !== undefined) {
      // Delete existing social platforms and create new ones
      // This is a simple replace strategy
      await this.prisma.socialPlatform.deleteMany({
        where: { influencerId: id },
      });

      if (socialPlatforms.length > 0) {
        updateData.socialPlatforms = {
          create: socialPlatforms.map(platform => ({
            key: platform.key,
            url: platform.url,
            numberOfFollowers: platform.numberOfFollowers,
          })),
        };
      }
    }

    return this.prisma.influencer.update({
      where: { id },
      data: updateData,
      include: {
        socialPlatforms: true
      },
    });
  }

  async remove(id: number) {
    // Social platforms will be automatically deleted due to onDelete: Cascade
    return this.prisma.influencer.delete({
      where: { id },
    });
  }
}