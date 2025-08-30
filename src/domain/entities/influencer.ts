import { SocialPlatform } from './social-platform';

export class Influencer {
  constructor(
    public readonly id: number,
    public username: string,
    public email: string,
    public nameEn: string,
    public nameAr: string,
    public profilePictureUrl: string,
    public socialPlatforms: SocialPlatform[] = [],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
