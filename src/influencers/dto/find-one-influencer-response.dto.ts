import { SocialPlatform } from '../entities/social-platform.entity';

export class FindOneInfluencerResponseDto {
  id: number;
  username: string;
  email: string;
  nameEn: string;
  nameAr: string;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
  socialPlatforms: SocialPlatform[];

  constructor(data: any) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.nameEn = data.nameEn;
    this.nameAr = data.nameAr;
    this.profilePictureUrl = data.profilePictureUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.socialPlatforms = data.socialPlatforms || [];
  }

  static fromInfluencers(influencers: any[]): FindOneInfluencerResponseDto[] {
    return influencers.map(influencer => new FindOneInfluencerResponseDto(influencer));
  }

  static fromInfluencer(influencer: any): FindOneInfluencerResponseDto {
    return new FindOneInfluencerResponseDto(influencer);
  }
}
