import { DomainError } from './domain-error';

export const BRAND_NOT_FOUND = 'BRAND_NOT_FOUND';
export const BRAND_NAME_ALREADY_EXISTS = 'BRAND_NAME_ALREADY_EXISTS';
export const BRAND_HAS_BEATS = 'BRAND_HAS_BEATS';

export class BrandNotFoundError extends DomainError {
  readonly code = BRAND_NOT_FOUND;
  
  constructor(id: number) {
    super(`Brand not found with ID: ${id}`);
  }
}

export class BrandNameAlreadyExistsError extends DomainError {
  readonly code = BRAND_NAME_ALREADY_EXISTS;
  
  constructor(name: string) {
    super(`Brand name already exists: ${name}`);
  }
}

export class BrandHasBeatsError extends DomainError {
  readonly code = BRAND_HAS_BEATS;
  
  constructor(brandId: number) {
    super(`Brand has beats: ${brandId}`);
  }
}
