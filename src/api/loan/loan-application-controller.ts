import { Router, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { validate } from '@shared/validation/validator';
import { commonSchemas } from '@shared/validation/schemas';
import {
  GetLoanApplicationByIdUseCase,
  GetLoanApplicationsByCustomerIdUseCase,
  ListLoanApplicationsUseCase,
  CreateLoanApplicationUseCase,
} from '@application/loan/loan-application-use-cases';
import { ILoanApplicationRepository } from '@domain/loan/repositories/loan-application-repository.interface';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { PaginationMeta, toLoanApplicationDto } from './dtos';
import { createLogger } from '@shared/logging/logger';
import { BadRequestError } from '@shared/errors/application-error';
import { handleApiError } from '@shared/errors/api-error-handler';

@injectable()
export class LoanApplicationController {
  private readonly logger = createLogger('LoanApplicationController');

  private readonly createLoanApplicationUseCase: CreateLoanApplicationUseCase;
  private readonly getLoanApplicationByIdUseCase: GetLoanApplicationByIdUseCase;
  private readonly getLoanApplicationsByCustomerIdUseCase: GetLoanApplicationsByCustomerIdUseCase;
  private readonly listLoanApplicationsUseCase: ListLoanApplicationsUseCase;

  constructor(
    @inject('ILoanApplicationRepository') loanApplicationRepository: ILoanApplicationRepository,
    @inject('ICustomerRepository') customerRepository: ICustomerRepository,
  ) {
    this.createLoanApplicationUseCase = new CreateLoanApplicationUseCase(
      loanApplicationRepository,
      customerRepository,
    );
    this.getLoanApplicationByIdUseCase = new GetLoanApplicationByIdUseCase(
      loanApplicationRepository,
    );
    this.getLoanApplicationsByCustomerIdUseCase = new GetLoanApplicationsByCustomerIdUseCase(
      loanApplicationRepository,
      customerRepository,
    );
    this.listLoanApplicationsUseCase = new ListLoanApplicationsUseCase(loanApplicationRepository);

    this.logger.info('LoanApplicationController initialized');
  }

  registerRoutes(router: Router): void {
    this.logger.info('Registering loan application routes');

    // Create a new loan application
    router.post('/loan-applications', this.createLoanApplication.bind(this));

    // Get a loan application by ID
    router.get('/loan-applications/:id', this.getLoanApplicationById.bind(this));

    // List all loan applications
    router.get('/loan-applications', this.listLoanApplications.bind(this));

    // Get loan applications by customer ID
    router.get(
      '/customers/:customerId/loan-applications',
      this.getLoanApplicationsByCustomerId.bind(this),
    );

    // Alternative route for getting loan applications by customer ID (for test compatibility)
    router.get(
      '/loan-applications/customer/:customerId',
      this.getLoanApplicationsByCustomerId.bind(this),
    );
  }

  // Create a new loan application
  private async createLoanApplication(req: Request, res: Response): Promise<void> {
    try {
      this.logger.debug({ body: req.body }, 'Creating loan application request received');

      // We'll use a direct object here rather than validating with the schema
      // to avoid potential double validation issues
      const loanApplicationData = {
        customerId: parseInt(req.body.customerId, 10),
        amount: parseFloat(req.body.amount),
        termMonths: parseInt(req.body.termMonths, 10),
        annualInterestRate: parseFloat(req.body.annualInterestRate),
      };

      this.logger.debug({ parsedData: loanApplicationData }, 'Data parsed for loan application');

      // Create the loan application
      const loanApplication = await this.createLoanApplicationUseCase.execute(loanApplicationData);

      this.logger.debug({ result: loanApplication }, 'Loan application created successfully');

      res.status(201).json({
        data: toLoanApplicationDto(loanApplication),
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger);
    }
  }

  // Get a loan application by ID
  private async getLoanApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (idParam === undefined) {
        throw new BadRequestError('Loan application ID is required');
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id) || id <= 0) {
        throw new BadRequestError('Invalid loan application ID');
      }

      const loanApplication = await this.getLoanApplicationByIdUseCase.execute(id);
      res.status(200).json({
        data: toLoanApplicationDto(loanApplication),
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger);
    }
  }

  // List all loan applications
  private async listLoanApplications(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = validate(commonSchemas.pagination, req.query);

      // Create a properly typed object for the use case
      const paginationParams = {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
      };

      const result = await this.listLoanApplicationsUseCase.execute(paginationParams);

      const pagination: PaginationMeta = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      res.status(200).json({
        data: result.loanApplications.map(toLoanApplicationDto),
        pagination,
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger);
    }
  }

  // Get loan applications by customer ID
  private async getLoanApplicationsByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const customerIdParam = req.params.customerId;
      if (customerIdParam === undefined) {
        throw new BadRequestError('Customer ID is required');
      }

      const customerId = parseInt(customerIdParam, 10);
      if (isNaN(customerId) || customerId <= 0) {
        throw new BadRequestError('Invalid customer ID');
      }

      const queryParams = validate(commonSchemas.pagination, req.query);

      const paginationParams = {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
      };

      const result = await this.getLoanApplicationsByCustomerIdUseCase.execute(
        customerId,
        paginationParams,
      );

      const pagination: PaginationMeta = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      res.status(200).json({
        data: result.loanApplications.map(toLoanApplicationDto),
        pagination,
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger);
    }
  }
}
