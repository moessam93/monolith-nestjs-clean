import { Injectable } from '@nestjs/common';
import { IUnitOfWork, IRepositories } from '../../../../domain/uow/unit-of-work';
import { PrismaService } from '../prisma.service';
import { PrismaUsersRepo } from '../repositories/prisma-users.repo';
import { PrismaRolesRepo } from '../repositories/prisma-roles.repo';
import { PrismaBeatsRepo } from '../repositories/prisma-beats.repo';
import { PrismaBrandsRepo } from '../repositories/prisma-brands.repo';
import { PrismaInfluencersRepo } from '../repositories/prisma-influencers.repo';
import { PrismaSocialPlatformsRepo } from '../repositories/prisma-social-platforms.repo';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: (repositories: IRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      // Create repository instances with transaction client
      const repositories: IRepositories = {
        users: new PrismaUsersRepo(tx as any),
        roles: new PrismaRolesRepo(tx as any),
        beats: new PrismaBeatsRepo(tx as any),
        brands: new PrismaBrandsRepo(tx as any),
        influencers: new PrismaInfluencersRepo(tx as any),
        socialPlatforms: new PrismaSocialPlatformsRepo(tx as any),
      };

      return work(repositories);
    });
  }
}
