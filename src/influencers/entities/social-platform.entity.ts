import { Influencer } from './influencer.entity';

export class SocialPlatform {
  id: number;
  key: string; // instagram, tiktok, snapchat, youtube, facebook, twitter
  url: string;
  numberOfFollowers: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Foreign Key
  influencerId: number;
  
  // Relationships
  influencer?: Influencer;
}
