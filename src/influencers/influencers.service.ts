import { Injectable } from '@nestjs/common';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
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

  async findAll() {
    return this.prisma.influencer.findMany({
      include: {
        socialPlatforms: true
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.influencer.findUnique({
      where: { id },
      include: {
        socialPlatforms: true,
      },
    });
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