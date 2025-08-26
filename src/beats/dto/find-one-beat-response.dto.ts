import { Influencer } from '../../influencers/entities/influencer.entity';
import { Brand } from '../../brands/entities/brand.entity';

export class FindOneBeatResponseDto {
  id: number;
  caption: string | null;
  mediaUrl: string;
  thumbnailUrl: string;
  statusKey: string;
  createdAt: Date;
  updatedAt: Date;
  influencer: Influencer;
  brand: Brand;

  constructor(data: any) {
    this.id = data.id;
    this.caption = data.caption;
    this.mediaUrl = data.mediaUrl;
    this.thumbnailUrl = data.thumbnailUrl;
    this.statusKey = data.statusKey;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.influencer = data.influencer;
    this.brand = data.brand;
  }

  static fromBeats(beats: any[]): FindOneBeatResponseDto[] {
    return beats.map(beat => new FindOneBeatResponseDto(beat));
  }

  static fromBeat(beat: any): FindOneBeatResponseDto {
    return new FindOneBeatResponseDto(beat);
  }
}
