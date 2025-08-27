import { DomainError } from './domain-error';

export class BeatNotFoundError extends DomainError {
  readonly code = 'BEAT_NOT_FOUND';
  
  constructor(id: number) {
    super(`Beat not found with ID: ${id}`);
  }
}

export class InvalidBeatStatusError extends DomainError {
  readonly code = 'INVALID_BEAT_STATUS';
  
  constructor(status: string) {
    super(`Invalid beat status: ${status}`);
  }
}
