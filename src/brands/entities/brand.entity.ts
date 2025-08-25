import { Beat } from '../../beats/entities/beat.entity';

export class Brand {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl: string;
  websiteUrl: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  beats?: Beat[];
}
