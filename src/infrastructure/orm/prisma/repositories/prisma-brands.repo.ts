import { Injectable } from '@nestjs/common';
import { Brand } from '../../../../domain/entities/brand';
import { PrismaService } from '../prisma.service';
import { BrandMapper } from '../mappers/brand.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaBrandsRepo extends BasePrismaRepository<Brand, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'brand', BrandMapper);
  }
}
