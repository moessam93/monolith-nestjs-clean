import { Injectable } from '@nestjs/common';
import { SocialPlatform } from '../../../../domain/entities/social-platform';
import { PrismaService } from '../prisma.service';
import { SocialPlatformMapper } from '../mappers/social-platform.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaSocialPlatformsRepo extends BasePrismaRepository<SocialPlatform, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'socialPlatform', SocialPlatformMapper);
  }
}
