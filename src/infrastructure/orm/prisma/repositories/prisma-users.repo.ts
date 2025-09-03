import { Injectable } from '@nestjs/common';
import { User } from '../../../../domain/entities/user';
import { PrismaService } from '../prisma.service';
import { UserMapper } from '../mappers/user.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaUsersRepo extends BasePrismaRepository<User, string, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user', UserMapper);
  }
}
