import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../../domain/entities/user-role';
import { PrismaService } from '../prisma.service';
import { UserRolesMapper } from '../mappers/userroles.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaUserRolesRepo extends BasePrismaRepository<UserRole, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'userRole', UserRolesMapper);
  }
}
