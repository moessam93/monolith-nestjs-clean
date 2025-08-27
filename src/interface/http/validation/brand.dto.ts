import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsUrl()
  logoUrl: string;

  @IsUrl()
  websiteUrl: string;
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
