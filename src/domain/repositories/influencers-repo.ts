import { Influencer } from '../entities/influencer';
import { IBaseRepository } from './base-repo';

export interface IInfluencersRepo extends IBaseRepository<Influencer, number> {
  }
