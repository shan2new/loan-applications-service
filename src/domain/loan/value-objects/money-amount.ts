/**
 * MoneyAmount is a value object representing an amount of money with a specific currency.
 * It encapsulates the amount and currency code and ensures proper value formatting and validation.
 */
export class MoneyAmount {
  private readonly _amount: number;
  private readonly _currencyCode: string;

  constructor(amount: number, currencyCode = 'USD') {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this._currencyCode = currencyCode.toUpperCase();
  }

  get amount(): number {
    return this._amount;
  }

  get currencyCode(): string {
    return this._currencyCode;
  }

  /**
   * Format the money amount as a string with currency symbol
   */
  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currencyCode,
    }).format(this._amount);
  }

  /**
   * Add another money amount (must be same currency)
   */
  add(other: MoneyAmount): MoneyAmount {
    if (this._currencyCode !== other._currencyCode) {
      throw new Error('Cannot add money amounts with different currencies');
    }
    return new MoneyAmount(this._amount + other._amount, this._currencyCode);
  }

  /**
   * Subtract another money amount (must be same currency)
   */
  subtract(other: MoneyAmount): MoneyAmount {
    if (this._currencyCode !== other._currencyCode) {
      throw new Error('Cannot subtract money amounts with different currencies');
    }

    const newAmount = this._amount - other._amount;
    if (newAmount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    return new MoneyAmount(newAmount, this._currencyCode);
  }

  /**
   * Multiply the money amount by a factor
   */
  multiply(factor: number): MoneyAmount {
    if (factor < 0) {
      throw new Error('Cannot multiply by a negative factor');
    }
    return new MoneyAmount(this._amount * factor, this._currencyCode);
  }

  /**
   * Convert the money amount to a plain object for serialization
   */
  toJSON(): { amount: number; currencyCode: string } {
    return {
      amount: this._amount,
      currencyCode: this._currencyCode,
    };
  }

  /**
   * Check if two money amounts are equal
   */
  equals(other: MoneyAmount): boolean {
    return this._amount === other._amount && this._currencyCode === other._currencyCode;
  }
}
