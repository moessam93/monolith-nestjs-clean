import { Beat } from '../entities/beat';

export interface IBeatsRepo {
  findById(id: number): Promise<Beat | null>;
  list(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    influencerId?: number;
    brandId?: number;
    statusKey?: string;
  }): Promise<{ data: Beat[]; total: number; totalFiltered: number }>;
  create(beat: Beat): Promise<Beat>;
  update(beat: Beat): Promise<Beat>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  countByInfluencer(influencerId: number): Promise<number>;
  countByBrand(brandId: number): Promise<number>;
}
