import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, IsIn } from 'class-validator';
import { ROLE_KEYS } from '../../common/constants/roles';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumberCountryCode?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(ROLE_KEYS, { each: true })
  roleKeys?: string[];
}
