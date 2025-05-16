import 'reflect-metadata'; // Required for tsyringe
import { Application } from '@core/app';
import { LoanModule } from '@modules/loan';
import { createLogger } from '@shared/logging/logger';

const appLogger = createLogger('Main');

// Create the application
const app = new Application();

// Register modules
app.registerModules([LoanModule]);

// Initialize the application
app
  .initialize()
  .then(() => {
    // Start the application
    app.start();
    appLogger.info('Application started successfully');
  })
  .catch(error => {
    appLogger.fatal({ error }, 'Failed to start application');
    process.exit(1);
  });

export default app.getExpressApp();
