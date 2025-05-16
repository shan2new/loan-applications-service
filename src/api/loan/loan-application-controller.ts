import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { inject, injectable } from 'tsyringe';
import { validate } from '@shared/validation/validator';
import {
  GetLoanApplicationByIdUseCase,
  GetLoanApplicationsByCustomerIdUseCase,
  ListLoanApplicationsUseCase,
} from '@application/loan/loan-application-use-cases';
import { CreateLoanApplicationUseCase } from '@application/loan/use-cases/CreateLoanApplicationUseCase';
import { ILoanApplicationRepository } from '@domain/loan/repositories/loan-application-repository.interface';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { PaginationMeta, toLoanApplicationDto } from './dtos';
import { createLogger } from '@shared/logging/logger';
import { LoanCalculatorService } from '@domain/loan/services/LoanCalculatorService';

@injectable()
export class LoanApplicationController {
  private readonly logger = createLogger('LoanApplicationController');

  private readonly createLoanApplicationUseCase: CreateLoanApplicationUseCase;
  private readonly getLoanApplicationByIdUseCase: GetLoanApplicationByIdUseCase;
  private readonly getLoanApplicationsByCustomerIdUseCase: GetLoanApplicationsByCustomerIdUseCase;
  private readonly listLoanApplicationsUseCase: ListLoanApplicationsUseCase;

  // Validation schemas
  private readonly createLoanApplicationSchema = z.object({
    customerId: z.number().int().positive(),
    amount: z.number().positive(),
    termMonths: z.number().int().min(1).max(360),
    annualInterestRate: z.number().min(0).max(100),
  });

  private readonly paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
  });

  constructor(
    @inject('ILoanApplicationRepository') loanApplicationRepository: ILoanApplicationRepository,
    @inject('ICustomerRepository') customerRepository: ICustomerRepository,
    @inject(LoanCalculatorService) loanCalculatorService: LoanCalculatorService,
  ) {
    this.createLoanApplicationUseCase = new CreateLoanApplicationUseCase(
      loanApplicationRepository,
      customerRepository,
      loanCalculatorService,
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
  private async createLoanApplication(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = validate(this.createLoanApplicationSchema, req.body);
      const loanApplication = await this.createLoanApplicationUseCase.execute(data);

      res.status(201).json({
        data: toLoanApplicationDto(loanApplication),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a loan application by ID
  private async getLoanApplicationById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            message: 'Invalid loan application ID',
          },
        });
        return;
      }

      const loanApplication = await this.getLoanApplicationByIdUseCase.execute(id);

      res.status(200).json({
        data: toLoanApplicationDto(loanApplication),
      });
    } catch (error) {
      next(error);
    }
  }

  // List all loan applications
  private async listLoanApplications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const queryParams = validate(this.paginationSchema, req.query);

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
      next(error);
    }
  }

  // Get loan applications by customer ID
  private async getLoanApplicationsByCustomerId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const customerId = parseInt(req.params.customerId as string, 10);

      if (isNaN(customerId)) {
        res.status(400).json({
          error: {
            message: 'Invalid customer ID',
          },
        });
        return;
      }

      const queryParams = validate(this.paginationSchema, req.query);

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
      next(error);
    }
  }
}
