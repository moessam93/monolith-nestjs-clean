import { SocialPlatform } from '../../../../domain/entities/social-platform';
import { BaseMapper } from './base.mapper';

export class SocialPlatformMapper {
  // Using generic methods for clean, DRY code
  static toDomain(prismaSocialPlatform: any): SocialPlatform {
    return BaseMapper.genericToDomain(
      SocialPlatform,
      prismaSocialPlatform,
      ['id', 'key', 'url', 'numberOfFollowers', 'influencerId', 'createdAt', 'updatedAt']
    );
  }

  static toPrisma(socialPlatform: SocialPlatform) {
    return BaseMapper.genericToPrisma(socialPlatform);
  }

  static toPrismaCreate(socialPlatform: SocialPlatform) {
    return BaseMapper.baseToPrismaCreate(socialPlatform, SocialPlatformMapper.toPrisma);
  }

  static toPrismaUpdate(socialPlatform: SocialPlatform) {
    return BaseMapper.baseToPrismaUpdate(socialPlatform, SocialPlatformMapper.toPrisma);
  }
}
