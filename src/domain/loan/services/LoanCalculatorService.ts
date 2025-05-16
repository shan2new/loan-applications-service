import { MoneyAmount } from '@domain/loan/value-objects/money-amount';

/**
 * Service for calculating loan-related financial metrics
 */
export class LoanCalculatorService {
  /**
   * Calculate the monthly payment for a loan
   *
   * @param amount The loan amount
   * @param annualInterestRate The annual interest rate (percentage)
   * @param termMonths The loan term in months
   * @returns The calculated monthly payment
   */
  calculateMonthlyPayment(
    amount: MoneyAmount,
    annualInterestRate: number,
    termMonths: number,
  ): MoneyAmount {
    // TODO: Add validation for negative amounts
    // TODO: Add validation for term length (min/max)
    // TODO: Add validation for interest rate ranges

    const monthlyRate = annualInterestRate / 12 / 100;

    // If interest rate is zero, simple division
    if (monthlyRate === 0) {
      return new MoneyAmount(amount.amount / termMonths, amount.currencyCode);
    }

    // Calculate monthly payment using the formula
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    const monthlyPayment = amount.amount * (numerator / denominator);

    return new MoneyAmount(monthlyPayment, amount.currencyCode);
  }
}
