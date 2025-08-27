import { Injectable } from '@nestjs/common';
import { ISocialPlatformsRepo } from '../../../../domain/repositories/social-platforms-repo';
import { SocialPlatform } from '../../../../domain/entities/social-platform';
import { PrismaService } from '../prisma.service';
import { SocialPlatformMapper } from '../mappers/social-platform.mapper';

@Injectable()
export class PrismaSocialPlatformsRepo implements ISocialPlatformsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<SocialPlatform | null> {
    const prismaSocialPlatform = await this.prisma.socialPlatform.findUnique({
      where: { id },
    });

    return prismaSocialPlatform ? SocialPlatformMapper.toDomain(prismaSocialPlatform) : null;
  }

  async findByInfluencerId(influencerId: number): Promise<SocialPlatform[]> {
    const prismaSocialPlatforms = await this.prisma.socialPlatform.findMany({
      where: { influencerId },
      orderBy: { key: 'asc' },
    });

    return prismaSocialPlatforms.map(SocialPlatformMapper.toDomain);
  }

  async findByInfluencerAndKey(influencerId: number, key: string): Promise<SocialPlatform | null> {
    const prismaSocialPlatform = await this.prisma.socialPlatform.findUnique({
      where: {
        influencerId_key: {
          influencerId,
          key,
        },
      },
    });

    return prismaSocialPlatform ? SocialPlatformMapper.toDomain(prismaSocialPlatform) : null;
  }

  async create(socialPlatform: SocialPlatform): Promise<SocialPlatform> {
    const data = SocialPlatformMapper.toPrismaCreate(socialPlatform);
    const createdSocialPlatform = await this.prisma.socialPlatform.create({
      data,
    });

    return SocialPlatformMapper.toDomain(createdSocialPlatform);
  }

  async update(socialPlatform: SocialPlatform): Promise<SocialPlatform> {
    const data = SocialPlatformMapper.toPrismaUpdate(socialPlatform);
    const updatedSocialPlatform = await this.prisma.socialPlatform.update({
      where: { id: socialPlatform.id },
      data,
    });

    return SocialPlatformMapper.toDomain(updatedSocialPlatform);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.socialPlatform.delete({
      where: { id },
    });
  }

  async deleteByInfluencerAndKey(influencerId: number, key: string): Promise<void> {
    await this.prisma.socialPlatform.delete({
      where: {
        influencerId_key: {
          influencerId,
          key,
        },
      },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.socialPlatform.count({
      where: { id },
    });
    return count > 0;
  }
}
