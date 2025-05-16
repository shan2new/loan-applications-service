import { InvalidEmailError, InvalidNameError } from '@shared/errors/domain-errors';

/**
 * Customer entity representing a loan applicant
 */
export class Customer {
  constructor(
    private _id: number | null,
    private _fullName: string,
    private _email: string,
    private _createdAt: Date = new Date(),
  ) {
    this.validateEmail(_email);
    this.validateFullName(_fullName);
  }

  get id(): number | null {
    return this._id;
  }

  get fullName(): string {
    return this._fullName;
  }

  get email(): string {
    return this._email;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  /**
   * Update the customer's full name
   */
  updateFullName(fullName: string): void {
    this.validateFullName(fullName);
    this._fullName = fullName;
  }

  /**
   * Update the customer's email
   */
  updateEmail(email: string): void {
    this.validateEmail(email);
    this._email = email;
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(email);
    }
  }

  /**
   * Validate full name
   */
  private validateFullName(fullName: string): void {
    if (!fullName || fullName.trim().length < 2) {
      throw new InvalidNameError('Full name must be at least 2 characters long');
    }
    if (fullName.trim().length > 100) {
      throw new InvalidNameError('Full name must be at most 100 characters long');
    }
  }

  /**
   * Convert to a plain object for persistence
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      full_name: this._fullName,
      email: this._email,
      created_at: this._createdAt,
    };
  }

  /**
   * Create a Customer instance from a database record
   */
  static fromPersistence(data: {
    id: number;
    full_name: string;
    email: string;
    created_at: Date | string;
  }): Customer {
    const createdAt = data.created_at instanceof Date ? data.created_at : new Date(data.created_at);
    return new Customer(data.id, data.full_name, data.email, createdAt);
  }
}
