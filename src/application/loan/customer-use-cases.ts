import { Customer } from '../../domain/loan/entities/customer';
import { ICustomerRepository } from '../../domain/loan/repositories/customer-repository.interface';
import { validate } from '../../shared/validation/validator';
import {
  CustomerAlreadyExistsError,
  CustomerNotFoundByIdError,
} from '../../shared/errors/domain-errors';
import { createLogger } from '../../shared/logging/logger';
import { customerSchemas } from '../../shared/validation/schemas';

/**
 * Use case for creating a new customer
 */
export class CreateCustomerUseCase {
  private readonly logger = createLogger('CreateCustomerUseCase');

  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(data: { fullName: string; email: string }): Promise<Customer> {
    this.logger.info('Creating new customer');

    // Validate input data
    const validData = validate(customerSchemas.create, data);

    // Check if customer with the same email already exists
    const existingCustomer = await this.customerRepository.findByEmail(validData.email);
    if (existingCustomer) {
      throw new CustomerAlreadyExistsError(validData.email);
    }

    // Create and save new customer
    const customer = new Customer(
      null, // ID will be assigned by the database
      validData.fullName,
      validData.email,
    );

    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.info({ customerId: savedCustomer.id }, 'Customer created successfully');

    return savedCustomer;
  }
}

/**
 * Use case for updating an existing customer
 */
export class UpdateCustomerUseCase {
  private readonly logger = createLogger('UpdateCustomerUseCase');

  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(id: string, data: { fullName?: string; email?: string }): Promise<Customer> {
    this.logger.info({ customerId: id }, 'Updating customer');

    // Validate input data
    const validData = validate(customerSchemas.update, data);

    // Find the customer
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomerNotFoundByIdError(id);
    }

    // Check if email is being updated and if it's already in use
    if (validData.email && validData.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(validData.email);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new CustomerAlreadyExistsError(validData.email);
      }
      customer.updateEmail(validData.email);
    }

    // Update full name if provided
    if (validData.fullName) {
      customer.updateFullName(validData.fullName);
    }

    // Save the updated customer
    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.info({ customerId: savedCustomer.id }, 'Customer updated successfully');

    return savedCustomer;
  }
}

/**
 * Use case for getting a customer by ID
 */
export class GetCustomerByIdUseCase {
  private readonly logger = createLogger('GetCustomerByIdUseCase');

  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<Customer> {
    this.logger.info({ customerId: id }, 'Getting customer by ID');

    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomerNotFoundByIdError(id);
    }

    return customer;
  }
}

/**
 * Use case for deleting a customer
 */
export class DeleteCustomerUseCase {
  private readonly logger = createLogger('DeleteCustomerUseCase');

  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<void> {
    this.logger.info({ customerId: id }, 'Deleting customer');

    // Check if customer exists
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      this.logger.warn({ customerId: id }, 'Customer not found for deletion');
      throw new CustomerNotFoundByIdError(id);
    }

    await this.customerRepository.delete(id);
  }
}

/**
 * Use case for listing customers with pagination
 */
export class ListCustomersUseCase {
  private readonly logger = createLogger('ListCustomersUseCase');

  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(
    params: { page?: number | undefined; pageSize?: number | undefined } = {},
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    const skip = (page - 1) * pageSize;

    this.logger.info({ page, pageSize }, 'Listing customers');

    const { customers, total } = await this.customerRepository.findAll(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return {
      customers,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
