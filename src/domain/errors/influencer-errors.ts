import { DomainError } from './domain-error';

export const INFLUENCER_NOT_FOUND = 'INFLUENCER_NOT_FOUND';
export const INFLUENCER_USERNAME_ALREADY_EXISTS = 'INFLUENCER_USERNAME_ALREADY_EXISTS';
export const INFLUENCER_EMAIL_ALREADY_EXISTS = 'INFLUENCER_EMAIL_ALREADY_EXISTS';
export const EXISTING_SOCIAL_PLATFORM_FOR_INFLUENCER = 'EXISTING_SOCIAL_PLATFORM_FOR_INFLUENCER';
export const SOCIAL_PLATFORM_NOT_FOUND = 'SOCIAL_PLATFORM_NOT_FOUND';

export class InfluencerNotFoundError extends DomainError {
  readonly code = INFLUENCER_NOT_FOUND;

  constructor(id: number) {
    super(`Influencer not found with ID: ${id}`);
  }
}

export class InfluencerUsernameAlreadyExistsError extends DomainError {
  readonly code = INFLUENCER_USERNAME_ALREADY_EXISTS;

  constructor(name: string) {
    super(`Influencer username already exists: ${name}`);
  }
}

export class InfluencerEmailAlreadyExistsError extends DomainError {
  readonly code = INFLUENCER_EMAIL_ALREADY_EXISTS;

  constructor(email: string) {
    super(`Influencer email already exists: ${email}`);
  }
}

export class ExistingSocialPlatformForInfluencerError extends DomainError {
  readonly code = EXISTING_SOCIAL_PLATFORM_FOR_INFLUENCER;

  constructor(influencerId: number, key: string, url: string) {
    super(`Existing social platform for influencer with ID: ${influencerId} and key: ${key} and url: ${url} already exists`);
  }
}

export class SocialPlatformNotFoundError extends DomainError {
  readonly code = SOCIAL_PLATFORM_NOT_FOUND;

  constructor(influencerId: number, key: string) {
    super(`Social platform not found for influencer with ID: ${influencerId} and key: ${key}`);
  }
}