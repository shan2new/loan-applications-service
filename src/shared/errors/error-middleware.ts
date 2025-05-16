import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../errors/application-error';
import { ValidationError } from '../errors/validation-error';
import { createLogger } from '../logging/logger';

const logger = createLogger('ErrorMiddleware');

/**
 * Error handling middleware for Express
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    logger.warn({ path: req.path, errors: err.errors }, `Validation error: ${err.message}`);
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        errors: err.errors,
      },
    });
    return;
  }

  if (err instanceof ApplicationError) {
    logger.warn({ path: req.path }, `Application error: ${err.message}`);
    res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
    return;
  }

  // Unhandled error
  logger.error({ err, path: req.path }, `Unhandled error: ${err.message}`);
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
