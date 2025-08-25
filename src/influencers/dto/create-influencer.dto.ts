import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { SocialPlatformDto } from './social-platform.dto';

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
  @Type(() => SocialPlatformDto)
  socialPlatforms?: SocialPlatformDto[];
}