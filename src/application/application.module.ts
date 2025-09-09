import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TOKENS } from '../infrastructure/common/tokens';

// Use Cases - Auth
import { LoginUseCase } from './use-cases/auth/login.usecase';
import { ValidateUserUseCase } from './use-cases/auth/validate-user.usecase';

// Use Cases - Users
import { CreateUserUseCase } from './use-cases/users/create-user.usecase';
import { ListUsersUseCase } from './use-cases/users/list-users.usecase';
import { UpdateUserUseCase } from './use-cases/users/update-user.usecase';
import { AssignRolesUseCase } from './use-cases/users/assign-roles.usecase';

// Use Cases - Beats
import { CreateBeatUseCase } from './use-cases/beats/create-beat.usecase';
import { ListBeatsUseCase } from './use-cases/beats/list-beats.usecase';
import { GetBeatUseCase } from './use-cases/beats/get-beat.usecase';
import { UpdateBeatUseCase } from './use-cases/beats/update-beat.usecase';
import { DeleteBeatUseCase } from './use-cases/beats/delete-beat.usecase';

// Use Cases - Brands
import { CreateBrandUseCase } from './use-cases/brands/create-brand.usecase';
import { ListBrandsUseCase } from './use-cases/brands/list-brands.usecase';
import { GetBrandUseCase } from './use-cases/brands/get-brand.usecase';
import { UpdateBrandUseCase } from './use-cases/brands/update-brand.usecase';
import { DeleteBrandUseCase } from './use-cases/brands/delete-brand.usecase';

