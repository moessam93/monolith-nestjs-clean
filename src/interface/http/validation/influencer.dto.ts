import { IsString, IsEmail, IsUrl, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSocialPlatformDto {
  @IsString()
  key: string;

  @IsUrl()
  url: string;

  @IsNumber()
  numberOfFollowers: number;
}

export class CreateInfluencerDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsUrl()
  profilePictureUrl: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSocialPlatformDto)
  socialPlatforms?: CreateSocialPlatformDto[];
}

export class UpdateInfluencerDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSocialPlatformDto)
  socialPlatforms?: UpdateSocialPlatformDto[];
}

export class UpdateSocialPlatformDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  key: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsNumber()
  numberOfFollowers?: number;
}
