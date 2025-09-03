import { Beat } from '../../../../domain/entities/beat';
import { BaseMapper } from './base.mapper';
import { InfluencerMapper } from './influencer.mapper';
import { BrandMapper } from './brand.mapper';

export class BeatMapper {
  // Using generic methods for maximum code reuse
  static toDomain(prismaBeat: any): Beat {
    return BaseMapper.genericToDomainWithProcessors(
      Beat,
      prismaBeat,
      ['id', 'caption', 'mediaUrl', 'thumbnailUrl', 'statusKey', 'influencerId', 'brandId', 'createdAt', 'updatedAt', 'influencer', 'brand'],
      {
        influencer: (influencerData: any) => influencerData ? InfluencerMapper.toDomain(influencerData) : undefined,
        brand: (brandData: any) => brandData ? BrandMapper.toDomain(brandData) : undefined
      }
    );
  }

  static toPrisma(beat: Beat) {
    return BaseMapper.genericToPrisma(beat);
  }

  static toPrismaCreate(beat: Beat) {
    return BaseMapper.baseToPrismaCreate(beat, BeatMapper.toPrisma);
  }

  static toPrismaUpdate(beat: Beat) {
    return BaseMapper.baseToPrismaUpdate(beat, BeatMapper.toPrisma);
  }
}
