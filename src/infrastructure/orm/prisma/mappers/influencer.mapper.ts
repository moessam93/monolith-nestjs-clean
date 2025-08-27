import { Influencer } from '../../../../domain/entities/influencer';
import { SocialPlatformMapper } from './social-platform.mapper';

export class InfluencerMapper {
  static toDomain(prismaInfluencer: any): Influencer {
    const socialPlatforms = (prismaInfluencer.socialPlatforms ?? [])
      .map((sp: any) => SocialPlatformMapper.toDomain(sp));

    return new Influencer(
      prismaInfluencer.id,
      prismaInfluencer.username,
      prismaInfluencer.email,
      prismaInfluencer.nameEn,
      prismaInfluencer.nameAr,
      prismaInfluencer.profilePictureUrl,
      socialPlatforms,
      prismaInfluencer.createdAt,
      prismaInfluencer.updatedAt,
    );
  }

  static toPrisma(influencer: Influencer) {
    return {
      id: influencer.id,
      username: influencer.username,
      email: influencer.email,
      nameEn: influencer.nameEn,
      nameAr: influencer.nameAr,
      profilePictureUrl: influencer.profilePictureUrl,
      createdAt: influencer.createdAt,
      updatedAt: influencer.updatedAt,
    };
  }

  static toPrismaCreate(influencer: Influencer) {
    const data = InfluencerMapper.toPrisma(influencer);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    return data;
  }

  static toPrismaUpdate(influencer: Influencer) {
    const data = InfluencerMapper.toPrisma(influencer);
    // Remove id and timestamps for updates
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    return data;
  }
}
