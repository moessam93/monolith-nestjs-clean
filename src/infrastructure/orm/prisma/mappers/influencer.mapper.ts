import { Influencer } from '../../../../domain/entities/influencer';
import { SocialPlatformMapper } from './social-platform.mapper';
import { BaseMapper } from './base.mapper';

export class InfluencerMapper {
  static toDomain(prismaInfluencer: any): Influencer {
    return BaseMapper.genericToDomainWithProcessors(
      Influencer,
      prismaInfluencer,
      ['id', 'username', 'email', 'nameEn', 'nameAr', 'profilePictureUrl', 'socialPlatforms', 'createdAt', 'updatedAt'],
      {
        socialPlatforms: (socialPlatformsArray: any[]) => 
          (socialPlatformsArray ?? []).map((sp: any) => SocialPlatformMapper.toDomain(sp))
      }
    );
  }

  static toPrisma(influencer: Influencer) {
    // Use generic method, exclude socialPlatforms since they're stored separately
    return BaseMapper.genericToPrisma(influencer, ['socialPlatforms']);
  }

  static toPrismaCreate(influencer: Influencer) {
    return BaseMapper.baseToPrismaCreate(influencer, InfluencerMapper.toPrisma);
  }

  static toPrismaUpdate(influencer: Influencer) {
    return BaseMapper.baseToPrismaUpdate(influencer, InfluencerMapper.toPrisma);
  }
}
