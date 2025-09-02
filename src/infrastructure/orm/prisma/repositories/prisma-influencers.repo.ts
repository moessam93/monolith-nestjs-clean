import { Injectable } from '@nestjs/common';
import { Influencer } from '../../../../domain/entities/influencer';
import { PrismaService } from '../prisma.service';
import { InfluencerMapper } from '../mappers/influencer.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaInfluencersRepo extends BasePrismaRepository<Influencer, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'influencer', InfluencerMapper);
  }
}
