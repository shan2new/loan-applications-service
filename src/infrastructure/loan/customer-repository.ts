import { injectable, inject } from 'tsyringe';
import { PrismaClientManager } from './prisma-client-manager';
import { Customer } from '@domain/loan/entities/customer';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { createLogger } from '@shared/logging/logger';

/**
 * Prisma implementation of the Customer repository
 */
@injectable()
export class CustomerRepository implements ICustomerRepository {
  private readonly logger = createLogger('CustomerRepository');
  private readonly prisma;

  constructor(@inject(PrismaClientManager) prismaManager: PrismaClientManager) {
    this.prisma = prismaManager.getClient();
  }

  async findById(id: number): Promise<Customer | null> {
    this.logger.debug({ customerId: id }, 'Finding customer by ID');

    const customerData = await this.prisma.customer.findUnique({
      where: { id },
    });

    return customerData ? Customer.fromPersistence(customerData) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    this.logger.debug({ email }, 'Finding customer by email');

    const customerData = await this.prisma.customer.findUnique({
      where: { email },
    });

    return customerData ? Customer.fromPersistence(customerData) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const customerData = customer.toJSON();

    if (customer.id) {
      // Update existing customer
      this.logger.debug({ customerId: customer.id }, 'Updating customer');

      const updatedData = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          full_name: customerData.full_name as string,
          email: customerData.email as string,
        },
      });

      return Customer.fromPersistence(updatedData);
    } else {
      // Create new customer
      this.logger.debug('Creating new customer');

      const createdData = await this.prisma.customer.create({
        data: {
          full_name: customerData.full_name as string,
          email: customerData.email as string,
        },
      });

      return Customer.fromPersistence(createdData);
    }
  }

  async findAll(skip = 0, take = 10): Promise<{ customers: Customer[]; total: number }> {
    this.logger.debug({ skip, take }, 'Finding all customers with pagination');

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      customers: customers.map(customer => Customer.fromPersistence(customer)),
      total,
    };
  }

  async delete(id: number): Promise<void> {
    this.logger.debug({ customerId: id }, 'Deleting customer');

    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
