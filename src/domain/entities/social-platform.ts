export class SocialPlatform {
  constructor(
    public readonly id: number,
    public readonly key: string, // instagram, tiktok, snapchat, youtube, facebook, twitter
    public url: string,
    public numberOfFollowers: number,
    public readonly influencerId: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  updateUrl(url: string): void {
    this.url = url;
  }

  updateFollowers(numberOfFollowers: number): void {
    if (numberOfFollowers < 0) {
      throw new Error('Number of followers cannot be negative');
    }
    this.numberOfFollowers = numberOfFollowers;
  }

  isInstagram(): boolean {
    return this.key === 'instagram';
  }

  isTikTok(): boolean {
    return this.key === 'tiktok';
  }

  isYouTube(): boolean {
    return this.key === 'youtube';
  }
}
