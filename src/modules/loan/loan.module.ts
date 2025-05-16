import { Express, Router } from 'express';
import { DependencyContainer, injectable, container } from 'tsyringe';
import { BaseModule } from '@core/module';
import { CustomerRepository } from '@infrastructure/loan/customer-repository';
import { LoanApplicationRepository } from '@infrastructure/loan/loan-application-repository';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { ILoanApplicationRepository } from '@domain/loan/repositories/loan-application-repository.interface';
import { CustomerController } from '@api/loan/customer-controller';
import { LoanApplicationController } from '@api/loan/loan-application-controller';
import { LoanCalculatorService } from '@domain/loan/services/LoanCalculatorService';

@injectable()
export class LoanModule extends BaseModule {
  readonly name = 'loan';

  registerDependencies(container: DependencyContainer): void {
    this.logger.info('Registering Loan module dependencies');

    // Register repositories
    container.register<ICustomerRepository>('ICustomerRepository', {
      useClass: CustomerRepository,
    });

    container.register<ILoanApplicationRepository>('ILoanApplicationRepository', {
      useClass: LoanApplicationRepository,
    });

    // Register services
    container.register(LoanCalculatorService, {
      useClass: LoanCalculatorService,
    });

    // Register controllers
    container.register(CustomerController, {
      useClass: CustomerController,
    });

    container.register(LoanApplicationController, {
      useClass: LoanApplicationController,
    });
  }

  registerRoutes(app: Express): void {
    this.logger.info('Registering Loan module routes');

    const router = Router();

    // Get controllers from DI container
    const customerController = container.resolve(CustomerController);
    const loanApplicationController = container.resolve(LoanApplicationController);

    // Register controller routes
    customerController.registerRoutes(router);
    loanApplicationController.registerRoutes(router);

    // Mount the router on the app
    app.use('/api', router);
  }

  override async initialize(): Promise<void> {
    this.logger.info('Initializing Loan module');
    // Nothing to initialize for now
  }
}
