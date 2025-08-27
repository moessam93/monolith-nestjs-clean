import { Influencer } from '../entities/influencer';

export interface IInfluencersRepo {
  findById(id: number): Promise<Influencer | null>;
  findByUsername(username: string): Promise<Influencer | null>;
  findByEmail(email: string): Promise<Influencer | null>;
  list(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }): Promise<{ data: Influencer[]; total: number; totalFiltered: number }>;
  create(influencer: Influencer): Promise<Influencer>;
  update(influencer: Influencer): Promise<Influencer>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
