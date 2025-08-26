import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FindAllBrandsResponseDto } from './dto/find-all-brands-response.dto';
import { FindOneBrandResponseDto } from './dto/find-one-brand-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  async findAll(search?: string, page: number = 1, limit: number = 10): Promise<FindAllBrandsResponseDto> {
    const where = search
      ? {
          OR: [
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
            }
          ],
        }
      : {};

    // Get total count of all brands (without filter)
    const totalItems = await this.prisma.brand.count();

    // Get count of filtered brands
    const totalFiltered = await this.prisma.brand.count({ where });

    // Get the actual data
    const data = await this.prisma.brand.findMany({
      where,
      include: {
        beats: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const meta = new PaginationMetaDto(page, limit, totalItems, totalFiltered);

    return FindAllBrandsResponseDto.fromBrands(data, meta);
  }

  async findOne(id: number): Promise<FindOneBrandResponseDto | null> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        beats: {
          include: {
            influencer: true,
          },
        },
      },
    });

    if (!brand) {
      return null;
    }

    return FindOneBrandResponseDto.fromBrand(brand);
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
