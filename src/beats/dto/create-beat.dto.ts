import { IsString, IsOptional, IsInt, IsPositive, IsUrl } from 'class-validator';

export class CreateBeatDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsUrl()
  mediaUrl: string;

  @IsUrl()
  thumbnailUrl: string;

  @IsString()
  statusKey: string;

  @IsInt()
  @IsPositive()
  influencerId: number;

  @IsInt()
  @IsPositive()
  brandId: number;
}