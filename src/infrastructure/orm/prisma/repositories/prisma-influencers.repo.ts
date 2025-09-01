import { Injectable } from '@nestjs/common';
import { IInfluencersRepo } from '../../../../domain/repositories/influencers-repo';
import { Influencer } from '../../../../domain/entities/influencer';
import { PrismaService } from '../prisma.service';
import { InfluencerMapper } from '../mappers/influencer.mapper';

@Injectable()
export class PrismaInfluencersRepo implements IInfluencersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Influencer | null> {
    const prismaInfluencer = await this.prisma.influencer.findUnique({
      where: { id },
      include: {
        socialPlatforms: true,
      },
    });

    return prismaInfluencer ? InfluencerMapper.toDomain(prismaInfluencer) : null;
  }

  async findByUsername(username: string): Promise<Influencer | null> {
    const prismaInfluencer = await this.prisma.influencer.findUnique({
      where: { username },
      include: {
        socialPlatforms: true,
      },
    });

    return prismaInfluencer ? InfluencerMapper.toDomain(prismaInfluencer) : null;
  }

  async findByEmail(email: string): Promise<Influencer | null> {
    const prismaInfluencer = await this.prisma.influencer.findUnique({
      where: { email },
      include: {
        socialPlatforms: true,
      },
    });

    return prismaInfluencer ? InfluencerMapper.toDomain(prismaInfluencer) : null;
  }

  async list(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: Influencer[]; total: number; totalFiltered: number }> {
    const { page = 1, limit = 20, search } = options;

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { nameEn: { contains: search, mode: 'insensitive' as const } },
            { nameAr: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [prismaInfluencers, total, totalFiltered] = await this.prisma.$transaction([
      this.prisma.influencer.findMany({
        where,
        include: {
          socialPlatforms: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.influencer.count(),
      this.prisma.influencer.count({ where }),
    ]);

    return {
      data: prismaInfluencers.map(InfluencerMapper.toDomain),
      total,
      totalFiltered,
    };
  }

  async create(influencer: Influencer): Promise<Influencer> {
    const data = InfluencerMapper.toPrismaCreate(influencer);
    const createdInfluencer = await this.prisma.influencer.create({
      data,
      include: {
        socialPlatforms: true,
      },
    });

    return InfluencerMapper.toDomain(createdInfluencer);
  }

  async update(influencer: Influencer): Promise<Influencer> {
    const data = InfluencerMapper.toPrismaUpdate(influencer);
    
    // Handle social platforms separately
    const socialPlatformsData: any = {};
    
    if (influencer.socialPlatforms && influencer.socialPlatforms.length > 0) {
      // Separate new and existing social platforms
      const newSocialPlatforms = influencer.socialPlatforms.filter(sp => 
        !sp.id || sp.id === 0
      );
      const existingSocialPlatforms = influencer.socialPlatforms.filter(sp => 
        sp.id && sp.id > 0
      );

      // Prepare create operations for new social platforms
      if (newSocialPlatforms.length > 0) {
        socialPlatformsData.create = newSocialPlatforms.map(sp => ({
          key: sp.key,
          url: sp.url,
          numberOfFollowers: sp.numberOfFollowers,
        }));
      }

      // Prepare update operations for existing social platforms
      if (existingSocialPlatforms.length > 0) {
        socialPlatformsData.update = existingSocialPlatforms.map(sp => ({
          where: { id: sp.id },
          data: {
            url: sp.url,
            numberOfFollowers: sp.numberOfFollowers,
          }
        }));
      }
    }

    const updatedInfluencer = await this.prisma.influencer.update({
      where: { id: influencer.id },
      data: {
        ...data,
        ...(Object.keys(socialPlatformsData).length > 0 && { socialPlatforms: socialPlatformsData })
      },
      include: {
        socialPlatforms: true,
      },
    });

    return InfluencerMapper.toDomain(updatedInfluencer);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.influencer.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.influencer.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.influencer.count({
      where: { username },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.influencer.count({
      where: { email },
    });
    return count > 0;
  }
}
