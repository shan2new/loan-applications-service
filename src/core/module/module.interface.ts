import { Express } from 'express';
import { DependencyContainer } from 'tsyringe';

/**
 * Interface for all application modules to implement
 * This enables a plugin-based architecture where modules can be registered dynamically
 */
export interface IModule {
  /**
   * The name of the module
   */
  readonly name: string;

  /**
   * Register the module's dependencies with the DI container
   * @param container The DI container to register with
   */
  registerDependencies(container: DependencyContainer): void;

  /**
   * Register the module's routes with the Express application
   * @param app The Express application
   */
  registerRoutes(app: Express): void;

  /**
   * Initialize the module (runs after dependencies and routes are registered)
   */
  initialize(): Promise<void>;
}
