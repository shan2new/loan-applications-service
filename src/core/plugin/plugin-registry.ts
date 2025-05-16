import { DependencyContainer } from 'tsyringe';
import { Express } from 'express';
import { IModule } from '@core/module';
import { createLogger } from '@shared/logging/logger';

const logger = createLogger('ModulePlugin');

/**
 * Plugin registration options
 */
export interface PluginOptions {
  /**
   * The name of the plugin
   */
  name: string;

  /**
   * Optional description of the plugin
   */
  description?: string;

  /**
   * The version of the plugin
   */
  version: string;

  /**
   * The author of the plugin
   */
  author?: string;
}

/**
 * A plugin function that registers a module
 */
export type PluginFunction = (options: PluginOptions) => IModule;

/**
 * Plugin registry for dynamically loading modules
 */
export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, { options: PluginOptions; module: IModule }> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of the PluginRegistry
   */
  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Register a plugin
   * @param pluginFunction The plugin function
   * @param options The plugin options
   */
  public registerPlugin(pluginFunction: PluginFunction, options: PluginOptions): void {
    if (this.plugins.has(options.name)) {
      logger.warn({ pluginName: options.name }, 'Plugin already registered');
      return;
    }

    logger.info({ pluginName: options.name }, 'Registering plugin');
    const module = pluginFunction(options);
    this.plugins.set(options.name, { options, module });
  }

  /**
   * Get all registered modules from plugins
   */
  public getAllModules(): IModule[] {
    return Array.from(this.plugins.values()).map(plugin => plugin.module);
  }

  /**
   * Get a plugin by name
   * @param name The name of the plugin
   */
  public getPlugin(name: string): { options: PluginOptions; module: IModule } | undefined {
    return this.plugins.get(name);
  }

  /**
   * Register all plugin dependencies with the DI container
   * @param container The DI container
   */
  public registerAllDependencies(container: DependencyContainer): void {
    for (const plugin of this.plugins.values()) {
      logger.debug({ pluginName: plugin.options.name }, 'Registering plugin dependencies');
      plugin.module.registerDependencies(container);
    }
  }

  /**
   * Register all plugin routes with the Express application
   * @param app The Express application
   */
  public registerAllRoutes(app: Express): void {
    for (const plugin of this.plugins.values()) {
      logger.debug({ pluginName: plugin.options.name }, 'Registering plugin routes');
      plugin.module.registerRoutes(app);
    }
  }

  /**
   * Initialize all plugins
   */
  public async initializeAllPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      logger.debug({ pluginName: plugin.options.name }, 'Initializing plugin');
      await plugin.module.initialize();
    }
  }
}

/**
 * Helper function to create and register a plugin
 * @param pluginFunction The plugin function
 * @param options The plugin options
 */
export function createPlugin(pluginFunction: PluginFunction, options: PluginOptions): void {
  PluginRegistry.getInstance().registerPlugin(pluginFunction, options);
}
