import { container, DependencyContainer } from 'tsyringe';
import { Express } from 'express';
import { IModule } from './module.interface';
import { createLogger } from '@shared/logging/logger';

/**
 * Registry for managing modules in the application
 * Handles registration, initialization, and retrieval of modules
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, IModule> = new Map();
  private logger = createLogger('ModuleRegistry');
  private diContainer: DependencyContainer;

  private constructor() {
    this.diContainer = container;
  }

  /**
   * Get the singleton instance of the ModuleRegistry
   */
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Register a module with the registry
   * @param module The module to register
   */
  public registerModule(module: IModule): void {
    if (this.modules.has(module.name)) {
      this.logger.warn({ moduleName: module.name }, 'Module already registered');
      return;
    }

    this.logger.info({ moduleName: module.name }, 'Registering module');
    this.modules.set(module.name, module);
  }

  /**
   * Get a module by name
   * @param name The name of the module
   */
  public getModule<T extends IModule>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  /**
   * Get all registered modules
   */
  public getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Register all module dependencies with the DI container
   */
  public registerAllDependencies(): void {
    this.logger.info('Registering all module dependencies');
    for (const module of this.modules.values()) {
      this.logger.debug({ moduleName: module.name }, 'Registering module dependencies');
      module.registerDependencies(this.diContainer);
    }
  }

  /**
   * Register all module routes with the Express application
   * @param app The Express application
   */
  public registerAllRoutes(app: Express): void {
    this.logger.info('Registering all module routes');
    for (const module of this.modules.values()) {
      this.logger.debug({ moduleName: module.name }, 'Registering module routes');
      module.registerRoutes(app);
    }
  }

  /**
   * Initialize all modules
   */
  public async initializeAllModules(): Promise<void> {
    this.logger.info('Initializing all modules');
    for (const module of this.modules.values()) {
      this.logger.debug({ moduleName: module.name }, 'Initializing module');
      await module.initialize();
    }
  }

  /**
   * Get the DI container
   */
  public getContainer(): DependencyContainer {
    return this.diContainer;
  }
}
