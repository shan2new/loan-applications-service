import { Response } from 'express';
import { Logger } from 'pino';
import { ApplicationError } from './application-error';
import { ValidationError } from './validation-error';

/**
 * Centralized API error handling utility to ensure consistent error responses
 * across all controllers.
 */
export function handleApiError(error: Error, res: Response, logger: Logger): void {
  // Handle validation errors
  if (error instanceof ValidationError) {
    logger.warn({ errors: error.errors }, `Validation error: ${error.message}`);
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        errors: error.errors,
      },
    });
    return;
  }

  // Handle application errors (including domain errors)
  if (error instanceof ApplicationError) {
    logger.warn(`Application error: ${error.message}`);
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
    return;
  }

  // Handle unexpected errors
  logger.error({ error }, `Unexpected error: ${error.message}`);
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    },
  });
}
