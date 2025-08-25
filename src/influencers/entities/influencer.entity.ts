import { Beat } from '../../beats/entities/beat.entity';
import { SocialPlatform } from './social-platform.entity';

export class Influencer {
  id: number;
  username: string;
  email: string;
  nameEn: string;
  nameAr: string;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  beats?: Beat[];
  socialPlatforms?: SocialPlatform[];
}