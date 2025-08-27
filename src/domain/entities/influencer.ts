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

  updateUsername(username: string): void {
    this.username = username;
  }

  updateEmail(email: string): void {
    this.email = email;
  }

  updateNames(nameEn: string, nameAr: string): void {
    this.nameEn = nameEn;
    this.nameAr = nameAr;
  }

  updateProfilePicture(profilePictureUrl: string): void {
    this.profilePictureUrl = profilePictureUrl;
  }

  addSocialPlatform(platform: SocialPlatform): void {
    // Remove existing platform of same key first
    this.socialPlatforms = this.socialPlatforms.filter(p => p.key !== platform.key);
    this.socialPlatforms.push(platform);
  }

  removeSocialPlatform(platformKey: string): void {
    this.socialPlatforms = this.socialPlatforms.filter(p => p.key !== platformKey);
  }

  getSocialPlatform(platformKey: string): SocialPlatform | undefined {
    return this.socialPlatforms.find(p => p.key === platformKey);
  }

  getTotalFollowers(): number {
    return this.socialPlatforms.reduce((total, platform) => total + platform.numberOfFollowers, 0);
  }
}
