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
}
