import { Brand } from '../../../../domain/entities/brand';
import { BaseMapper } from './base.mapper';

export class BrandMapper {
  // Using generic methods for clean code
  static toDomain(prismaBrand: any): Brand {
    return BaseMapper.genericToDomain(
      Brand,
      prismaBrand,
      ['id', 'nameEn', 'nameAr', 'logoUrl', 'websiteUrl', 'createdAt', 'updatedAt']
    );
  }

  static toPrisma(brand: Brand) {
    return BaseMapper.genericToPrisma(brand);
  }

  static toPrismaCreate(brand: Brand) {
    return BaseMapper.baseToPrismaCreate(brand, BrandMapper.toPrisma);
  }

  static toPrismaUpdate(brand: Brand) {
    return BaseMapper.baseToPrismaUpdate(brand, BrandMapper.toPrisma);
  }
}
