import { Brand } from '../entities/brand';

export interface IBrandsRepo {
  findById(id: number): Promise<Brand | null>;
  list(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }): Promise<{ data: Brand[]; total: number; totalFiltered: number }>;
  create(brand: Brand): Promise<Brand>;
  update(brand: Brand): Promise<Brand>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByName(nameEn?: string, nameAr?: string): Promise<Brand[]>;
}
