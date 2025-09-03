import { Injectable } from '@nestjs/common';
import { Beat } from '../../../../domain/entities/beat';
import { PrismaService } from '../prisma.service';
import { BeatMapper } from '../mappers/beat.mapper';
import { BasePrismaRepository } from './base-prisma.repo';

@Injectable()
export class PrismaBeatsRepo extends BasePrismaRepository<Beat, number, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'beat', BeatMapper);
  }
}
