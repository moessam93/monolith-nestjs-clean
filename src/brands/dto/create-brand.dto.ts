import { IsString, IsUrl } from 'class-validator';

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
