// Base application error class
export class ApplicationError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error
export class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Bad request error
export class BadRequestError extends ApplicationError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

// Customer not found (validation) error - for test compatibility
export class CustomerNotFoundError extends ApplicationError {
  constructor(message = 'Customer not found') {
    super(message, 400);
  }
}

// Unauthorized error
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// Forbidden error
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// Conflict error
export class ConflictError extends ApplicationError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

// Internal server error
export class InternalServerError extends ApplicationError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}
