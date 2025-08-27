export abstract class DomainError extends Error {
  abstract readonly code: string;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}
