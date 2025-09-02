import { Influencer } from '../entities/influencer';
import { IBaseRepository } from './base-repo';

export interface IInfluencersRepo extends IBaseRepository<Influencer, number> {
  list(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }): Promise<{ data: Influencer[]; total: number; totalFiltered: number }>;
}
