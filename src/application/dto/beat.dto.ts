export interface CreateBeatInput {
  caption?: string;
  mediaUrl: string;
  thumbnailUrl: string;
  statusKey: string;
  influencerId: number;
  brandId: number;
}

export interface UpdateBeatInput {
  id: number;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  statusKey?: string;
  influencerId?: number;
  brandId?: number;
}

export interface BeatOutput {
  id: number;
  caption?: string;
  mediaUrl: string;
  thumbnailUrl: string;
  statusKey: string;
  influencer: BeatInfluencerOutput;
  brand: BeatBrandOutput;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListBeatsInput {
  page?: number;
  limit?: number;
  search?: string;
  influencerId?: number;
  brandId?: number;
  statusKey?: string;
}

export interface BeatInfluencerOutput {
  id: number;
  username: string;
  nameEn: string;
  nameAr: string;
  profilePictureUrl: string;
}

export interface BeatBrandOutput {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl: string;
  websiteUrl: string;
}
