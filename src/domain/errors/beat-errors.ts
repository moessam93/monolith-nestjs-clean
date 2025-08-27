import { DomainError } from './domain-error';

export const BEAT_NOT_FOUND = 'BEAT_NOT_FOUND';
export const INVALID_BEAT_STATUS = 'INVALID_BEAT_STATUS';
export const BEAT_INFLUENCER_NOT_FOUND = 'BEAT_INFLUENCER_NOT_FOUND';
export const BEAT_BRAND_NOT_FOUND = 'BEAT_BRAND_NOT_FOUND';

export class BeatNotFoundError extends DomainError {
  readonly code = BEAT_NOT_FOUND;
  
  constructor(id: number) {
    super(`Beat not found with ID: ${id}`);
  }
}

export class InvalidBeatStatusError extends DomainError {
  readonly code = INVALID_BEAT_STATUS;
  
  constructor(status: string) {
    super(`Invalid beat status: ${status}`);
  }
}

export class BeatInfluencerNotFoundError extends DomainError {
  readonly code = BEAT_INFLUENCER_NOT_FOUND;
  
  constructor(influencerId: number) {
    super(`Influencer not found with ID: ${influencerId}`);
  }
}

export class BeatBrandNotFoundError extends DomainError {
  readonly code = BEAT_BRAND_NOT_FOUND;
  
  constructor(brandId: number) {
    super(`Brand not found with ID: ${brandId}`);
  }
}