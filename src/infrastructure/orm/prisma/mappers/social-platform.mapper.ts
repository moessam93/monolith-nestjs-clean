import { SocialPlatform } from '../../../../domain/entities/social-platform';

export class SocialPlatformMapper {
  static toDomain(prismaSocialPlatform: any): SocialPlatform {
    return new SocialPlatform(
      prismaSocialPlatform.id,
      prismaSocialPlatform.key,
      prismaSocialPlatform.url,
      prismaSocialPlatform.numberOfFollowers,
      prismaSocialPlatform.influencerId,
      prismaSocialPlatform.createdAt,
      prismaSocialPlatform.updatedAt,
    );
  }

  static toPrisma(socialPlatform: SocialPlatform) {
    return {
      id: socialPlatform.id,
      key: socialPlatform.key,
      url: socialPlatform.url,
      numberOfFollowers: socialPlatform.numberOfFollowers,
      influencerId: socialPlatform.influencerId,
      createdAt: socialPlatform.createdAt,
      updatedAt: socialPlatform.updatedAt,
    };
  }

  static toPrismaCreate(socialPlatform: SocialPlatform) {
    const data = SocialPlatformMapper.toPrisma(socialPlatform);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    return data;
  }

  static toPrismaUpdate(socialPlatform: SocialPlatform) {
    const data = SocialPlatformMapper.toPrisma(socialPlatform);
    // Remove id and timestamps for updates
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    return data;
  }
}
