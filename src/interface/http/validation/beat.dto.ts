import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

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

  @IsNumber()
  influencerId: number;

  @IsNumber()
  brandId: number;
}

export class UpdateBeatDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  statusKey?: string;
}