import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { IAuthStrategy } from './auth-strategy.interface';
import { createLogger } from '@shared/logging/logger';
import { UnauthorizedError } from '@shared/errors/application-error';
import { env } from '@shared/config/env';

@injectable()
export class TokenAuthStrategy implements IAuthStrategy {
  readonly name = 'token';
  private readonly logger = createLogger('TokenAuthStrategy');
  private readonly tokenHeader = 'x-access-token';

  /**
   * Authenticate a request using a token-based authentication strategy
   * Uses environment variable API_ACCESS_TOKEN for validation
   */
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers[this.tokenHeader] as string;

      if (!token) {
        this.logger.warn({ ip: req.ip }, 'Missing authentication token');
        throw new UnauthorizedError('Authentication token is required');
      }

      if (token !== env.API_ACCESS_TOKEN) {
        this.logger.warn({ ip: req.ip }, 'Invalid authentication token');
        throw new UnauthorizedError('Invalid authentication token');
      }

      // If token is valid, continue to the next middleware
      next();
    } catch (error) {
      next(error);
    }
  }
}
