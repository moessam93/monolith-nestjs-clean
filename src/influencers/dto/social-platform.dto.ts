import { IsString, IsInt, IsIn, IsUrl, Min, IsOptional } from 'class-validator';

export class SocialPlatformDto {
  @IsOptional()
  @IsInt()
  id?: number; // For updates

  @IsString()
  @IsIn(['instagram', 'tiktok', 'snapchat', 'youtube', 'facebook', 'twitter'])
  key: string;

  @IsUrl()
  url: string;

  @IsInt()
  @Min(0)
  numberOfFollowers: number;
}
