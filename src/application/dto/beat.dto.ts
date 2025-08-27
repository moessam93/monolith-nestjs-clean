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
  influencerId: number;
  brandId: number;
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
