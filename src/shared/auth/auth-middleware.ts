import { Request, Response, NextFunction } from 'express';
import { getAuthService } from './auth-service';

/**
 * Middleware to protect routes with authentication
 * @param strategyName Optional name of the authentication strategy to use (defaults to the default strategy)
 */
export function authenticate(strategyName?: string) {
  const authService = getAuthService();
  return authService.createAuthMiddleware(strategyName);
}

/**
 * Apply authentication to all routes in a router
 * This bypasses public routes like health checks
 * @param req The Express request
 * @param res The Express response
 * @param next The next middleware function
 */
export function globalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // List of paths that don't require authentication
  const publicPaths = ['/health', '/api/health'];

  // Skip authentication for public paths
  if (publicPaths.some(path => req.path === path)) {
    return next();
  }

  // Apply authentication for all other paths
  authenticate()(req, res, next);
}
