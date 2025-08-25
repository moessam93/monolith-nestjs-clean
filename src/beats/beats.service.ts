import { Injectable } from '@nestjs/common';
import { CreateBeatDto } from './dto/create-beat.dto';
import { UpdateBeatDto } from './dto/update-beat.dto';
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

  async findAll(search?: string) {
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

    return this.prisma.beat.findMany({
      where,
      include: {
        influencer: true,
        brand: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.beat.findUnique({
      where: { id },
      include: {
        influencer: true,
        brand: true,
      },
    });
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
