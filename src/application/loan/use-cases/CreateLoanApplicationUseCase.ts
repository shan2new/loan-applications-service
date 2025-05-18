import { LoanCalculatorService } from '@domain/loan/services/LoanCalculatorService';
import { ILoanApplicationRepository } from '@domain/loan/repositories/loan-application-repository.interface';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { LoanApplication } from '@domain/loan/entities/loan-application';
import { MoneyAmount } from '@domain/loan/value-objects/money-amount';
import { CustomerNotFoundError } from '@shared/errors/application-error';
import { createLogger } from '@shared/logging/logger';
import { z } from 'zod';
import { validate } from '@shared/validation/validator';
import { isValidUUID } from '@shared/validation/uuid-utils';

interface CreateLoanApplicationRequest {
  customerId: string;
  amount: number;
  termMonths: number;
  annualInterestRate: number;
}

// Input validation schema
const createLoanApplicationSchema = z.object({
  customerId: z.string().refine(id => isValidUUID(id), {
    message: 'Invalid UUID format for customerId',
  }),
  amount: z.number().positive(),
  termMonths: z.number().int().min(1).max(360),
  annualInterestRate: z.number().min(0).max(100),
});

/**
 * Use case for creating a new loan application
 */
export class CreateLoanApplicationUseCase {
  private readonly logger = createLogger('CreateLoanApplicationUseCase');

  constructor(
    private readonly loanApplicationRepository: ILoanApplicationRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly loanCalculator: LoanCalculatorService,
  ) {}

  /**
   * Execute the use case to create a new loan application
   *
   * @param request The loan application request data
   * @returns The created loan application
   */
  async execute(request: CreateLoanApplicationRequest): Promise<LoanApplication> {
    this.logger.info({ customerId: request.customerId }, 'Creating new loan application');

    // Validate input data
    const validatedData = validate(createLoanApplicationSchema, request);

    // Verify that the customer exists
    const customer = await this.customerRepository.findById(validatedData.customerId);
    if (!customer) {
      this.logger.error({ customerId: validatedData.customerId }, 'Customer not found');
      throw new CustomerNotFoundError(`Customer with ID ${validatedData.customerId} not found`);
    }

    // Create money amount for the loan
    const loanAmount = new MoneyAmount(validatedData.amount);

    // Calculate monthly payment
    const monthlyPayment = this.loanCalculator.calculateMonthlyPayment(
      loanAmount,
      validatedData.annualInterestRate,
      validatedData.termMonths,
    );

    // Create a new loan application entity
    const loanApplication = new LoanApplication(
      null, // ID will be assigned by the database
      validatedData.customerId,
      loanAmount,
      validatedData.termMonths,
      validatedData.annualInterestRate,
      monthlyPayment,
    );

    // Save the loan application in the repository
    const savedLoanApplication = await this.loanApplicationRepository.save(loanApplication);

    this.logger.info(
      { loanApplicationId: savedLoanApplication.id, customerId: validatedData.customerId },
      'Loan application created successfully',
    );

    return savedLoanApplication;
  }
}
