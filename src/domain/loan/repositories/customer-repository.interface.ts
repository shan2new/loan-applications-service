import { Customer } from '../entities/customer';

/**
 * Repository interface for Customer entity
 */
export interface ICustomerRepository {
  /**
   * Find a customer by ID
   * @param id Customer ID
   */
  findById(id: number): Promise<Customer | null>;

  /**
   * Find a customer by email
   * @param email Customer email
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Save a customer (create or update)
   * @param customer Customer entity
   */
  save(customer: Customer): Promise<Customer>;

  /**
   * Find all customers with optional pagination
   * @param skip Number of records to skip
   * @param take Maximum number of records to return
   */
  findAll(skip?: number, take?: number): Promise<{ customers: Customer[]; total: number }>;

  /**
   * Delete a customer by ID
   * @param id Customer ID
   */
  delete(id: number): Promise<void>;
}
