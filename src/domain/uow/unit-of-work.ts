import { IBaseRepository } from '../repositories/base-repo';
import { User } from '../entities/user';
import { Role } from '../entities/role';
import { Beat } from '../entities/beat';
import { Brand } from '../entities/brand';
import { Influencer } from '../entities/influencer';
import { SocialPlatform } from '../entities/social-platform';

export interface IRepositories {
  users: IBaseRepository<User, string>;
  roles: IBaseRepository<Role, number>;
  beats: IBaseRepository<Beat, number>;
  brands: IBaseRepository<Brand, number>;
  influencers: IBaseRepository<Influencer, number>;
  socialPlatforms: IBaseRepository<SocialPlatform, number>;
}

export interface IUnitOfWork {
  execute<T>(work: (repositories: IRepositories) => Promise<T>): Promise<T>;
}
