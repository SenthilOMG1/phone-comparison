/**
 * Domain-specific error classes
 * Helps distinguish business rule violations from technical errors
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
  }
}

export class BusinessRuleViolation extends DomainError {
  constructor(
    message: string,
    public readonly rule: string
  ) {
    super(message);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityType: string,
    public readonly id: string
  ) {
    super(`${entityType} with id ${id} not found`);
  }
}

export class InvalidOperationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
