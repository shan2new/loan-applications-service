import { Request, Response, NextFunction } from 'express';

/**
 * Interface for authentication strategies
 * Allows different authentication mechanisms to be used interchangeably
 */
export interface IAuthStrategy {
  /**
   * The name of the authentication strategy
   */
  readonly name: string;

  /**
   * Authenticate a request
   * @param req The Express request
   * @param res The Express response
   * @param next The next middleware function
   */
  authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
