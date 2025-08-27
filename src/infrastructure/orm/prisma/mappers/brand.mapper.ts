import { Brand } from '../../../../domain/entities/brand';

export class BrandMapper {
  static toDomain(prismaBrand: any): Brand {
    return new Brand(
      prismaBrand.id,
      prismaBrand.nameEn,
      prismaBrand.nameAr,
      prismaBrand.logoUrl,
      prismaBrand.websiteUrl,
      prismaBrand.createdAt,
      prismaBrand.updatedAt,
    );
  }

  static toPrisma(brand: Brand) {
    return {
      id: brand.id,
      nameEn: brand.nameEn,
      nameAr: brand.nameAr,
      logoUrl: brand.logoUrl,
      websiteUrl: brand.websiteUrl,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  static toPrismaCreate(brand: Brand) {
    const data = BrandMapper.toPrisma(brand);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    return data;
  }

  static toPrismaUpdate(brand: Brand) {
    const data = BrandMapper.toPrisma(brand);
    // Remove id and timestamps for updates
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    return data;
  }
}
