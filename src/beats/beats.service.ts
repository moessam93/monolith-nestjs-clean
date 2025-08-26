import { Injectable } from '@nestjs/common';
import { CreateBeatDto } from './dto/create-beat.dto';
import { UpdateBeatDto } from './dto/update-beat.dto';
import { FindAllBeatsResponseDto } from './dto/find-all-beats-response.dto';
import { FindOneBeatResponseDto } from './dto/find-one-beat-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BeatsService {
  constructor(private prisma: PrismaService) {}

  async create(createBeatDto: CreateBeatDto) {
    return this.prisma.beat.create({
      data: createBeatDto,
      include: {
        influencer: true,
        brand: true,
      },
    });
  }

  async findAll(search?: string, page: number = 1, limit: number = 10): Promise<FindAllBeatsResponseDto> {
    const where = search
      ? {
          OR: [
            {
              caption: {
                contains: search,
                mode: 'insensitive' as const,
              }
            }
          ],
        }
      : {};

    // Get total count of all beats (without filter)
    const totalItems = await this.prisma.beat.count();

    // Get count of filtered beats
    const totalFiltered = await this.prisma.beat.count({ where });

    // Get the actual data
    const data = await this.prisma.beat.findMany({
      where,
      include: {
        influencer: true,
        brand: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const meta = new PaginationMetaDto(page, limit, totalItems, totalFiltered);

    return FindAllBeatsResponseDto.fromBeats(data, meta);
  }

  async findOne(id: number): Promise<FindOneBeatResponseDto | null> {
    const beat = await this.prisma.beat.findUnique({
      where: { id },
      include: {
        influencer: true,
        brand: true,
      },
    });

    if (!beat) {
      return null;
    }

    return FindOneBeatResponseDto.fromBeat(beat);
  }

  async update(id: number, updateBeatDto: UpdateBeatDto) {
    return this.prisma.beat.update({
      where: { id },
      data: updateBeatDto,
      include: {
        influencer: true,
        brand: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.beat.delete({
      where: { id },
    });
  }
}
