import { BadRequestError } from './application-error';
import { ZodIssue } from 'zod';

export class ValidationError extends BadRequestError {
  public readonly errors: ZodIssue[];

  constructor(message = 'Validation failed', errors: ZodIssue[]) {
    super(message);
    this.errors = errors;
  }
}
