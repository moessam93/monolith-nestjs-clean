import { Injectable } from '@nestjs/common';
import { Role } from '../../../../domain/entities/role';
import { PrismaService } from '../prisma.service';
import { RoleMapper } from '../mappers/role.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaRolesRepo extends BasePrismaRepository<Role, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'role', RoleMapper);
  }
}
