export const TOKENS = {
  // Repositories
  UsersRepo: Symbol('UsersRepo'),
  RolesRepo: Symbol('RolesRepo'),
  UserRolesRepo: Symbol('UserRolesRepo'),
  BeatsRepo: Symbol('BeatsRepo'),
  BrandsRepo: Symbol('BrandsRepo'),
  InfluencersRepo: Symbol('InfluencersRepo'),
  SocialPlatformsRepo: Symbol('SocialPlatformsRepo'),
  
  // Unit of Work
  UnitOfWork: Symbol('UnitOfWork'),
  
  // Ports
  PasswordHasher: Symbol('PasswordHasher'),
  TokenSigner: Symbol('TokenSigner'),
  Clock: Symbol('Clock'),
  ActivityLogger: Symbol('ActivityLogger'),

  // Use Cases - Auth
  LoginUseCase: Symbol('LoginUseCase'),
  ValidateUserUseCase: Symbol('ValidateUserUseCase'),
  
  // Use Cases - Users
  BootstrapFirstSuperAdminUseCase: Symbol('BootstrapFirstSuperAdminUseCase'),
  CreateUserUseCase: Symbol('CreateUserUseCase'),
  ListUsersUseCase: Symbol('ListUsersUseCase'),
  UpdateUserUseCase: Symbol('UpdateUserUseCase'),
  AssignRolesUseCase: Symbol('AssignRolesUseCase'),
  
  // Use Cases - Beats
  CreateBeatUseCase: Symbol('CreateBeatUseCase'),
  ListBeatsUseCase: Symbol('ListBeatsUseCase'),
  GetBeatUseCase: Symbol('GetBeatUseCase'),
  UpdateBeatUseCase: Symbol('UpdateBeatUseCase'),
  DeleteBeatUseCase: Symbol('DeleteBeatUseCase'),
  
  // Use Cases - Brands
  CreateBrandUseCase: Symbol('CreateBrandUseCase'),
  ListBrandsUseCase: Symbol('ListBrandsUseCase'),
  GetBrandUseCase: Symbol('GetBrandUseCase'),
  UpdateBrandUseCase: Symbol('UpdateBrandUseCase'),
  DeleteBrandUseCase: Symbol('DeleteBrandUseCase'),
  
  // Use Cases - Influencers
  CreateInfluencerUseCase: Symbol('CreateInfluencerUseCase'),
  ListInfluencersUseCase: Symbol('ListInfluencersUseCase'),
  GetInfluencerUseCase: Symbol('GetInfluencerUseCase'),
  UpdateInfluencerUseCase: Symbol('UpdateInfluencerUseCase'),
  DeleteInfluencerUseCase: Symbol('DeleteInfluencerUseCase'),
  ManageSocialPlatformUseCase: Symbol('ManageSocialPlatformUseCase'),
};
