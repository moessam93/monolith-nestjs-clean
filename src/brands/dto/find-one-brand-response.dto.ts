import { Beat } from '../../beats/entities/beat.entity';

export class FindOneBrandResponseDto {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl: string;
  websiteUrl: string;
  createdAt: Date;
  updatedAt: Date;
  beats?: Beat[];

  constructor(data: any) {
    this.id = data.id;
    this.nameEn = data.nameEn;
    this.nameAr = data.nameAr;
    this.logoUrl = data.logoUrl;
    this.websiteUrl = data.websiteUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.beats = data.beats || [];
  }

  static fromBrands(brands: any[]): FindOneBrandResponseDto[] {
    return brands.map(brand => new FindOneBrandResponseDto(brand));
  }

  static fromBrand(brand: any): FindOneBrandResponseDto {
    return new FindOneBrandResponseDto(brand);
  }
}
