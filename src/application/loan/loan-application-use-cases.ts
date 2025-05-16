import { LoanApplication } from '../../domain/loan/entities/loan-application';
import { ILoanApplicationRepository } from '../../domain/loan/repositories/loan-application-repository.interface';
import { ICustomerRepository } from '../../domain/loan/repositories/customer-repository.interface';
import { validate } from '../../shared/validation/validator';
import { createLogger } from '../../shared/logging/logger';
import { MoneyAmount } from '../../domain/loan/value-objects/money-amount';
import { loanApplicationSchemas } from '../../shared/validation/schemas';
import {
  CustomerNotFoundByIdError,
  LoanApplicationNotFoundError,
} from '../../shared/errors/domain-errors';

/**
 * Use case for creating a new loan application
 */
export class CreateLoanApplicationUseCase {
  private readonly logger = createLogger('CreateLoanApplicationUseCase');

  constructor(
    private readonly loanApplicationRepository: ILoanApplicationRepository,
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(data: {
    customerId: number;
    amount: number;
    termMonths: number;
    annualInterestRate: number;
  }): Promise<LoanApplication> {
    this.logger.info('Creating new loan application');

    // Validate input data
    const validData = validate(loanApplicationSchemas.create, data);

    // Check if customer exists
    const customer = await this.customerRepository.findById(validData.customerId);
    if (!customer) {
      throw new CustomerNotFoundByIdError(validData.customerId);
    }

    // Create money amount for the loan
    const loanAmount = new MoneyAmount(validData.amount);

    // Calculate monthly payment
    const monthlyPayment = LoanApplication.calculateMonthlyPayment(
      loanAmount,
      validData.termMonths,
      validData.annualInterestRate,
    );

    // Create and save new loan application
    const loanApplication = new LoanApplication(
      null, // ID will be assigned by the database
      validData.customerId,
      loanAmount,
      validData.termMonths,
      validData.annualInterestRate,
      monthlyPayment,
    );

    const savedLoanApplication = await this.loanApplicationRepository.save(loanApplication);
    this.logger.info(
      { loanApplicationId: savedLoanApplication.id, customerId: validData.customerId },
      'Loan application created successfully',
    );

    return savedLoanApplication;
  }
}

/**
 * Use case for getting a loan application by ID
 */
export class GetLoanApplicationByIdUseCase {
  private readonly logger = createLogger('GetLoanApplicationByIdUseCase');

  constructor(private readonly loanApplicationRepository: ILoanApplicationRepository) {}

  async execute(id: number): Promise<LoanApplication> {
    this.logger.info({ loanApplicationId: id }, 'Getting loan application by ID');

    const loanApplication = await this.loanApplicationRepository.findById(id);
    if (!loanApplication) {
      throw new LoanApplicationNotFoundError(id);
    }

    return loanApplication;
  }
}

/**
 * Use case for getting loan applications by customer ID
 */
export class GetLoanApplicationsByCustomerIdUseCase {
  private readonly logger = createLogger('GetLoanApplicationsByCustomerIdUseCase');

  constructor(
    private readonly loanApplicationRepository: ILoanApplicationRepository,
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    customerId: number,
    params: { page?: number | undefined; pageSize?: number | undefined } = {},
  ): Promise<{
    loanApplications: LoanApplication[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    this.logger.info({ customerId }, 'Getting loan applications by customer ID');

    // Check if customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundByIdError(customerId);
    }

    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const skip = (page - 1) * pageSize;

    const { loanApplications, total } = await this.loanApplicationRepository.findByCustomerId(
      customerId,
      skip,
      pageSize,
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      loanApplications,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}

/**
 * Use case for listing all loan applications with pagination
 */
export class ListLoanApplicationsUseCase {
  private readonly logger = createLogger('ListLoanApplicationsUseCase');

  constructor(private readonly loanApplicationRepository: ILoanApplicationRepository) {}

  async execute(
    params: { page?: number | undefined; pageSize?: number | undefined } = {},
  ): Promise<{
    loanApplications: LoanApplication[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const skip = (page - 1) * pageSize;

    this.logger.info({ page, pageSize }, 'Listing loan applications');

    const { loanApplications, total } = await this.loanApplicationRepository.findAll(
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);

    return {
      loanApplications,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
