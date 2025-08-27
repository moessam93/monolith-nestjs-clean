import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumberCountryCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleKeys?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumberCountryCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleKeys?: string[];
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleKeys: string[];
}
