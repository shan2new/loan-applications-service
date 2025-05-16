import { Express, Router } from 'express';
import { injectable } from 'tsyringe';
import { BaseModule } from '@core/module';

/**
 * Example Credit Card Module
 * This demonstrates how a new module can be added to the system using the plugin architecture
 */
@injectable()
export class CreditCardModule extends BaseModule {
  readonly name = 'credit-card';

  // The parameter is required by the interface but not used in this implementation
  registerDependencies(/* container */): void {
    this.logger.info('Registering Credit Card module dependencies');

    // Register repositories, services, and controllers for the credit card module
    // Example code would be added here when implementing this module
  }

  registerRoutes(app: Express): void {
    this.logger.info('Registering Credit Card module routes');

    const router = Router();

    // Register routes for the credit card module
    // Example routes would be added here when implementing this module

    // Mount the router on the app
    app.use('/api', router);
  }

  override async initialize(): Promise<void> {
    this.logger.info('Initializing Credit Card module');
    // Initialize any resources needed by the module
  }
}

/**
 * Plugin function to create and return a CreditCardModule
 * This can be loaded dynamically by the application
 */
export function createCreditCardPlugin(): BaseModule {
  return new CreditCardModule();
}
