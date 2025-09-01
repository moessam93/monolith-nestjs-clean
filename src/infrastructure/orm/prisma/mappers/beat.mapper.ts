import { Beat } from '../../../../domain/entities/beat';
import { BaseMapper } from './base.mapper';

export class BeatMapper {
  // Using generic methods for maximum code reuse
  static toDomain(prismaBeat: any): Beat {
    return BaseMapper.genericToDomain(
      Beat,
      prismaBeat,
      ['id', 'caption', 'mediaUrl', 'thumbnailUrl', 'statusKey', 'influencerId', 'brandId', 'createdAt', 'updatedAt']
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
