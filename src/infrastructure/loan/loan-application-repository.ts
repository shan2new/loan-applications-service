import { injectable, inject } from 'tsyringe';
import { PrismaClientManager } from './prisma-client-manager';
import { LoanApplication } from '@domain/loan/entities/loan-application';
import { ILoanApplicationRepository } from '@domain/loan/repositories/loan-application-repository.interface';
import { createLogger } from '@shared/logging/logger';

/**
 * Prisma implementation of the LoanApplication repository
 */
@injectable()
export class LoanApplicationRepository implements ILoanApplicationRepository {
  private readonly logger = createLogger('LoanApplicationRepository');
  private readonly prisma;

  constructor(@inject(PrismaClientManager) prismaManager: PrismaClientManager) {
    this.prisma = prismaManager.getClient();
  }

  async findById(id: number): Promise<LoanApplication | null> {
    this.logger.debug({ loanApplicationId: id }, 'Finding loan application by ID');

    const loanApplicationData = await this.prisma.loanApplication.findUnique({
      where: { id },
    });

    return loanApplicationData ? LoanApplication.fromPersistence(loanApplicationData) : null;
  }

  async save(loanApplication: LoanApplication): Promise<LoanApplication> {
    const loanApplicationData = loanApplication.toJSON();

    if (loanApplication.id) {
      // Update existing loan application
      this.logger.debug({ loanApplicationId: loanApplication.id }, 'Updating loan application');

      const updatedData = await this.prisma.loanApplication.update({
        where: { id: loanApplication.id },
        data: {
          customer_id: loanApplicationData.customer_id as number,
          amount: loanApplicationData.amount as number,
          term_months: loanApplicationData.term_months as number,
          annual_interest_rate: loanApplicationData.annual_interest_rate as number,
          monthly_payment: loanApplicationData.monthly_payment as number,
        },
      });

      return LoanApplication.fromPersistence(updatedData);
    } else {
      // Create new loan application
      this.logger.debug('Creating new loan application');

      const createdData = await this.prisma.loanApplication.create({
        data: {
          customer_id: loanApplicationData.customer_id as number,
          amount: loanApplicationData.amount as number,
          term_months: loanApplicationData.term_months as number,
          annual_interest_rate: loanApplicationData.annual_interest_rate as number,
          monthly_payment: loanApplicationData.monthly_payment as number,
        },
      });

      return LoanApplication.fromPersistence(createdData);
    }
  }

  async findAll(
    skip = 0,
    take = 10,
  ): Promise<{ loanApplications: LoanApplication[]; total: number }> {
    this.logger.debug({ skip, take }, 'Finding all loan applications with pagination');

    const [loanApplications, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.loanApplication.count(),
    ]);

    return {
      loanApplications: loanApplications.map(app => LoanApplication.fromPersistence(app)),
      total,
    };
  }

  async findByCustomerId(
    customerId: number,
    skip = 0,
    take = 10,
  ): Promise<{ loanApplications: LoanApplication[]; total: number }> {
    this.logger.debug(
      { customerId, skip, take },
      'Finding loan applications by customer ID with pagination',
    );

    const [loanApplications, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where: { customer_id: customerId },
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.loanApplication.count({
        where: { customer_id: customerId },
      }),
    ]);

    return {
      loanApplications: loanApplications.map(app => LoanApplication.fromPersistence(app)),
      total,
    };
  }

  async delete(id: number): Promise<void> {
    this.logger.debug({ loanApplicationId: id }, 'Deleting loan application');

    await this.prisma.loanApplication.delete({
      where: { id },
    });
  }
}
