import { LoanApplication } from '../entities/loan-application';

/**
 * Repository interface for LoanApplication entity
 */
export interface ILoanApplicationRepository {
  /**
   * Find a loan application by ID
   * @param id Loan application ID
   */
  findById(id: number): Promise<LoanApplication | null>;

  /**
   * Save a loan application (create or update)
   * @param loanApplication Loan application entity
   */
  save(loanApplication: LoanApplication): Promise<LoanApplication>;

  /**
   * Find all loan applications with optional pagination
   * @param skip Number of records to skip
   * @param take Maximum number of records to return
   */
  findAll(
    skip?: number,
    take?: number,
  ): Promise<{ loanApplications: LoanApplication[]; total: number }>;

  /**
   * Find loan applications by customer ID
   * @param customerId Customer ID
   * @param skip Number of records to skip
   * @param take Maximum number of records to return
   */
  findByCustomerId(
    customerId: number,
    skip?: number,
    take?: number,
  ): Promise<{ loanApplications: LoanApplication[]; total: number }>;

  /**
   * Delete a loan application by ID
   * @param id Loan application ID
   */
  delete(id: number): Promise<void>;
}
