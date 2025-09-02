import { Injectable } from '@nestjs/common';
import { Influencer } from '../../../../domain/entities/influencer';
import { PrismaService } from '../prisma.service';
import { InfluencerMapper } from '../mappers/influencer.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaInfluencersRepo extends BasePrismaRepository<Influencer, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'influencer', InfluencerMapper);
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
}