// Use Cases - Influencers
import { CreateInfluencerUseCase } from './use-cases/influencers/create-influencer.usecase';
import { ListInfluencersUseCase } from './use-cases/influencers/list-influencers.usecase';
import { GetInfluencerUseCase } from './use-cases/influencers/get-influencer.usecase';
import { UpdateInfluencerUseCase } from './use-cases/influencers/update-influencer.usecase';
import { DeleteInfluencerUseCase } from './use-cases/influencers/delete-influencer.usecase';
import { ManageSocialPlatformUseCase } from './use-cases/influencers/manage-social-platform.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // Auth Use Cases
    {
      provide: TOKENS.LoginUseCase,
      useFactory: (usersRepo: any, rolesRepo: any, passwordHasher: any, tokenSigner: any) =>
        new LoginUseCase( usersRepo, rolesRepo, passwordHasher, tokenSigner),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo, TOKENS.PasswordHasher, TOKENS.TokenSigner],
    },
    {
      provide: TOKENS.ValidateUserUseCase,
      useFactory: (usersRepo: any, rolesRepo: any) => new ValidateUserUseCase(usersRepo, rolesRepo),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo],
    },
    
    // User Use Cases
    {
      provide: TOKENS.CreateUserUseCase,
      useFactory: (usersRepo: any, rolesRepo: any, userRolesRepo: any, passwordHasher: any) =>
        new CreateUserUseCase(usersRepo, rolesRepo, userRolesRepo, passwordHasher),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo, TOKENS.UserRolesRepo, TOKENS.PasswordHasher],
    },
    {
      provide: TOKENS.ListUsersUseCase,
      useFactory: (usersRepo: any, rolesRepo: any) => new ListUsersUseCase(usersRepo, rolesRepo),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo],
    },
    {
      provide: TOKENS.UpdateUserUseCase,
      useFactory: (usersRepo: any, rolesRepo: any) => new UpdateUserUseCase(usersRepo, rolesRepo),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo],
    },
    {
      provide: TOKENS.AssignRolesUseCase,
      useFactory: (usersRepo: any, rolesRepo: any) =>
        new AssignRolesUseCase(usersRepo, rolesRepo),
      inject: [TOKENS.UsersRepo, TOKENS.RolesRepo]
    },
    
    // Beat Use Cases
    {
      provide: TOKENS.CreateBeatUseCase,
      useFactory: (beatsRepo: any, influencersRepo: any, brandsRepo: any) =>
        new CreateBeatUseCase(beatsRepo, influencersRepo, brandsRepo),
      inject: [TOKENS.BeatsRepo, TOKENS.InfluencersRepo, TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.ListBeatsUseCase,
      useFactory: (beatsRepo: any) => new ListBeatsUseCase(beatsRepo),
      inject: [TOKENS.BeatsRepo],
    },
    {
      provide: TOKENS.GetBeatUseCase,
      useFactory: (beatsRepo: any) => new GetBeatUseCase(beatsRepo),
      inject: [TOKENS.BeatsRepo],
    },
    {
      provide: TOKENS.UpdateBeatUseCase,
      useFactory: (beatsRepo: any, influencersRepo: any, brandsRepo: any) =>
        new UpdateBeatUseCase(beatsRepo, influencersRepo, brandsRepo),
      inject: [TOKENS.BeatsRepo, TOKENS.InfluencersRepo, TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.DeleteBeatUseCase,
      useFactory: (beatsRepo: any) => new DeleteBeatUseCase(beatsRepo),
      inject: [TOKENS.BeatsRepo],
    },
    
    // Brand Use Cases
    {
      provide: TOKENS.CreateBrandUseCase,
      useFactory: (brandsRepo: any) => new CreateBrandUseCase(brandsRepo),
      inject: [TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.ListBrandsUseCase,
      useFactory: (brandsRepo: any) => new ListBrandsUseCase(brandsRepo),
      inject: [TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.GetBrandUseCase,
      useFactory: (brandsRepo: any) => new GetBrandUseCase(brandsRepo),
      inject: [TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.UpdateBrandUseCase,
      useFactory: (brandsRepo: any) => new UpdateBrandUseCase(brandsRepo),
      inject: [TOKENS.BrandsRepo],
    },
    {
      provide: TOKENS.DeleteBrandUseCase,
      useFactory: (brandsRepo: any, beatsRepo: any) => new DeleteBrandUseCase(brandsRepo, beatsRepo),
      inject: [TOKENS.BrandsRepo, TOKENS.BeatsRepo],
    },
    
    // Influencer Use Cases
    {
      provide: TOKENS.CreateInfluencerUseCase,
      useFactory: (influencersRepo: any, socialPlatformsRepo: any, activityLogger: any) =>
        new CreateInfluencerUseCase(influencersRepo, socialPlatformsRepo, activityLogger),
      inject: [TOKENS.InfluencersRepo, TOKENS.SocialPlatformsRepo, TOKENS.ActivityLogger],
    },
    {
      provide: TOKENS.ListInfluencersUseCase,
      useFactory: (influencersRepo: any) => new ListInfluencersUseCase(influencersRepo),
      inject: [TOKENS.InfluencersRepo],
    },
    {
      provide: TOKENS.GetInfluencerUseCase,
      useFactory: (influencersRepo: any) => new GetInfluencerUseCase(influencersRepo),
      inject: [TOKENS.InfluencersRepo],
    },
    {
      provide: TOKENS.UpdateInfluencerUseCase,
      useFactory: (influencersRepo: any, socialPlatformsRepo: any, activityLogger: any) => new UpdateInfluencerUseCase(influencersRepo, socialPlatformsRepo, activityLogger),
      inject: [TOKENS.InfluencersRepo, TOKENS.SocialPlatformsRepo, TOKENS.ActivityLogger],
    },
    {
      provide: TOKENS.DeleteInfluencerUseCase,
      useFactory: (influencersRepo: any, beatsRepo: any, activityLogger: any) => new DeleteInfluencerUseCase(influencersRepo, beatsRepo, activityLogger),
      inject: [TOKENS.InfluencersRepo, TOKENS.BeatsRepo, TOKENS.ActivityLogger],
    },
    {
      provide: TOKENS.ManageSocialPlatformUseCase,
      useFactory: (influencersRepo: any, socialPlatformsRepo: any) =>
        new ManageSocialPlatformUseCase(influencersRepo, socialPlatformsRepo),
      inject: [TOKENS.InfluencersRepo, TOKENS.SocialPlatformsRepo],
    },
  ],
  exports: [
    // Auth
    TOKENS.LoginUseCase,
    TOKENS.ValidateUserUseCase,
    
    // Users
    TOKENS.CreateUserUseCase,
    TOKENS.ListUsersUseCase,
    TOKENS.UpdateUserUseCase,
    TOKENS.AssignRolesUseCase,
    
    // Beats
    TOKENS.CreateBeatUseCase,
    TOKENS.ListBeatsUseCase,
    TOKENS.GetBeatUseCase,
    TOKENS.UpdateBeatUseCase,
    TOKENS.DeleteBeatUseCase,
    
    // Brands
    TOKENS.CreateBrandUseCase,
    TOKENS.ListBrandsUseCase,
    TOKENS.GetBrandUseCase,
    TOKENS.UpdateBrandUseCase,
    TOKENS.DeleteBrandUseCase,
    
    // Influencers
    TOKENS.CreateInfluencerUseCase,
    TOKENS.ListInfluencersUseCase,
    TOKENS.GetInfluencerUseCase,
    TOKENS.UpdateInfluencerUseCase,
    TOKENS.DeleteInfluencerUseCase,
    TOKENS.ManageSocialPlatformUseCase,
  ],
})
export class ApplicationModule {}
