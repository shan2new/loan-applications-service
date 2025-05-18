import { Customer } from '../../domain/loan/entities/customer';
import { LoanApplication } from '../../domain/loan/entities/loan-application';

/**
 * Customer Data Transfer Object for API responses
 */
export interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

/**
 * Loan Application Data Transfer Object for API responses
 */
export interface LoanApplicationDto {
  id: string;
  customerId: string;
  amount: string;
  termMonths: number;
  annualInterestRate: string;
  monthlyPayment: string;
  createdAt: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Convert a Customer entity to a CustomerDto
 */
export function toCustomerDto(customer: Customer): CustomerDto {
  return {
    id: customer.id as string,
    fullName: customer.fullName,
    email: customer.email,
    createdAt: customer.createdAt.toISOString(),
  };
}

/**
 * Convert a LoanApplication entity to a LoanApplicationDto
 */
export function toLoanApplicationDto(loanApplication: LoanApplication): LoanApplicationDto {
  return {
    id: loanApplication.id as string,
    customerId: loanApplication.customerId,
    amount: loanApplication.amount.amount.toFixed(2),
    termMonths: loanApplication.termMonths,
    annualInterestRate: loanApplication.annualInterestRate.toFixed(2),
    monthlyPayment: loanApplication.monthlyPayment.amount.toFixed(2),
    createdAt: loanApplication.createdAt.toISOString(),
  };
}
