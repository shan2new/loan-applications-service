import { Express } from 'express';
import { DependencyContainer } from 'tsyringe';
import { IModule } from './module.interface';
import { createLogger } from '@shared/logging/logger';

/**
 * Abstract base class for all modules to extend
 * Provides common functionality and enforces the module contract
 */
export abstract class BaseModule implements IModule {
  protected logger = createLogger(this.constructor.name);

  /**
   * The name of the module
   */
  abstract readonly name: string;

  /**
   * Register the module's dependencies with the DI container
   * @param container The DI container to register with
   */
  abstract registerDependencies(container: DependencyContainer): void;

  /**
   * Register the module's routes with the Express application
   * @param app The Express application
   */
  abstract registerRoutes(app: Express): void;

  /**
   * Initialize the module (runs after dependencies and routes are registered)
   * Default implementation is a no-op
   */
  async initialize(): Promise<void> {
    this.logger.debug(`Initializing ${this.name} module`);
    // Default implementation does nothing
  }
}
