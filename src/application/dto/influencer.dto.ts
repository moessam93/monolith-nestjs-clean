export interface CreateInfluencerInput {
  username: string;
  email: string;
  nameEn: string;
  nameAr: string;
  profilePictureUrl: string;
  socialPlatforms?: CreateSocialPlatformInput[];
}

export interface UpdateInfluencerInput {
  id: number;
  username?: string;
  email?: string;
  nameEn?: string;
  nameAr?: string;
  profilePictureUrl?: string;
}

export interface InfluencerOutput {
  id: number;
  username: string;
  email: string;
  nameEn: string;
  nameAr: string;
  profilePictureUrl: string;
  socialPlatforms: SocialPlatformOutput[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPlatformOutput {
  id: number;
  key: string;
  url: string;
  numberOfFollowers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocialPlatformInput {
  key: string; // instagram, tiktok, snapchat, youtube, facebook, twitter
  url: string;
  numberOfFollowers: number;
}

export interface UpdateSocialPlatformInput {
  influencerId: number;
  key: string;
  url?: string;
  numberOfFollowers?: number;
}

export interface ListInfluencersInput {
  page?: number;
  limit?: number;
  search?: string;
}
