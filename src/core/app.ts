import 'reflect-metadata'; // Required for tsyringe
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger } from '@shared/logging/logger';
import { errorHandler } from '@shared/errors/error-middleware';
import { ModuleRegistry, IModule } from '@core/module';
import { PluginRegistry } from '@core/plugin';
import { env } from '@shared/config/env';
import { TokenAuthStrategy, AuthService, globalAuthMiddleware } from '@shared/auth';
import { container } from 'tsyringe';
import pinoHttp from 'pino-http';
import { healthCheckRouter } from '@shared/health/healthcheck';

const appLogger = createLogger('App');

/**
 * Application class responsible for setting up and configuring the Express application
 */
export class Application {
  private readonly app: Express;
  private readonly moduleRegistry: ModuleRegistry;
  private readonly pluginRegistry: PluginRegistry;

  constructor() {
    this.app = express();
    this.moduleRegistry = ModuleRegistry.getInstance();
    this.pluginRegistry = PluginRegistry.getInstance();

    // Register authentication services
    this.registerAuthServices();

    this.setupMiddleware();
  }

  /**
   * Register authentication services with the DI container
   */
  private registerAuthServices(): void {
    appLogger.info('Registering authentication services');

    // Register token authentication strategy
    container.register(TokenAuthStrategy, {
      useClass: TokenAuthStrategy,
    });

    // Register authentication service
    container.register(AuthService, {
      useClass: AuthService,
    });
  }

  /**
   * Set up Express middleware
   */
  private setupMiddleware(): void {
    appLogger.info('Setting up middleware');

    // Apply individual Helmet middlewares for clarity and control
    this.app.use(
      helmet.hsts({
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true, // Optional: if you want to submit your domain for HSTS preloading
      }),
    );
    // this.app.use(helmet.expectCt(...)); // ExpectCt removed for now due to type/version issues
    this.app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
    this.app.use(helmet.noSniff());
    this.app.use(helmet.dnsPrefetchControl({ allow: false }));
    this.app.use(helmet.frameguard({ action: 'deny' }));
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.ieNoOpen());
    this.app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));
    this.app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'none'"],
          connectSrc: ["'self'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
          imgSrc: ["'none'"],
          fontSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          childSrc: ["'none'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
        },
      }),
    );

    this.app.use(
      cors({
        origin: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        credentials: true,
        maxAge: 86400, // 24 hours
      }),
    ); // Enhanced CORS with explicit configuration

    // Request logging with auto-logging disabled
    this.app.use(
      pinoHttp({
        logger: appLogger,
        autoLogging: false,
        customLogLevel: function (_req, res, err) {
          if (res.statusCode >= 500 || err) {
            return 'error';
          } else if (res.statusCode >= 400) {
            return 'warn';
          }
          return 'info';
        },
      }),
    );

    // Parse JSON request bodies
    this.app.use(express.json());

    // Apply global authentication middleware
    this.app.use(globalAuthMiddleware);
  }

  /**
   * Register all modules
   * @param modules Modules to register
   */
  public registerModules(modules: Array<new () => IModule>): void {
    appLogger.info('Registering modules');

    for (const ModuleClass of modules) {
      const moduleInstance = new ModuleClass();
      this.moduleRegistry.registerModule(moduleInstance);
    }

    // Also register modules from plugins
    const pluginModules = this.pluginRegistry.getAllModules();
    for (const module of pluginModules) {
      this.moduleRegistry.registerModule(module);
    }
  }

  /**
   * Initialize the application
   */
  public async initialize(): Promise<void> {
    appLogger.info('Initializing application');

    // Register all module dependencies
    this.moduleRegistry.registerAllDependencies();

    // Register all module routes
    this.moduleRegistry.registerAllRoutes(this.app);

    // Initialize all modules
    await this.moduleRegistry.initializeAllModules();

    // Register the comprehensive health check router
    this.app.use(healthCheckRouter);

    // Catch-all middleware for undefined routes (404)
    this.app.use((req, res) => {
      res.statusCode = 404;
      res.json({
        error: {
          message: `Cannot ${req.method} ${req.path}`,
          help: 'API endpoints are prefixed with /api. Did you mean to use /api${req.path}?',
        },
      });
    });

    // Error handling middleware (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start the application
   */
  public start(): void {
    // PORT is already a number from the env validation
    const PORT = env.PORT;

    this.app.listen(PORT, () => {
      appLogger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', reason => {
      appLogger.error({ reason }, 'Unhandled Rejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      appLogger.fatal({ error }, 'Uncaught Exception');
      process.exit(1);
    });
  }

  /**
   * Get the Express application instance
   */
  public getExpressApp(): Express {
    return this.app;
  }
}
