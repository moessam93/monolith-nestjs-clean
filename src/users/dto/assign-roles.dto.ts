import { IsArray, IsString, IsIn } from 'class-validator';
import { ROLE_KEYS } from '../../common/constants/roles';

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  @IsIn(ROLE_KEYS, { each: true })
  roleKeys: string[];
}
