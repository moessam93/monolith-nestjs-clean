import { Influencer } from '../../influencers/entities/influencer.entity';
import { Brand } from '../../brands/entities/brand.entity';

export class Beat {
  id: number;
  caption?: string;
  mediaUrl: string;
  thumbnailUrl: string;
  statusKey: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Foreign Keys
  influencerId: number;
  brandId: number;
  
  // Relationships
  influencer?: Influencer;
  brand?: Brand;
}
