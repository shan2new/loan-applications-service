import { MoneyAmount } from '../value-objects/money-amount';

/**
 * LoanApplication entity representing a customer's loan application
 */
export class LoanApplication {
  constructor(
    private _id: number | null,
    private _customerId: number,
    private _amount: MoneyAmount,
    private _termMonths: number,
    private _annualInterestRate: number,
    private _monthlyPayment: MoneyAmount,
    private _createdAt: Date = new Date(),
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
      throw new Error('Loan term must be between 1 and 360 months');
    }
  }

  /**
   * Validate interest rate
   */
  private validateInterestRate(rate: number): void {
    if (rate < 0 || rate > 100) {
      throw new Error('Annual interest rate must be between 0 and 100 percent');
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
   */
  static fromPersistence(data: {
    id: number;
    customer_id: number;
    amount: number | string;
    term_months: number;
    annual_interest_rate: number | string;
    monthly_payment: number | string;
    created_at: string;
  }): LoanApplication {
    return new LoanApplication(
      data.id,
      data.customer_id,
      new MoneyAmount(Number(data.amount)),
      data.term_months,
      Number(data.annual_interest_rate),
      new MoneyAmount(Number(data.monthly_payment)),
      new Date(data.created_at),
    );
  }
}
