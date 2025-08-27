export interface CreateBrandInput {
  nameEn: string;
  nameAr: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface UpdateBrandInput {
  id: number;
  nameEn?: string;
  nameAr?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface BrandOutput {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl: string;
  websiteUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListBrandsInput {
  page?: number;
  limit?: number;
  search?: string;
}
