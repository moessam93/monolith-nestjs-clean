import { Beat } from '../../../../domain/entities/beat';

export class BeatMapper {
  static toDomain(prismaBeat: any): Beat {
    return new Beat(
      prismaBeat.id,
      prismaBeat.caption,
      prismaBeat.mediaUrl,
      prismaBeat.thumbnailUrl,
      prismaBeat.statusKey,
      prismaBeat.influencerId,
      prismaBeat.brandId,
      prismaBeat.createdAt,
      prismaBeat.updatedAt,
    );
  }

  static toPrisma(beat: Beat) {
    return {
      id: beat.id,
      caption: beat.caption,
      mediaUrl: beat.mediaUrl,
      thumbnailUrl: beat.thumbnailUrl,
      statusKey: beat.statusKey,
      influencerId: beat.influencerId,
      brandId: beat.brandId,
      createdAt: beat.createdAt,
      updatedAt: beat.updatedAt,
    };
  }

  static toPrismaCreate(beat: Beat) {
    const data = BeatMapper.toPrisma(beat);
    // Remove id for creation if it's 0 or undefined
    if (!data.id) {
      delete (data as any).id;
    }
    return data;
  }

  static toPrismaUpdate(beat: Beat) {
    const data = BeatMapper.toPrisma(beat);
    // Remove id and timestamps for updates
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    return data;
  }
}
