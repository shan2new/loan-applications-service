import { BadRequestError, NotFoundError, ConflictError } from './application-error';

/**
 * Domain-specific error classes
 * These provide more semantic error types for specific domain errors
 */

/**
 * Customer domain errors
 */
export class InvalidEmailError extends BadRequestError {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}

export class InvalidNameError extends BadRequestError {
  constructor(message = 'Invalid name format') {
    super(message);
  }
}

export class CustomerNotFoundByIdError extends NotFoundError {
  constructor(id: string) {
    super(`Customer with ID ${id} not found`);
  }
}

export class CustomerNotFoundByEmailError extends NotFoundError {
  constructor(email: string) {
    super(`Customer with email ${email} not found`);
  }
}

export class CustomerAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Customer with email ${email} already exists`);
  }
}

/**
 * Loan application domain errors
 */
export class InvalidLoanAmountError extends BadRequestError {
  constructor(amount: number) {
    super(`Invalid loan amount: ${amount}`);
  }
}

export class InvalidTermError extends BadRequestError {
  constructor(term: number) {
    super(`Invalid loan term: ${term} months`);
  }
}

export class InvalidInterestRateError extends BadRequestError {
  constructor(rate: number) {
    super(`Invalid interest rate: ${rate}%`);
  }
}

export class LoanApplicationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Loan application with ID ${id} not found`);
  }
}

export class InvalidIdError extends BadRequestError {
  constructor(message = 'Invalid ID format') {
    super(message);
  }
}
