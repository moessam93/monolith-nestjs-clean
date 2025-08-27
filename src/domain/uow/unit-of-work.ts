import { IUsersRepo } from '../repositories/users-repo';
import { IRolesRepo } from '../repositories/roles-repo';
import { IBeatsRepo } from '../repositories/beats-repo';
import { IBrandsRepo } from '../repositories/brands-repo';
import { IInfluencersRepo } from '../repositories/influencers-repo';
import { ISocialPlatformsRepo } from '../repositories/social-platforms-repo';

export interface IRepositories {
  users: IUsersRepo;
  roles: IRolesRepo;
  beats: IBeatsRepo;
  brands: IBrandsRepo;
  influencers: IInfluencersRepo;
  socialPlatforms: ISocialPlatformsRepo;
}

export interface IUnitOfWork {
  execute<T>(work: (repositories: IRepositories) => Promise<T>): Promise<T>;
}
