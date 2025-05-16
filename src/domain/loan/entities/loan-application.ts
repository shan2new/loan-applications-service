import { MoneyAmount } from '../value-objects/money-amount';
import { InvalidTermError, InvalidInterestRateError } from '@shared/errors/domain-errors';
import { Decimal } from '@prisma/client/runtime/library';

type NumberField = number | Decimal | string;

/**
 * LoanApplication entity representing a customer's loan application
 */
export class LoanApplication {
  constructor(
    private readonly _id: number | null,
    private readonly _customerId: number,
    private readonly _amount: MoneyAmount,
    private readonly _termMonths: number,
    private readonly _annualInterestRate: number,
    private readonly _monthlyPayment: MoneyAmount,
    private readonly _createdAt: Date = new Date(),
  ) {
    this.validateTermMonths(_termMonths);
    this.validateInterestRate(_annualInterestRate);
  }

  get id(): number | null {
    return this._id;
  }

  get customerId(): number {
    return this._customerId;
  }

  get amount(): MoneyAmount {
    return this._amount;
  }

  get termMonths(): number {
    return this._termMonths;
  }

  get annualInterestRate(): number {
    return this._annualInterestRate;
  }

  get monthlyPayment(): MoneyAmount {
    return this._monthlyPayment;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  /**
   * Calculate monthly payment based on loan amount, term, and interest rate
   * Formula: PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
   * Where:
   * - PMT = monthly payment
   * - P = principal (loan amount)
   * - r = monthly interest rate (annual rate / 12 / 100)
   * - n = loan term in months
   */
  static calculateMonthlyPayment(
    loanAmount: MoneyAmount,
    termMonths: number,
    annualInterestRate: number,
  ): MoneyAmount {
    const monthlyRate = annualInterestRate / 12 / 100;

    // If interest rate is zero, simple division
    if (monthlyRate === 0) {
      return new MoneyAmount(loanAmount.amount / termMonths, loanAmount.currencyCode);
    }

    // Calculate monthly payment using the formula
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    const monthlyPayment = loanAmount.amount * (numerator / denominator);

    return new MoneyAmount(monthlyPayment, loanAmount.currencyCode);
  }

  /**
   * Validate loan term in months
   */
  private validateTermMonths(termMonths: number): void {
    if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 360) {
      throw new InvalidTermError(termMonths);
    }
  }

  /**
   * Validate interest rate
   */
  private validateInterestRate(rate: number): void {
    if (rate < 0 || rate > 100) {
      throw new InvalidInterestRateError(rate);
    }
  }

  /**
   * Convert to a plain object for persistence
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      customer_id: this._customerId,
      amount: this._amount.amount,
      term_months: this._termMonths,
      annual_interest_rate: this._annualInterestRate,
      monthly_payment: this._monthlyPayment.amount,
      created_at: this._createdAt,
    };
  }

  /**
   * Create a LoanApplication instance from a database record
   * Handles both primitive types and Prisma's Decimal type
   */
  static fromPersistence(data: {
    id: number;
    customer_id: number;
    amount: NumberField;
    term_months: number;
    annual_interest_rate: NumberField;
    monthly_payment: NumberField;
    created_at: Date | string;
  }): LoanApplication {
    // Convert any type to number safely
    const toNumber = (value: NumberField): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return Number(value);
      // Handle Prisma Decimal type
      return value.toNumber();
    };

    // Convert date to proper Date object
    const createdAt = data.created_at instanceof Date ? data.created_at : new Date(data.created_at);

    return new LoanApplication(
      data.id,
      data.customer_id,
      new MoneyAmount(toNumber(data.amount)),
      data.term_months,
      toNumber(data.annual_interest_rate),
      new MoneyAmount(toNumber(data.monthly_payment)),
      createdAt,
    );
  }
}
