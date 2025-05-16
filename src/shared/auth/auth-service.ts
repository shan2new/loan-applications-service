import { injectable, inject, container } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IAuthStrategy } from './auth-strategy.interface';
import { TokenAuthStrategy } from './token-auth-strategy';
import { createLogger } from '@shared/logging/logger';

@injectable()
export class AuthService {
  private readonly logger = createLogger('AuthService');
  private readonly strategies: Map<string, IAuthStrategy> = new Map();
  private defaultStrategy: string | null = null;

  constructor(@inject(TokenAuthStrategy) tokenStrategy: TokenAuthStrategy) {
    this.registerStrategy(tokenStrategy);
    this.setDefaultStrategy(tokenStrategy.name);
  }

  /**
   * Register an authentication strategy
   * @param strategy The authentication strategy to register
   */
  public registerStrategy(strategy: IAuthStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.logger.info(`Registered authentication strategy: ${strategy.name}`);
  }

  /**
   * Set the default authentication strategy
   * @param strategyName The name of the strategy to use as default
   */
  public setDefaultStrategy(strategyName: string): void {
    if (!this.strategies.has(strategyName)) {
      throw new Error(`Authentication strategy '${strategyName}' is not registered`);
    }
    this.defaultStrategy = strategyName;
    this.logger.info(`Set default authentication strategy to: ${strategyName}`);
  }

  /**
   * Get an authentication strategy by name
   * @param strategyName The name of the strategy to get
   */
  public getStrategy(strategyName?: string): IAuthStrategy {
    const name = strategyName || this.defaultStrategy;

    if (!name) {
      throw new Error('No authentication strategy specified and no default strategy set');
    }

    const strategy = this.strategies.get(name);

    if (!strategy) {
      throw new Error(`Authentication strategy '${name}' is not registered`);
    }

    return strategy;
  }

  /**
   * Create a middleware function that uses a specific authentication strategy
   * @param strategyName Optional name of the strategy to use (defaults to the default strategy)
   */
  public createAuthMiddleware(strategyName?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const strategy = this.getStrategy(strategyName);
        await strategy.authenticate(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
}

/**
 * Get the singleton instance of the AuthService
 */
export function getAuthService(): AuthService {
  return container.resolve(AuthService);
}
