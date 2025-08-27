import { Injectable } from '@nestjs/common';
import { IBeatsRepo } from '../../../../domain/repositories/beats-repo';
import { Beat } from '../../../../domain/entities/beat';
import { PrismaService } from '../prisma.service';
import { BeatMapper } from '../mappers/beat.mapper';

@Injectable()
export class PrismaBeatsRepo implements IBeatsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Beat | null> {
    const prismaBeat = await this.prisma.beat.findUnique({
      where: { id },
    });

    return prismaBeat ? BeatMapper.toDomain(prismaBeat) : null;
  }

  async list(options: {
    page?: number;
    limit?: number;
    search?: string;
    influencerId?: number;
    brandId?: number;
    statusKey?: string;
  } = {}): Promise<{ data: Beat[]; total: number; totalFiltered: number }> {
    const { page = 1, limit = 10, search, influencerId, brandId, statusKey } = options;

    const where: any = {};
    
    if (search) {
      where.caption = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }
    
    if (influencerId) {
      where.influencerId = influencerId;
    }
    
    if (brandId) {
      where.brandId = brandId;
    }
    
    if (statusKey) {
      where.statusKey = statusKey;
    }

    const [prismaBeats, total, totalFiltered] = await this.prisma.$transaction([
      this.prisma.beat.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.beat.count(),
      this.prisma.beat.count({ where }),
    ]);

    return {
      data: prismaBeats.map(BeatMapper.toDomain),
      total,
      totalFiltered,
    };
  }

  async create(beat: Beat): Promise<Beat> {
    const data = BeatMapper.toPrismaCreate(beat);
    const createdBeat = await this.prisma.beat.create({
      data,
    });

    return BeatMapper.toDomain(createdBeat);
  }

  async update(beat: Beat): Promise<Beat> {
    const data = BeatMapper.toPrismaUpdate(beat);
    const updatedBeat = await this.prisma.beat.update({
      where: { id: beat.id },
      data,
    });

    return BeatMapper.toDomain(updatedBeat);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.beat.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.beat.count({
      where: { id },
    });
    return count > 0;
  }

  async countByInfluencer(influencerId: number): Promise<number> {
    return this.prisma.beat.count({
      where: { influencerId },
    });
  }

  async countByBrand(brandId: number): Promise<number> {
    return this.prisma.beat.count({
      where: { brandId },
    });
  }
}
