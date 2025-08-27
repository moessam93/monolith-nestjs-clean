import { Injectable } from '@nestjs/common';
import { IBrandsRepo } from '../../../../domain/repositories/brands-repo';
import { Brand } from '../../../../domain/entities/brand';
import { PrismaService } from '../prisma.service';
import { BrandMapper } from '../mappers/brand.mapper';

@Injectable()
export class PrismaBrandsRepo implements IBrandsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Brand | null> {
    const prismaBrand = await this.prisma.brand.findUnique({
      where: { id },
    });

    return prismaBrand ? BrandMapper.toDomain(prismaBrand) : null;
  }

  async list(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: Brand[]; total: number; totalFiltered: number }> {
    const { page = 1, limit = 20, search } = options;

    const where = search
      ? {
          OR: [
            { nameEn: { contains: search, mode: 'insensitive' as const } },
            { nameAr: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [prismaBrands, total, totalFiltered] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.brand.count(),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data: prismaBrands.map(BrandMapper.toDomain),
      total,
      totalFiltered,
    };
  }

  async create(brand: Brand): Promise<Brand> {
    const data = BrandMapper.toPrismaCreate(brand);
    const createdBrand = await this.prisma.brand.create({
      data,
    });

    return BrandMapper.toDomain(createdBrand);
  }

  async update(brand: Brand): Promise<Brand> {
    const data = BrandMapper.toPrismaUpdate(brand);
    const updatedBrand = await this.prisma.brand.update({
      where: { id: brand.id },
      data,
    });

    return BrandMapper.toDomain(updatedBrand);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.brand.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.brand.count({
      where: { id },
    });
    return count > 0;
  }

  async findByName(nameEn?: string, nameAr?: string): Promise<Brand[]> {
    const where: any = {};
    
    if (nameEn || nameAr) {
      where.OR = [];
      if (nameEn) {
        where.OR.push({ nameEn: { equals: nameEn, mode: 'insensitive' } });
      }
      if (nameAr) {
        where.OR.push({ nameAr: { equals: nameAr, mode: 'insensitive' } });
      }
    }

    const prismaBrands = await this.prisma.brand.findMany({
      where,
    });

    return prismaBrands.map(BrandMapper.toDomain);
  }
}
