import 'reflect-metadata'; // Required for tsyringe
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createLogger } from '@shared/logging/logger';
import { errorHandler } from '@shared/errors/error-middleware';
import { ModuleRegistry, IModule } from '@core/module';
import { PluginRegistry } from '@core/plugin';
import { env } from '@shared/config/env';
import { globalAuthMiddleware } from '@shared/auth';
import { container } from 'tsyringe';
import { TokenAuthStrategy, AuthService } from '@shared/auth';
import pinoHttp from 'pino-http';

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

    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
          },
        },
        xssFilter: true,
        hidePoweredBy: true,
        frameguard: { action: 'deny' },
        noSniff: true,
      }),
    ); // Add security headers with strict CSP

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

    // Global rate limiting
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // Limit each IP to 100 requests per window
      standardHeaders: 'draft-7', // Use the draft 7 standard headers
      legacyHeaders: false, // Disable legacy headers
      message: { error: { message: 'Too many requests, please try again later.' } },
      keyGenerator: req => req.ip || 'unknown', // Use IP for rate limiting
    });
    this.app.use(globalLimiter);

    // Stricter rate limiting for authentication endpoints
    const authLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      limit: 5, // 5 requests per hour
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { message: 'Too many authentication attempts, please try again later.' } },
      skipSuccessfulRequests: false, // Count successful attempts too
    });
    this.app.use('/api/auth', authLimiter);

    // Request logging with auto-logging disabled
    this.app.use(
      pinoHttp({
        logger: appLogger,
        autoLogging: false, // Disable automatic request/response logging
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

    // Add health check endpoint
    this.app.get('/health', (_req, res) => {
      res.statusCode = 200;
      res.json({ status: 'healthy' });
    });

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
    const PORT = parseInt(env.PORT, 10);

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
