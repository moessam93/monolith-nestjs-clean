import { SocialPlatform } from '../entities/social-platform';

export interface ISocialPlatformsRepo {
  findById(id: number): Promise<SocialPlatform | null>;
  findByInfluencerId(influencerId: number): Promise<SocialPlatform[]>;
  findByInfluencerAndKey(influencerId: number, key: string): Promise<SocialPlatform | null>;
  create(socialPlatform: SocialPlatform): Promise<SocialPlatform>;
  update(socialPlatform: SocialPlatform): Promise<SocialPlatform>;
  delete(id: number): Promise<void>;
  deleteByInfluencerAndKey(influencerId: number, key: string): Promise<void>;
  exists(id: number): Promise<boolean>;
}
