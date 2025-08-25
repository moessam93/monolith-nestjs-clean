import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        beats: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        beats: {
          include: {
            influencer: true,
          },
        },
      },
    });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: number) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
